import React, { useState, useRef } from 'react';
import { Button, Modal, Card, CardGroup } from 'react-bootstrap';
import { ElementsConsumer } from '@stripe/react-stripe-js';
import axios from 'axios';

import logo from '../public/images/company-icon.png';
import dashboard from '../public/images/building.jpeg';
import '../public/styles/Landing.css';
import '../components/Footer';
import Footer from '../components/Footer';
import SignUpModal from '../components/SignUpModal';

class Landing extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            products: [],
        };
        this.child = React.createRef();
    }

    showModal = () => {
        this.child.current.handleModalShowHide();
    }

    componentDidMount() {
        (async () => {
            const response = await axios.get('/api/v1/get-products');
            this.setState({products: response.data.body})
            console.log('IN MOUNT', this.state.products);
        })()
    }

    renderList() {
        console.log('PRODUCTS', this.state.products);
        return this.state.products.map(product => {
            console.log(product);
            return (
                <Card className="card-spacing">
                    <Card.Img variant="top" src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80" />
                    <Card.Body>
                        <Card.Title>Card title</Card.Title>
                        <Card.Text>
                            This is a wider card with supporting text below as a natural lead-in to
                            additional content. This content is a little bit longer.
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <small className="text-muted">Last updated 3 mins ago</small>
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
                <div class="top-banner-slogan playfair-font-family" >Everything you need</div>
                <div class="bottom-banner-slogan playfair-font-family" >We've got you covered</div>
                <ElementsConsumer>
                    {({elements, stripe}) => (
                        <SignUpModal elements={elements} stripe={stripe} history={this.props.history} ref={this.child}/>
                    )}
                </ElementsConsumer>
                <br />
                <h2 class="playfair-font-family card-title">Take a look at what's new!</h2>
                <br />
                <CardGroup>
                    { this.renderList() }
                </CardGroup>
                <Footer />
            </React.Fragment>
        );
    }
};

export default Landing;