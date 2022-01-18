const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MONGO CONNECTION ERROR:'));
db.once('open', () => {
  console.log('MONGO DB CONNECTED');
});

const app = express();

app.set('view engine', 'ejs');
app.set('vies', path.join(__dirname, 'views'));

// ************
// MIDDLEWARE
// ************

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// **********
// ROUTES
// **********

app.get('/', (req, res) => {
  res.render('home');
});

app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000');
});
