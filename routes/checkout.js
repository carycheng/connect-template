const express = require('express');
const router = express.Router();

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);

router.post('/get-product-info', async (req, res) => {

    const prices = await stripe.prices.list({
        product: req.body.stripe_product_id,
    });

    console.log(prices);

    res.status(200).send({body: prices.data[0]});
});

router.post('/create-payment-intent', async (req, res) => {

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',
        payment_method_types: ['card'],
    });
    
    res.status(200).send({body: paymentIntent});
});

router.post('/attach-payment-method', async (req, res) => {
    
    const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.name
    });

    const paymentMethod = await stripe.paymentMethods.attach(
        req.body.payment_method,
        {customer: customer.id}
    );

    console.log(paymentMethod);

    res.status(200).send({body: paymentMethod});
});

module.exports = router;