const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');

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

// GET list of all campgrounds
app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds });
});

// GET form for adding campgrounds
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// GET form for editing campground
app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/edit', { campground });
});

// GET a campground by id
app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground });
});

// POST a new campground to db
app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
});

app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000');
});
