const express = require('express');
const router = express.Router();
const Products = require('../models/Product');

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);

router.get('/get-products', async (req, res) => {

    const allProducts = await Products.find().sort({ _id: -1 }).limit(3);

    res.status(200).send({body: allProducts});
});

router.post('/create-product', async (req, res) => {

    const product = await stripe.products.create({
        name: req.body.name,
        images: [req.body.imageUrl]
    })

    const oneTimePrice = await stripe.prices.create({
        unit_amount: parseInt(req.body.amount) * 100,
        currency: 'usd',
        product: product.id,
        tax_behavior: 'exclusive'
    })

    const recurringPrice = await stripe.prices.create({
        unit_amount: (parseInt(req.body.amount) * 100) / 4,
        recurring: {
            interval: 'month'
        },
        currency: 'usd',
        product: product.id
    })

    var newProduct = new Products({
        price_id: "dummy_id",
        image_url: req.body.imageUrl,
        rating: 5,
        name: req.body.name,
        description: req.body.description,
        lister_id: req.body.stripeAccountId,
        stripe_product_id: product.id
    });

    newProduct.save()
    .then(data=>{
        res.json(data)
    })
    .catch(error=>{
        res.json(error)
    })
});

router.post('/get-admin-products', async (req, res) => {
    
    const products = await Products.find().where('lister_id').equals(req.body.stripeAccountId);

    console.log('Products: ', products);

    res.status(200).send({body: products});
});

router.post('/delete-listing', async (req, res) => {

    console.log('Body: ', req.body);

    const oneTimePrice = await stripe.prices.list({
        product: req.body.stripe_product_id,
        type: 'one_time'
    });

    await stripe.prices.update(
        oneTimePrice.data[0].id,
        {active: false}
    );

    const recurringPrice = await stripe.prices.list({
        product: req.body.stripe_product_id,
        type: 'recurring'
    });

    await stripe.prices.update(
        recurringPrice.data[0].id,
        {active: false}
    );

    await stripe.products.update(
        req.body.stripe_product_id,
        {active: false}
    );

    const response = await Products.findByIdAndRemove(req.body._id);

    res.status(200).send({body: response});
});

module.exports = router;