import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Tabs, Tab, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { CardElement } from "@stripe/react-stripe-js";

import '../public/styles/Landing.css';
import { fetchUser } from '../actions/index';

class SignUpModal extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            showHide: false,
            checkedState: false,
            email: '',
            password: 'dummy_password',
            phoneNumber: '',
            loading: false
        }
        this.test = React.createRef();
        this.changeEmail = this.changeEmail.bind(this);
        this.changePhoneNumber = this.changePhoneNumber.bind(this);
        this.handleCheckedState = this.handleCheckedState.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onSignIn = this.onSignIn.bind(this);
    }

    handleModalShowHide() {
        this.setState({ showHide: !this.state.showHide })
    }

    handleCheckedState() {
        this.setState({ checkedState: !this.state.checkedState})
    }

    changePhoneNumber(event) {
        this.setState({
            phoneNumber: event.target.value
        });
    }

    changeEmail(event) {
        console.log(this.state.email);
        this.setState({
            email: event.target.value
        });
    }

    onSignIn = async event => {
        event.preventDefault();

        const User = {
            email: this.state.email
        }

        const foundUser = await axios.post('/api/v1/get-user', User)
        localStorage.setItem('user', JSON.stringify(foundUser.data.body));

        this.props.history.push('/dashboard');
    };

    onSubmit = async event => {
        event.preventDefault();
        this.setState({loading: true});
        const {stripe, elements} = this.props;
        let paymentMethod = null;

        if (!stripe || !elements) {
            return;
        }

        if (this.state.checkedState) {
            const cardElement = elements.getElement(CardElement);

            paymentMethod = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
        }

        const registered = {
            email: this.state.email,
            phoneNumber: this.state.phoneNumber,
            password: this.state.password,
            paymentInfo: paymentMethod
        }

        const createdUser = await axios.post('/api/v1/create-charge', registered)

        console.log(createdUser.data);

        this.props.fetchUser(createdUser.data);
        localStorage.setItem('user', JSON.stringify(this.props.user));

        if (this.state.checkedState) {
            this.props.history.push('/select-plan');
        } else {
            this.props.history.push('/dashboard');
        }
    }

    render() {
        const content = this.state.checkedState
            ? <div class="card-section-padding"><CardElement /></div>
            : null;
        return (
            <div>
                <Modal show={this.state.showHide}>
                    <Modal.Header className="modal-title-background-style" closeButton onClick={() => this.handleModalShowHide()}>
                        <Modal.Title className="playfair-font-family modal-title-font-color">Welcome!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Tabs className="open-sans-font-family" defaultActiveKey="profile" id="uncontrolled-tab-example">
                            <Tab eventKey="home" title="Sign In">
                                <form onSubmit={this.onSignIn} class="open-sans-font-family">
                                    <div class="form-group">
                                        <label class="tab-message-helper login-input-text-color sigin-tab-top-padding" for="signInEmail">Email Address</label>
                                        <input onChange={this.changeEmail} value={this.state.email} type="email" class="form-control rounded-corners" name="email" id="signInEmail" aria-describedby="emailHelp" placeholder="enter email" />
                                    </div>
                                    <div class="form-group">
                                        <label class="tab-message-helper login-input-text-color" for="signInPassword">Password</label>
                                        <input type="password" class="form-control rounded-corners" name="password" id="signInPassword" placeholder="enter password" />
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-med btn-block rounded-corners">Sign In</button>
                                </form>
                            </Tab>
                            <Tab className="open-sans-font-family" eventKey="profile" title="New Account">
                                <form onSubmit={this.onSubmit} id="payment-form">
                                    <label class="mts registration-tab-top-padding">A few things to get us started</label>
                                    <div class="form-group">
                                        <input onChange={this.changeEmail} value={this.state.email} type="email" class="form-control rounded-corners" name="email" id="signUpEmail" aria-describedby="emailHelp" placeholder="enter email" />
                                        <small id="emailHelp" class="form-text text-muted email-warning-message">This is your identifier</small> 
                                    </div>
                                    <div class="form-group">
                                        <input type="password" class="form-control rounded-corners" name="password" id="signUpPassword" placeholder="enter password" />
                                    </div>
                                    <div class="form-group">
                                        <input onChange={this.changePhoneNumber} value={this.state.phoneNumber} type="tel" class="form-control rounded-corners" name="telephone" id="signUpPhone" placeholder="enter phone number (6501234567)" />
                                    </div>
                                    <div class="form-check checkbox-section-position checkbox-style">
                                        <label><input id="checkbox" type="checkbox" checked={this.state.checkedState} onChange={this.handleCheckedState}/><span>Sign up for a listing package</span></label>
                                    </div>
                                    { content }
                                    <div class="register-new-user-button-placement">
                                        {this.state.loading ? (  
                                            <Button variant="btn btn-primary btn-med btn-block rounded-corners" disabled>
                                                <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" /> Loading...</Button>) :
                                        (<input type="submit" value="Register" class="btn btn-primary btn-med btn-block rounded-corners" id="register" />)}
                                    </div>
                                </form>
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
};

const mapStateToProps = (state) => {
    return { user: state.user }
};

export default connect(mapStateToProps, { fetchUser }, null, {forwardRef : true})(SignUpModal);