//This mongoose model will use Passport middleware for authenticating with a username and password

const mongoose = require('mongoose')
const PassportLocalMongoose = require('passport-local-mongoose')
const Schema = mongoose.Schema

//Only need to add an email field to the UserSchema since passport-local-mongoose will add the username and password fields for us by UserSchema.plugin(PassportLocalMongoose)
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true //The unique option tells Mongoose that each document must have a unique value for a given path, if you try to create two users with the same email, you'll get a duplicate key error.
    }
})

/*UserSchema.plugin(PassportLocalMongoose) Will add a username and password field for our UserSchema , this also makes sure that the usernames entered in those fields are unique and not duplicated and also gives us 
some addition methods that we can use*/
UserSchema.plugin(PassportLocalMongoose)

module.exports = mongoose.model('User', UserSchema)