const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);

const Users = require('../models/User');
// const Users = mongoose.model('users', User);

router.post('/get-user', async (req, res) => {

    console.log('Body', req.body);
    const user = await Users.findOne({email: req.body.email});

    console.log(user);

    res.status(200).send({body: user});
});

module.exports = router;