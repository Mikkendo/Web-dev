const Joi = require('joi') /*joi is a Javascript object schema validation tool that allows us to create schemas(blueprints) that only accepts specific data to pass to our server, for example
when creating a username, it will only validate username if it is a string , and must contain only alphanumeric characters(letters and numbers) , and if it's at least 3 characters long.This
is to ensure we only accept accurate data to give to our servers. side note:This is not  mongoose schema.Joi is for server side validation.
Joi has more features when compared to the built-in mongoose validation, and it also checks the data at the request level, before any chance of data being added to the database */




const campgroundSchema = Joi.object({/*Using joi we create our validation schema that accepts specific data for our new campground form*/
    campground: Joi.object({
        title: Joi.string().required(), //title is required to be a string
        price: Joi.number().required().min(0), //price is required to be a number and the minimun price is 0
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
})

module.exports.campgroundSchema = campgroundSchema


//creating the validation schema that accepts specific data for our review form
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(0).max(5),
        body: Joi.string().required()
    }).required()
})