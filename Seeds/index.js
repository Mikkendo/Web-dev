/*This file is for seeding the database we seperate it from our Yelpcamp index.js directory to avoid clutter*/

const mongoose = require('mongoose') //acquires mongoose
const Campground = require('../models/campground') //imports the schema from campground.js the double dots ../models means it back out one directory out
const cities = require('./cities') //imports the array of cities in the cities.js file and saves it to a variable called cities.
const { places, descriptors } = require('./seedHelpers') /*imports array from places and descriptors and destructures them.The identifier before the colon (:) is the property of the object
and the identifier after the colon is the variable.If the variables have the same names as the properties of the object, you can make the code more concise. 
const { places, descriptors } is the same as typing const { places : places, descriptors: descriptors } the left side being property and the right side being the variable its saved in.*/

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', { //Connects mongoose to MongoDB and names the database yelp-camp
    useNewUrlParser: true, // We pass the useNewUrlParser: true to avoid the DeprecationWarning. If they find a bug in the new parser this code will allow users to fall back to the old parser
    useUnifiedTopology: true //False by default. Set to true to opt in to using the MongoDB driver's new connection management engine. You should set this option to true, except for the unlikely case that it prevents you from maintaining a stable connection.
})

const db = mongoose.connection //This is to make sure the connection to MongoDB was successful
db.on("error", console.error.bind(console, "connection error:")) //If an error occurs logs in an error
db.once("open", () => {
    console.log("Database connected")//If connection is a success logs in "Database connected"
})


const sample = array => array[Math.floor(Math.random() * array.length)]
/*Is the same as... 
    
const sample = function(array) {
    return array[Math.floor(Math.random() * array.length)];
}

1. Math.random() * array.length generates a random number between 0 (inclusive) and the length of the array (exclusive).

2. Math.floor() rounds that number down to the nearest whole number. This is necessary because arrays are 0-indexed and use integer indices.

3. array[...] gets the element at the randomly generated index in the array.

So i guess it will be like return array[whatever the result of the formula is] so it returns array[2] as an example
*/



/*seedDB randomly selects 50 cities from the cities.js file and saves the city and state to MongoDB */
const seedDB = async () => {
    await Campground.deleteMany({}); //Deletes everything in the database
    for (let i = 0; i < 50; i++) { //loops over block of code 50 times
        const random1000 = Math.floor(Math.random() * 1000);// math.random returns a number between 0 and less than 1 (includes decimal numbers), *1000 times math.random by 1000 , math.floor makes that number a whole number
        const price = Math.floor(Math.random() * 20) + 10 //for the price of the campground
        const camp = new Campground({ //creates a new document based on the Campground model and saves it in a variable named camp
            author: '64ccc8c515340014de9cb017',
            location: `${cities[random1000].city},${cities[random1000].state}`,/* cities is an array that we imported from cities.js. random1000 gives us a whole number from 0 to 1000 
            so {cities[random1000].city} could randomly be cities[2].city which would be chicago.Remember how we access array elements*/
            title: `${sample(descriptors)}, ${sample(places)}`,//Uses the sample function and passes in descriptors and places as arguments which was imported and destructored from const { places, descriptors } = require('./seedHelpers')
            image: 'https://source.unsplash.com/random/?camping',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque velit placeat eos expedita iusto maxime rem quaerat laborum doloremque, amet tempore, harum quisquam, excepturi facilis eaque consequuntur odit ut sunt?',
            price: price
        })

        await camp.save() //saves the result from the variable camp into MongoDB
    }
}

seedDB().then(() => {
    mongoose.connection.close()
}) //executes seedDB function and then closes the connection after, because once we added our seed data in we won't need to do anything else after remeber this file is just for adding the initial seed data to fill our database