import React, { useState, useRef } from 'react';
import { Button, Modal, Card, CardDeck,  } from 'react-bootstrap';
import { ElementsConsumer } from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import ReactStars from "react-rating-stars-component";
import { connect } from 'react-redux';
import axios from 'axios';

import logo from '../public/images/company-icon.png';
import dashboard from '../public/images/marketplace.jpg';
import '../public/styles/Landing.css';
import '../components/Footer';
import Footer from '../components/Footer';
import SignUpModal from '../components/SignUpModal';
import { setProduct } from '../actions/index'; 

class Landing extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            stripe: null
        };
        this.child = React.createRef();
    }

    componentDidMount() {

        (async () => {
            const stripe = await loadStripe('TEST');
            const response = await axios.get('/api/v1/get-products');
            this.setState({ products: response.data.body })
            this.setState({ stripe: stripe })
        })()
    }

    showModal = () => {
        this.child.current.handleModalShowHide();
    }

    handleItemSelect(product) {
        this.props.setProduct(product);
        this.props.history.push('/checkout');
    }

    checkoutHandler(product) {

        (async () => {
            console.log(product);
            const sessionId = await axios.post('/api/v1/create-checkout-session', product);
            console.log(sessionId);
            await this.state.stripe.redirectToCheckout({ sessionId: sessionId.data.body });
        })()
    }

    renderList() {
        return this.state.products.map(product => {
            console.log(product);
            return (
                <Card className="card-spacing">
                    <Card.Img variant="top" src={product.image_url} className="card-img-body" />
                    <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>
                            {product.description}
                        </Card.Text>
                        <div className="stars-style">
                            <ReactStars
                                count={5}
                                value={product.rating}
                                size={20}
                                activeColor="#F8B705"
                                isHalf={true}
                                edit={false}
                                color="gray"
                            />
                        </div>
                        <div className="ratings-count">
                            ({Math.floor(Math.random() * 100) + 1})
                        </div>
                        <div className="posting-time-style">
                            <small className="text-muted">Posted {Math.floor(Math.random() * 10) + 1} minutes ago</small>
                        </div>
                    </Card.Body>
                    <Card.Footer>
                        <div class="checkout-button-style">
                            <Button onClick={() => this.checkoutHandler(product)} variant="primary">Buy With Checkout</Button>
                        </div>
                        <div class="checkout-button-style checkout-button-spacing">
                            <Button onClick={() => this.handleItemSelect(product)} variant="primary">Buy With Elements</Button>
                        </div>
                    </Card.Footer>
                </Card>
            );
        });
    }

    render() {
        return (
            <React.Fragment>
                <nav class="site-header sticky-top py-1 spectral-font-family">
                    <div class="container d-flex flex-column flex-md-row justify-content-between">
                        <a class="py-2" href="#">
                            <img src={logo} class="icon-size" />
                        </a>
                        <a class="py-2 d-none d-md-inline-block" href="#">Tour</a>
                        <a class="py-2 d-none d-md-inline-block" href="#">Products</a>
                        <a class="py-2 d-none d-md-inline-block" href="#">Features</a>
                        <a class="py-2 d-none d-md-inline-block" href="#">Enterprise</a>
                        <a class="py-2 d-none d-md-inline-block" href="#">Support</a>
                        <a onClick={this.showModal} class="py-2 d-none d-md-inline-block">Get Started</a>
                    </div>
                </nav>
                <img src={dashboard} class="banner-img-cover" />
                <div class="top-banner-slogan playfair-font-family" >Buy and Sell Easily</div>
                <div class="bottom-banner-slogan playfair-font-family" >We've got you covered</div>
                <ElementsConsumer>
                    {({elements, stripe}) => (
                        <SignUpModal elements={elements} stripe={stripe} history={this.props.history} ref={this.child}/>
                    )}
                </ElementsConsumer>
                <br />
                <h2 class="playfair-font-family card-title">Take a look at what's new!</h2>
                <br />
                <CardDeck>
                    { this.renderList() }
                </CardDeck>
                <Footer />
            </React.Fragment>
        );
    }
};

export default connect(null, { setProduct }, null)(Landing);