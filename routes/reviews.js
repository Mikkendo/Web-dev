const express = require('express')
const router = express.Router({ mergeParams: true }) /* setting mergeParams to true will merge the req.parems from this file to the index.js file by default the req.parems from
these files are seperate */
const catchAsync = require('../ultilities/catchAsync') //acquires the catchAsync.js code to use as a basic error handler
const Campground = require('../models/campground') //imports the schema from campground.js
const Review = require('../models/review') //acquires the review model in review.js
const expressError = require('../ultilities/expressError') //acquires the expressError function from expressError.js
const { reviewSchema } = require('../joiSchema.js') //destructuring the exported schemas which are Joi objects

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        next()
    }
}


router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id) //finds the campground by its id in the req.params object
    const review = new Review(req.body.review)//creates a new document of the Review model using the data from the request body (check the comments on show.ejs on the review form)
    campground.reviews.push(review)//pushes the review in the Reviews array in mongoDB 
    await review.save() //saves the review
    await campground.save() //saves the campground
    req.flash('success', 'Your review has been posted!')
    res.redirect(`/campgrounds/${campground._id}`)

}))

//removes the reference to the review in the campground CampgroundSchema[reviews] ObjectId and also removes the review itself
/*Since the reviews in the CampgroundSchema is an array we can use the mongoDb operator $pull which removes from an existing array all instances of a vlue or values 
that match a specified condition. */
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    //pulls from the reviews array
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Your review has been deleted!')
    res.redirect(`/campgrounds/${id}`)

}))




module.exports = router