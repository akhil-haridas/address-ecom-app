const { ObjectId } = require("mongodb");
const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const BannerSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    image :{
        type : String,
        required : true
    }
    
}) 
module.exports = mongoose.model("Banner", BannerSchema)