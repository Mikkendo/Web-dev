const express = require('express') //acquires express
const app = express() //executes express
const path = require('path') //acquires path.join() method
const mongoose = require('mongoose') //acquires mongoose
const session = require('express-session')//acquires sessions
const flash = require('connect-flash')//acquires the connect-flash package which lets us use flash messages
const methodOverride = require('method-override') //so we can use other methods for our html forms such as PUT POST and DELETE
const ejsMate = require('ejs-mate')//acquires ejs-mate which an node package that lets us define boilerplate code in our .ejs files
app.engine('ejs', ejsMate)// ejs-mate package are now used to render those .ejs files, instead of the default rendering made by Express
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
const Joi = require('joi') /*joi is a Javascript object schema validation tool that allows us to create schemas(blueprints) that only accepts specific data to pass to our server, for example
when creating a username, it will only validate username if it is a string , and must contain only alphanumeric characters(letters and numbers) , and if it's at least 3 characters long.This
is to ensure we only accept accurate data to give to our servers. side note:This is not  mongoose schema.Joi is for server side validation.
Joi has more features when compared to the built-in mongoose validation, and it also checks the data at the request level, before any chance of data being added to the database */
const Review = require('./models/review') //acquires the review model in review.js
const campgroundRoutes = require('./routes/campgrounds') //acquires the campground router
const reviewRoutes = require('./routes/reviews') //acquires the review router
const usersRoutes = require('./routes/users')//acquires the users routers
const passport = require('passport')//acquires passport.js which gives us multiple stratergies for authnetication such a autenticating username and password before logging in
const LocalStrategy = require('passport-local') //acquires passport-local which is a passport stratergy for authenticating with a username and password needs passport.js to work.
const User = require('./models/user') //acquires the user model to use with passport.use(new LocalStrategy())


const expressError = require('./ultilities/expressError') //acquires the expressError function from expressError.js
const { campgroundSchema, reviewSchema } = require('./joiSchema.js') //destructuring the exported schemas which are Joi objects

const db = mongoose.connection //This is to make sure the connection to MongoDB was successful
db.on("error", console.error.bind(console, "connection error:")) //If an error occurs logs in an error
db.once("open", () => {
    console.log("Database connected")//If connection is a success logs in "Database connected"
})

app.set('view engine', 'ejs') //sets view engine to ejs
app.set('views', path.join(__dirname, 'views'))//sets all of our front end files to be rendered in a folder called views
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public'))) /*To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.('public') is 
referring to the folder public , the path.join method merges the path into a single string for example /yelpcamp/public*/
app.use(express.urlencoded({ extended: true })) /*This is the middleware that is called between processing the Request and sending the response in this file.
You NEED express.json() and express.urlencoded() for POST and PUT requests, because in both these requests you are sending data (in the form of some data object) to
 the server and you are asking the server to accept or store that data (object), which is enclosed in the body (i.e. req.body) of that (POST or PUT) Request.
 express.urlencoded() is a method inbuilt in express to recognize the incoming Request Object as strings or arrays. This method is called as a middleware in your
  application using the code: app.use(express.urlencoded());*/


//Code below to do with sessions
const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: { //Sets a time when the cookie will expire from the session, Date.now() is in miliseconds
        httpOnly: true, //httpOnly is a basic security layer, the default is usually set to true but we are setting it to true here just in case.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}



app.use(session(sessionConfig))
app.use(flash()) //lets us use flash messages





app.use(passport.initialize()) //this middleware is required to initialize passport
app.use(passport.session()) // this middleware is required if application uses persistant login sessions which we use with sessions, session must be used before passport.session
passport.use(new LocalStrategy(User.authenticate()))//makes passport use the passport-local strategy with our User.js model. The method .authenticate comes with passport-local
passport.serializeUser(User.serializeUser()) //To maintain a login session, Passport serializes and deserializes user information to and from the session.
passport.deserializeUser(User.deserializeUser())//







app.use((req, res, next) => {//middleware for connect-flash so we do not have to pass it to our ejs templates like this, res.render('campgrounds/show', { campground, msg: req.flash("success") })
    res.locals.currentUser = req.user /* res.locals property is an object that contains response local variables scoped to the request it is only available to the view(s) rendered during 
    that request/response cycle (if any). So currentUser is the local variable that has req.user stored inside it and since its in app.use() all of my ejs templates should have 
    access to it .
    By default, when authentication succeeds, the req.user property is set to the authenticated user,*/
    res.locals.success = req.flash('success')//if there is a message in req.flash app.use() will use that , otherwise this will be undefined
    res.locals.error = req.flash('error')
    next() //passes to the next middleware after this has been executed
})

//example of creating a user using passport, hard coded in a username and email address
app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'fakeassemail@gmail.com', username: 'fakeassUsername' })
    const newUser = await User.register(user, 'hogwarts') //Takes the entire instance of the user model and then hashes the password which is 'hogwarts'
    res.send(newUser)
})

app.use('/', usersRoutes) //Uses the userRoutes router

app.use('/campgrounds', campgroundRoutes) //Uses the campgroundRoutes router

app.use('/campgrounds/:id/reviews', reviewRoutes) //Uses  the reviewRoutes router


app.listen(3000, () => {
    console.log('On the post 3000')
})





app.all('*', (req, res, next) => {
    next(new expressError('Page not Found', 404))
})

app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Oh no , something went wrong :(' //If there is no message property in the error object the default err.message will be this.
    const { statusCode = 500, message = "Something went wrong..." } = err // destructures from the err object is the same as const statusCode = err.statusCode , const message = err.message   
    res.status(statusCode).render('errorPage.ejs', { err }) //passes the error object to the rendered errorPage.ejs
})



app.get('/', (req, res) => {
    res.send('Hello from Yelpcamp')
})



app.get('/home', (req, res) => {
    res.render('home')
})

