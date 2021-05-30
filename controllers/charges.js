const keys = require('../config/keys');
const stripe = require('stripe')(keys.STRIPE_SK);
const User = require('../models/User');

const createCharge = async (req, res, next) => {

    console.log('In backend');
    console.log(req.body);

    const User = new User();
    console.log(User);

    newUser.email = req.body.email;
    newUser.password = req.body.password;
    newUser.stripeId = '32525';
    newUser.phoneNumber = req.body.phoneNumber

    // console.log('after new user call');
    // User.save()
    // .then(data=>{
    //     response.json(data)
    // })
    // .catch(error=>{
    //     response.json(error)
    // })
};

module.exports.createCharge = createCharge;