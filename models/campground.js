/*This file is used to create a mongoose Schema for our Mongo database */

const mongoose = require('mongoose') //acquires mongoose
const Schema = mongoose.Schema //saving mongoose.schema to a variable to save a bit of time 
const Review = require('./review') //acquires the review.js schema

const CampgroundSchema = new Schema({ //Schema is reference to const Schema = mongoose.Schema , in general it should be new mongoose.Schema but since const Schema = mongoose.Schema we use the variable Schema instead
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId, //schema.types allow for one type of data to be passed to the database in this case its ObjectId, there are other like schema.types.string as well
        ref: 'User' //references the User schema in user.js
    },
    reviews: [{
        /*sets the type to objectId so only the ObjectId's will show in this reviews array , this is a one to many relationship
        so it would look something like this in mongoDB
        
        reviews: [
                ObjectId("64a19e34a2b5ed77e48abad8"),
                ObjectId("64a19e35a2b5ed77e48abadd")
        ]*/
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
})


/*

CampgroundSchema.post('findOneAndDelete', async function (document) {
    if (document) {
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
})

is a mongoose query middleware that Deletes the reviews associated with the deleted campground.

findByIdAndDelete will trigger the following middleware findOneAndDelete() which is why there is in findOneAndDelete()
CampgroundSchema.post('findOneAndDelete', async function (document) 

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params //destructures id property from req.params object body saves it into a variable id
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

so once await Campground.findByIdAndDelete(id) runs then the mongoose query middleware will run

If there is a document then it will delete all the reviews in that document
*/


CampgroundSchema.post('findOneAndDelete', async function (document) {
    if (document) {
        await Review.deleteMany({
            _id: {
                $in: document.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema) //name is Campground which uses the CampgroudSchema