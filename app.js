const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const morgan = require('morgan');

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ************
// MIDDLEWARE
// ************
// app.use functions will run on every request
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));

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

// PUT for updating a campground
app.put('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findByIdAndUpdate(
    req.params.id,
    { ...req.body.campground },
    { runValidators: true, new: true }
  );
  console.log(campground);
  res.redirect(`/campgrounds/${campground._id}`);
});

// DELETE a specific campground by id
app.delete('/campgrounds/:id', async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  res.redirect('/campgrounds');
});

app.use((req, res) => {
  res.status(404).send('404: NOT FOUND');
});

app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000');
});
