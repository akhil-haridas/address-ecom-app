const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    home: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        require: true
    }

})

const appliedCoupon = new Schema({
    appliedOn: {
        type: String,
        required: true
    },
    coupon: {
        type: String,
        required: true
    }
})

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: ''
    },
    verified: {
        type: Number,
        default: 0
    },
    token: {
        type: String,
        default: ''
    },
    Active: {
        type: String,
        default: 0
    },
    image: {
        type: String,
        required: false
    },
    wallet: {
        type: Number,
        required: false
    },
    address: [addressSchema],

    couponsApplied: [appliedCoupon]
}, {
    timestamps: true
})

module.exports = mongoose.model("User", userSchema);