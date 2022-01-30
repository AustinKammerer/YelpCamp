const mongoose = require('mongoose');
require('dotenv').config();
const cities = require('./cities');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

const { places, descriptors, images } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

// function for getting a random sample from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    // get a random index from the cities array
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const location = `${cities[random1000].city}, ${cities[random1000].state}`;
    const geoData = await geocoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();
    const camp = new Campground({
      author: '61f43c736abb7a306e75bc89',
      location,
      geometry: geoData.body.features[0].geometry,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: sample(images),
      description:
        'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Et veritatis rem delectus earum, tempore velit, voluptatem ducimus, voluptates doloremque necessitatibus magnam odit. A, officia eius distinctio consectetur optio reprehenderit velit?',
      price,
    });

    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
