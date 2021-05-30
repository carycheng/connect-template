const express = require('express');
const router = express.Router();

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);


router.post('/create-account-link', async (req, res) => {
    const accountId = req.body.stripeAccountId;

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'http://localhost:3000/dashboard',
        return_url: 'http://localhost:3000/dashboard',
        type: 'account_onboarding',
    });

    res.status(200).send({body: accountLink});
});

router.post('/get-account-info', async (req, res) => {
    const accountId = req.body.stripeAccountId;
    console.log(req.body);

    console.log('TEST', accountId);

    const account = await stripe.accounts.retrieve(
        accountId
    );


    res.status(200).send({body: account});
});

module.exports = router;