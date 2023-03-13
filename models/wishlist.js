const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const wishListSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required:true
    },
    products:Array
})

module.exports = mongoose.model("Wishlist",wishListSchema)