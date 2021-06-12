const express = require('express');
const router = express.Router();

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);

router.post('/get-product-info', async (req, res) => {

    const oneTimePrice = await stripe.prices.list({
        product: req.body.stripe_product_id,
        type: 'one_time'
    });

    const recurringPrice = await stripe.prices.list({
        product: req.body.stripe_product_id,
        type: 'recurring'
    });

    console.log('one time', oneTimePrice);
    console.log('recurring', recurringPrice);

    res.status(200).send({body: {oneTimePrice: oneTimePrice.data[0], recurringPrice: recurringPrice.data[0] }});
});

router.post('/create-payment-intent', async (req, res) => {

    console.log('Connected Account: ', req.body);
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'usd',
        transfer_data: {
            destination: req.body.connected_account_id
        },
        application_fee_amount:500,
    });
    
    res.status(200).send({body: paymentIntent});
});

router.post('/attach-payment-method', async (req, res) => {
    
    const customer = await stripe.customers.create({
        email: req.body.email,
        name: req.body.name
    });

    console.log('Customer', customer);

    const paymentMethod = await stripe.paymentMethods.attach(
        req.body.payment_method,
        {customer: customer.id}
    );

    await stripe.customers.update(
        customer.id,
        {invoice_settings: {default_payment_method: paymentMethod.id}}
    );

    console.log(paymentMethod);

    res.status(200).send({body: paymentMethod});
});

router.post('/confirm-card-payment', async (req, res) => {

    console.log(req.body);

    const paymentIntent = await stripe.paymentIntents.confirm(
        req.body.payment_intent_id,
        {
            payment_method: req.body.payment_method,
            setup_future_usage: 'off_session'
        }
    );

    res.status(200).send({body: paymentIntent});
});

router.post('/create-installment-plan', async (req, res) => {
    
    const subscriptionSchedule = await stripe.subscriptionSchedules.create({
        customer: req.body.customer,
        start_date: 'now',
        end_behavior: 'cancel',
        phases: [
          {
            items: [
              {
                price: req.body.price_id,
                quantity: 1,
              },
            ],
            iterations: 4,
          },
        ],
        default_settings: {
            application_fee_percent: 5,
            default_payment_method: req.body.payment_method,
            transfer_data: {
                destination: req.body.connected_account_id
            }
        }
    });

    const subscription = await stripe.subscriptions.retrieve(
        subscriptionSchedule.subscription
    );
    
    const invoice = await stripe.invoices.update(
        subscription.latest_invoice,
        {
            default_payment_method: req.body.payment_method,
            auto_advance: true,
            collection_method: 'charge_automatically'
        }
    );

    await stripe.invoices.finalizeInvoice(
        invoice.id,
        {auto_advance: true}
    );

    console.log(subscription);

    res.status(200).send({body: subscriptionSchedule});
});

router.post('/get-receipt-url', async (req, res) => {

    const charges = await stripe.charges.list({
        payment_intent: req.body.payment_intent_id,
    });

    res.status(200).send({body: charges.data[0].receipt_url});
});

router.post('/create-checkout-session', async (req, res) => {

    const oneTimePrice = await stripe.prices.list({
        product: req.body.stripe_product_id,
        type: 'one_time'
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {price: oneTimePrice.data[0].id, quantity: 1},
        ],
        mode: 'payment',
        payment_intent_data: {
            application_fee_amount: 500,
            transfer_data: { destination: req.body.lister_id }
        },
        success_url: 'http://localhost:3000',
        cancel_url: 'http://localhost:3000',
    });

    res.status(200).send({ body: session.id });
});

module.exports = router;