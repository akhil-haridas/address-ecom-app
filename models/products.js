const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
})

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    grossPrice: {
        type: Number,
        required: true
    },
    offerPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: ObjectId,
        required: true,
        ref: 'Category'
    },
    image: {
        type: Array,
        required: false
    },
    size: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: false
    },
    reviews: [reviewSchema],
    rating: {
        type: Number,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", productSchema);