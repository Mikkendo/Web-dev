//Schema for reviews for yelpcamp

//this is a one to many relationship in mongodb

const mongoose = require('mongoose') //acquires mongoose
const Schema = mongoose.Schema //saving mongoose.schema to a variable to save a bit of time 

const reviewSchema = new Schema({
    body: String,
    rating: Number
})

module.exports = mongoose.model("Review", reviewSchema)