const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    category: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    description: {
        type:String
    }
})

module.exports = mongoose.model( "Category", categorySchema );