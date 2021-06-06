const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

var Schema = mongoose.Schema;
const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);

const  ProductsSchema = new Schema({
    price_id:String,
    image_url:String
});

const Products = mongoose.model('products', ProductsSchema);

router.get('/get-products', async (req, res) => {

    const allProducts = await Products.find().limit(3);

    console.log(allProducts);

    res.status(200).send({body: allProducts});
});

module.exports = router;