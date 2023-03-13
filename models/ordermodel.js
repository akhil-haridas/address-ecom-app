const { ObjectId, Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const productSchema = new Schema({
    productId: {
        type: ObjectId,
        required: true,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const couponDeatials = new Schema({
    couponName: {
        type: String,
        required: false
    },
    discountedPrice: {
        type: Number,
        required: false
    }
})
const orderSchema = new Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    products: [productSchema],

    total: {
        type: Number,
        required: true
    },
    address: {

    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        required: true
    },
    deliveredAt: {
        type: Date,
        required: false
    },
    walletAmount: {
        type: Number,
        required: false
    },
    couponPrice: [couponDeatials]

}, {
    timestamps: true
})

module.exports = mongoose.model('Order', orderSchema);