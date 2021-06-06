import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { ArrowBarLeft, CalendarCheck } from 'react-bootstrap-icons';
import { CardElement } from "@stripe/react-stripe-js";

import '../public/styles/Checkout.css';

class Checkout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false
        };
        this.handleCheckedState = this.handleCheckedState.bind(this);
    }

    handleCheckedState() {
        this.setState({ checked: !this.state.checked})
    }
    
    render() {
        const content = this.state.checked
            ? <div><CalendarCheck className="icon-align"/><span className="nav-text">Pay in 4 installments of</span></div>
            : null;
        return(
                <div>
                    <div class="split left">
                        <Link to="/"><ArrowBarLeft className="arrow-style" size="25px"/></Link>
                        <div class="info">
                            <div class="price">
                            <span>$245.00</span>
                            <span>Nice speaker : Quality</span>
                            </div>
                        </div>
                    </div>
                    <div class="split right">
                        <div class="form centered">
                            <div className="payment-form-name">Payment information</div>
                            <form action="" method="post">
                                <section className="payment-form-width">
                                    <h7>Shipping &amp; Billing Information</h7>
                                    <fieldset class="with-state">
                                        <label>
                                            <span>Name</span>
                                        <input name="name" class="field" placeholder="Jenny Rosen" required />
                                        </label>
                                        <label>
                                            <span>Email</span>
                                            <input name="email" type="email" class="field" placeholder="jenny@example.com" required />
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
                                <Button variant="primary" className="button-style" size="md" active>Pay Now</Button>
                            </form>
                        </div>
                    </div>
                </div>
        );
    }
}

export default Checkout;