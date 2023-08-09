/**/



const express = require('express')
const router = express.Router()
const catchAsync = require('../ultilities/catchAsync') //acquires the catchAsync.js code to use as a basic error handler
const expressError = require('../ultilities/expressError') //acquires the expressError function from expressError.js
const Campground = require('../models/campground') //imports the schema from campground.js
const { campgroundSchema } = require('../joiSchema.js') //destructuring the exported schemas which are Joi objects
const { isLoggedIn } = require('../middleware')/*isLoggedIn is from middleware.js and has a method called isAuthenticated which is a method built into passport which 
will authenticate the request, if the user is not authenticated then */


/*In summary, this code is checking whether req.body matches the campgroundSchema, and if it doesn't, it constructs an error message detailing what went wrong and 
throws an error with this message. */
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body) /*This line of code validates req.body against the campgroundSchema. 
    The validate function returns an object that includes any error that occurred during validation. If validation is successful, error will be undefined. If not, 
    it will be an error object containing details about what went wrong.*/
    if (error) { /*This if statement checks whether validation produced an error. If error is undefined (meaning there was no error), 
    it will evaluate to false and the code block inside the if statement will be skipped. */
        const msg = error.details.map(el => el.message).join(',')/*If an error does exist, this line of code is executed. The error.details is an array containing one object for each 
        validation error that occurred. Each object has a message property, which is a string describing the error.
        The map function is used to create a new array that contains just these messages. The arrow function el => el.message is a shorthand way of defining a function that takes 
        an argument el (which will be an element from the error.details array) and returns el.message (the error message for that element). 
        The join(',') method is then used to convert this array of messages into a single string, with each message separated by a comma.*/
        throw new expressError(msg, 400) //If an error occurs, the code constructs a new error using expressError (our custom error class) and throws it.
    } else { //else it calls next() which will give it to the next route handler
        next()
    }
}

//Campground index route
router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}) //finds all documents in Campground
    res.render('./campgrounds/index', { campgrounds }) /* res.render() has 2 parameters, the first parameter sends the rendered view to the client and the second passes a local variable to the ejs file
    Passes { campgrounds } to be usable in the index.ejs file in views/campgrounds/index.ejs */
}))

//Campground form route, this has to be before the Campground show route else '/campgrounds/new'  the /new part will be treated as the id for '/campgrounds/:id'
router.get('/new', isLoggedIn, (req, res) => {
    res.render('./campgrounds/new')
})

//Campground create POST request route after you filled in the Campground form , needs router.use(express.urlencoded({ extended: true })) to parse the req.body for us
//validateCampground is a middleware function that we created using Joi , this function validates specific data to be passed on to the server if an error hrouterens then if will get passed to the expressError function.
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {/* This code is setting up an asynchronous function that is triggered whenever a POST request is made to the '/campgrounds' endpoint of your Express server. */
    const campground = new Campground(req.body.campground) /*This line is creating a new Campground object in the node router, using the Campground mongoose model. It does this by calling the Campground constructor and passing it the data from req.body.campground. req.body.campground is the information about the campground that was sent in the HTTP request by the client. */
    campground.author = req.user._id /*sets campground.author to be the req.user._id , so when a campground is created by the logged in user the campgrounds author will be associated 
    with the user, req.user is set to the authenticated user from passport  */
    await campground.save()/* This line of code is saving the newly created campground object to the MongoDB database. The await keyword is used because save() is an asynchronous operation - it might take a while to complete and we want to wait until it's done before moving to the next line of code.*/
    req.flash('success', 'Successfully made a new campground!') //Will flash this message when the new campground is made (from connect-flash package)
    res.redirect(`campgrounds/${campground._id}`)/* After the campground object has been saved to the database, this line of code sends an HTTP response back to the client, telling the client's browser to redirect to the URL of the newly created campground. The URL includes the ID of the campground, which is stored in campground._id. */
}))

//Campgrounds show route
router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author')  /*finds the campground with the id in the request object and saves it to a variable named camground,
    also uses the mongoose populate() method which will reference the reviews documents and author documents in mongoDB*/
    console.log(campground)
    if (!campground) { /*If mongoose cannot find the campground if then it will flash an error and redirect the user back to campgrounds */
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/show', { campground })/*Passes the variable campground to use in show.ejs*/
}))

//campground edit form
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id) //finds the document by id from the request params object
    if (!campground) { /*If mongoose cannot find the campground if then it will flash an error and redirect the user back to campgrounds */
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground }) //passes the result of findById as a variable to the ejs file
}))

//campground edits the campground
//validateCampground is a middleware function that we created using Joi , this function validates specific data to be passed on to the server if an error hrouterens then if will get passed to the expressError function.
router.put('/:id', validateCampground, isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params //Destructures the id property from the req.params object and saves it into a variable named id
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) /*findByIdAndUpdate method has 2 parameters, the first one is the value of the _id field which we
    got from the destructered id property and the second parameter is the object we are updating
    
    Quick lesson on the spread(...) on objects and arrays to explain { ...req.body.campground }
    
    The spread syntax passes in each individual value inside the array to the function as arguments

            let randomNumbers = [2,8,4,15,25,73]

            Math.min(...randomNumbers)

    is the same as

            Math.min(2,8,4,15,25,73)

    Now to explain { ...req.body.campground }        

    req.body.campground is an object 
    
    { campground: { title: 'Ocean, town', location: 'Victoria,Texas' } }
    
    Using the spread syntax  {...req.body.campground} will spread campground properties that was saved in MongoDB like this 

        {

        title: 'Ocean, town',

        location: 'Victoria,Texas'

        }


    */
    console.log(req.body)
    req.flash('success', 'Campground has been updated!')
    res.redirect(`/campgrounds/${campground._id}`)
}))


//campground delete
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params //destructures id property from req.params object body saves it into a variable id
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))

module.exports = router