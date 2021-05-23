const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    stripeCustomerId: {
        type: String,
        unique: false
    },
    stripeAccountId: {
        type: String,
        unique: false
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: false
    }
});

module.exports = mongoose.model('users', UserSchema);