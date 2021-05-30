const express = require('express');
const router = express.Router();

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);
const User = require('../models/User');

router.post('/create-charge', async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const paymentMethod = (req.body.paymentInfo !== null) ? req.body.paymentInfo.paymentMethod : null
    let customer = null;

    var newUser = new User({
        email: email,
        password: password,
        phoneNumber: phoneNumber
    });

    if (paymentMethod) {
        customer = await stripe.customers.create({
            email: email,
            phone: phoneNumber,
        });

        const setupIntent = await stripe.setupIntents.create({
            confirm: true,
            customer: customer.id,
            payment_method: paymentMethod.id
        });

        newUser.stripeCustomerId = customer.id;
    }

    const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        capabilities: {
          card_payments: {requested: true},
          transfers: {requested: true},
        },
    });

    newUser.stripeAccountId = account.id;

    newUser.save()
    .then(data=>{
        res.json(data)
    })
    .catch(error=>{
        res.json(error)
    })
});

router.post('/create-plan', async (req, res) => {
    
    const customerId = req.body.customerId;
    console.log('Customer ID: ', customerId);
    const selectedPlan = req.body.selectedPlan;
    let priceId;

    switch(selectedPlan) {
        case 'basic-plan':
            priceId = keys.BASIC_PLAN
            break;
        case 'standard-plan':
            priceId = keys.STANDARD_PLAN
            break;
        case 'premium-plan':
            priceId = keys.PREMIUM_PLAN
            break;
    }

    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
        limit: 1
    });

    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {price: priceId},
        ],
        default_payment_method: paymentMethods.data[0].id
    });

    res.status(200).send({ data: subscription });
});

module.exports = router;