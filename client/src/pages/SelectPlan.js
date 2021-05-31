import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Tabs, Tab, Spinner } from 'react-bootstrap';
import axios from 'axios';

import '../public/styles/SelectPlan.css';

class SelectPlan extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }

    onSubmit = async (event, text) => {
        event.preventDefault();
        this.setState({ loading: true })

        const selectedPlan = {
            customerId: this.props.user.stripeCustomerId,
            selectedPlan: text
        }

        await axios.post('/api/v1/create-plan', selectedPlan);

        this.props.history.push('/dashboard');
    }

    render() {
        return (
            <React.Fragment>
                <section class="pricing-section bg-7 background-color">
                    <h2 class="pricing-section__title">Subscription Plans</h2>
                    <div class="pricing pricing--norbu">
                        <form onSubmit={(event) => this.onSubmit(event, 'basic-plan')} class="pricing__item">
                            <h3 class="pricing__title">Basic</h3>
                            <p class="pricing__sentence">For people who are starting out in the water saving business</p>
                            <div class="pricing__price"><span class="pricing__currency">$</span>19<span class="pricing__period">/  month</span></div>
                            <ul class="pricing__feature-list">
                                <li class="pricing__feature">Free water saving e-book</li>
                                <li class="pricing__feature">Free access to forums</li>
                                <li class="pricing__feature">Beginners tips</li>
                            </ul>
                            <button type="submit" class="pricing__action">Choose plan</button>
                        </form>    
                        <form onSubmit={(event) => this.onSubmit(event, 'standard-plan')} class="pricing__item">
                            <h3 class="pricing__title">Standard</h3>
                            <p class="pricing__sentence">For people who are starting out in the water saving business</p>
                            <div class="pricing__price"><span class="pricing__currency">$</span>19<span class="pricing__period">/  month</span></div>
                            <ul class="pricing__feature-list">
                                <li class="pricing__feature">Free water saving e-book</li>
                                <li class="pricing__feature">Free access to forums</li>
                                <li class="pricing__feature">Beginners tips</li>
                            </ul>
                            <button class="pricing__action">Choose plan</button> 
                        </form>
                        <form onSubmit={(event) => this.onSubmit(event, 'premium-plan')} class="pricing__item">
                            <h3 class="pricing__title">Premium</h3>
                            <p class="pricing__sentence">For people who are starting out in the water saving business</p>
                            <div class="pricing__price"><span class="pricing__currency">$</span>19<span class="pricing__period">/  month</span></div>
                            <ul class="pricing__feature-list">
                                <li class="pricing__feature">Free water saving e-book</li>
                                <li class="pricing__feature">Free access to forums</li>
                                <li class="pricing__feature">Beginners tips</li>
                            </ul>
                            {this.state.loading ? (  
                                <button class="pricing__action disabled">
                                    <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" /> Loading...</button>) :
                            (<button class="pricing__action">Choose plan</button> )}
                        </form>
                    </div>
                </section>
            </React.Fragment>
        );
    }
};

const mapStateToProps = (state) => {
    return { user: state.user }
};

export default connect(mapStateToProps, null)(SelectPlan);