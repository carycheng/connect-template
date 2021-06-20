const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    image_url: {
        type: String,
        required: true,
        unique: false
    },
    rating: {
        type: String,
        required: true,
        unique: false,
    },
    name: {
        type: String,
        unique: false
    },
    description: {
        type: String,
        unique: false
    },
    stripe_product_id: {
        type: String,
        unique: false,
    },
    lister_id: {
        type: String,
        unique: false,
    }
});

module.exports = mongoose.model('products', ProductSchema);