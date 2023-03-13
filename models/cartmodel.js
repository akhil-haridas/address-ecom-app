const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productId: {
        type: ObjectId,
        required: true
    },
    quantity: {
        type: Number,
        required: false
    },
    price: {
        type: Number,
        required: true
    }
})


const cartSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true
    },
    products: [productSchema],
    discountTotal: {
        type: Number,
        required: false
    }
})

module.exports = mongoose.model("Cart", cartSchema)