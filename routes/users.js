const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../ultilities/catchAsync') //requires the catchAsync function which will catch any errors and call next() to the error handler
const passport = require('passport')
const { storeReturnTo } = require('../middleware'); //import the storeReturnTo function from the middleware.js file
router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async (req, res, next) => { /*catchAsync will catch any errors and call next() to the error handler which wil load an error page for the user ,however 
using the try and catch blocks will give a cleaner response to the user if there are any errors by flashing a message instead and redirecting them back to the registration form.*/
    try {//will use the try with this code block if it all works will flash success with its message and redirect to the main campground page
        const { email, username, password } = req.body //destructures email,username and password from req,body
        const user = new User({ email, username }) //takes the email and username from the req.body and makes a new instance of the  User model from the mongoose Schema
        const registeredUser = await User.register(user, password) /*Uses the register method which is a static method from passport-local-mongoose which has the result of the
    variable from user and the destructured password from the req.body in its parameters. This register method will hash your password and put it through some salt rounds before
    being saved to the database
     */
        req.login(registeredUser, err => {//automatically logs the user in when registration is complete
            if (err) return next(err) //if there is an error then it will pass it on to the error handler
            req.flash('success', 'Welcome to Yelpcamp')//else registration is success and the flash message will appear and user will be redirected to /campgrounds
            res.redirect('/campgrounds')
        })

    } catch (error) { //if there is an error at any point in the code above we will flash an error with the error message and redirect you back to the register form
        req.flash('error', error.message)
        res.redirect('/register')
    }

}))

router.get('/login', (req, res) => {
    res.render('./users/login')
})

router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {/*passport.authenticate*() is a passport middleware that allows 
us to specify a passport strategy we use the local strategy to authenticate the user and passport passed in.failureFlash will flash a message if you fail to login using req.flash() 
and failureRedirect will redirect you to the /login screen again.
storeReturnTo is a middleware from middleware.js is used to save the returnTo value from the session (req.session.returnTo) to res.locals:*/
    req.flash('success', 'Sucessfully logged in!')//if the autentication from passport local strategy is a success then a success flash will show and redirect you to campgrounds page
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl)

})

router.get('/logout', (req, res, next) => {
    req.logout(function (err) { //req.logout() is a function built into passport that will log the user out
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have signed out!'); //will get a flash message notifying the user they have signed out
        res.redirect('/login');//will redirect back to login after
    });
});

module.exports = router