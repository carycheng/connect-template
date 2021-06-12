import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Image, Spinner } from 'react-bootstrap';
import { ArrowBarLeft, CalendarCheck, GiftFill } from 'react-bootstrap-icons';
import { CardElement } from "@stripe/react-stripe-js";
import axios from 'axios';

import '../public/styles/Checkout.css';

class Checkout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            productPrice: 0,
            recurringProductPrice: 0,
            recurringProductPriceId: null,
            connectedAccountId: null,
            email: '',
            name: '',
            payStateActive: false,
            checkoutComplete: false,
            paymentIntentPrice: 0,
            receiptUrl: null
        };
        this.handleCheckedState = this.handleCheckedState.bind(this);
        this.changeEmail = this.changeEmail.bind(this);
        this.changeName = this.changeName.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    handleCheckedState() {
        this.setState({ checked: !this.state.checked})
    }

    changeEmail(event) {
        console.log(this.state.email);
        this.setState({
            email: event.target.value
        });
    }

    changeName(event) {
        console.log(this.state.name);
        this.setState({
            name: event.target.value
        });
    }

    componentDidMount() {
        this.setState({ checkoutComplete: false })
        this.setState({ receiptUrl: null})
        console.log('Lister ID: ', this.props.product.lister_id);
        this.setState({ connectedAccountId: this.props.product.lister_id })
        let productInfo = null;
        let paymentIntent = null;
        (async () => {
            productInfo = await axios.post('/api/v1/get-product-info', this.props.product)
            console.log('product info', productInfo);
            this.setState({ paymentIntentPrice: productInfo.data.body.oneTimePrice.unit_amount })
            this.setState({ productPrice: productInfo.data.body.oneTimePrice.unit_amount / 100 });
            this.setState({ recurringProductPrice: productInfo.data.body.recurringPrice.unit_amount / 100 })
            this.setState({ recurringProductPriceId: productInfo.data.body.recurringPrice.id})
        })()
    }

    onSubmit = async event => {
        event.preventDefault();
        this.setState({ payStateActive: true })
        const {stripe, elements} = this.props;

        if (!stripe || !elements) {
            console.log('error');
            return;
        }
        const cardElement = elements.getElement(CardElement);

        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (this.state.checked) {
            
            const subscriptionCustomer = {
                email: this.state.email,
                name: this.state.name,
                payment_method: paymentMethod.id
            }

            const subscribedCustomer = await axios.post('/api/v1/attach-payment-method', subscriptionCustomer);

            const subSchedule = {
                customer: subscribedCustomer.data.body.customer,
                price_id: this.state.recurringProductPriceId,
                connected_account_id: this.state.connectedAccountId,
                payment_method: paymentMethod.id
            }

            await axios.post('/api/v1/create-installment-plan', subSchedule);

        } else {
            const paymentIntent = await axios.post('/api/v1/create-payment-intent', {amount: this.state.paymentIntentPrice, connected_account_id: this.state.connectedAccountId });

            const response = await stripe
                .confirmCardPayment(paymentIntent.data.body.client_secret, {
                    payment_method: {
                        card: cardElement
                    },
                });

            const receiptUrl = await axios.post('/api/v1/get-receipt-url', {payment_intent_id: response.paymentIntent.id});

            console.log(receiptUrl);

            this.setState({ receiptUrl: receiptUrl.data.body});

            const customer = {
                email: this.state.email,
                name: this.state.name,
                payment_method: paymentMethod.id
            }

            const customerResponse = await axios.post('/api/v1/attach-payment-method', customer);
        }

        this.setState({ checkoutComplete: true })
    }
    
    render() {
        const content = this.state.checked
            ? <div><CalendarCheck className="icon-align"/><span className="nav-text">Pay in 4 easy installments of ${ this.state.recurringProductPrice } / month </span></div>
            : null;

        const receiptContent = this.state.receiptUrl
            ? <a href={this.state.receiptUrl} target="_"><GiftFill className="gift-fill-style"/>Copy of your receipt</a>
            : <Link to="/">Continue Shopping?</Link>
        return(
                <div>
                    <div class="split left">
                        <Link to="/"><ArrowBarLeft className="arrow-style" size="25px"/></Link>
                        <div class="info">
                            <div class="price">
                                <Image className="checkout-img-body" src={this.props.product.image_url} rounded />
                                <span>${this.state.productPrice}.00</span>
                                <span>{this.props.product.name}</span>
                            </div>
                        </div>
                    </div>
                    <div class="split right">
                        {(this.state.checkoutComplete === false) ? (
                        <div class="form centered">
                            <div className="payment-form-name">Payment information</div>
                            <form onSubmit={this.onSubmit}>
                                <section className="payment-form-width">
                                    <h7>Shipping &amp; Billing Information</h7>
                                    <fieldset class="with-state">
                                        <label>
                                            <span>Name</span>
                                            <input onChange={this.changeName} value={this.state.name} name="name" class="field" placeholder="Jenny Rosen" required />
                                        </label>
                                        <label>
                                            <span>Email</span>
                                            <input onChange={this.changeEmail} value={this.state.email} name="email" type="email" class="field" placeholder="jenny@example.com" required />
                                        </label>
                                        <label>
                                            <span>Address</span>
                                            <input name="address" class="field" placeholder="185 Berry Street Suite 550" />
                                        </label>
                                        <label class="city">
                                            <span>City</span>
                                            <input name="city" class="field" placeholder="San Francisco" />
                                        </label>
                                        <label class="state">
                                            <span>State</span>
                                            <input name="state" class="field" placeholder="CA" />
                                        </label>
                                        <label class="zip">
                                            <span>ZIP</span>
                                            <input name="postal_code" class="field" placeholder="94107" />
                                        </label>
                                        <label class="select">
                                            <span>Country</span>
                                            <div id="country" class="field US">
                                                <select name="country">
                                                    <option value="AU">Australia</option>
                                                    <option value="AT">Austria</option>
                                                    <option value="BE">Belgium</option>
                                                    <option value="BR">Brazil</option>
                                                    <option value="CA">Canada</option>
                                                    <option value="CN">China</option>
                                                    <option value="DK">Denmark</option>
                                                    <option value="FI">Finland</option>
                                                    <option value="FR">France</option>
                                                    <option value="DE">Germany</option>
                                                    <option value="HK">Hong Kong</option>
                                                    <option value="IE">Ireland</option>
                                                    <option value="IT">Italy</option>
                                                    <option value="JP">Japan</option>
                                                    <option value="LU">Luxembourg</option>
                                                    <option value="MY">Malaysia</option>
                                                    <option value="MX">Mexico</option>
                                                    <option value="NL">Netherlands</option>
                                                    <option value="NZ">New Zealand</option>
                                                    <option value="NO">Norway</option>
                                                    <option value="PL">Poland</option>
                                                    <option value="PT">Portugal</option>
                                                    <option value="SG">Singapore</option>
                                                    <option value="ES">Spain</option>
                                                    <option value="SE">Sweden</option>
                                                    <option value="CH">Switzerland</option>
                                                    <option value="GB">United Kingdom</option>
                                                    <option value="US" selected="selected">United States</option>
                                                </select>
                                        </div>
                                        </label>
                                    </fieldset>
                                </section>
                                <div className="checkboxes">
                                    <label><input type="checkbox" onChange={this.handleCheckedState}/> <span>Pay with installment plan</span></label>
                                </div>
                                {content}
                                <h7 className="payment-info-style">Payment Information</h7>
                                <CardElement className="card-element-style" />

                                {this.state.payStateActive ? (  
                                    <Button type="submit" variant="primary" className="button-style" size="md" disabled>
                                        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" /></Button>) :
                                (<Button type="submit" variant="primary" className="button-style" size="md" active>Pay Now</Button>)}
                            </form>
                        </div>) : (
                            <div className="form thank-you-message-style playfair-font-family">
                                <div className="thank-you-message-font-size">
                                    Thank you!
                                </div>
                                <div>
                                    Your item is on its way!
                                </div>
                                <div className="continue-style">
                                    { receiptContent }
                                </div>
                            </div>)   
                        }
                    </div>
                </div>
        );
    }
}

const mapStateToProps = (state) => {
    return { product: state.product }
};

export default connect(mapStateToProps, null, null)(Checkout);