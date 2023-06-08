const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console.error, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //Admin Phil ID
            author: '6479b7ecffb48528210759bd',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Enim ipsum distinctio in magnam at sapiente, earum, modi tempore quos fugiat possimus delectus veniam vel, alias perferendis. Corrupti quo odio atque.',
            price,
            geometry: {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dsxspcjcm/image/upload/v1685959878/YelpCamp/y9zlbankmvjoqsoeqgqb.jpg',
                    filename: 'YelpCamp/y9zlbankmvjoqsoeqgqb',

                },
                {
                    url: 'https://res.cloudinary.com/dsxspcjcm/image/upload/v1685960767/YelpCamp/d5sta3p0qeowdvddjntq.jpg',
                    filename: 'YelpCamp/d5sta3p0qeowdvddjntq',

                }
            ]

        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});