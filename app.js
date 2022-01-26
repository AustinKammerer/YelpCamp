const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
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

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body); // grab the validation error, if any
  if (error) {
    const message = error.details.map((el) => el.message).join(','); // map the error messages
    throw new ExpressError(400, message); // pass it to the custom error class
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // grab the validation error, if any
  if (error) {
    const message = error.details.map((el) => el.message).join(','); // map the error messages
    throw new ExpressError(400, message); // pass it to the custom error class
  } else {
    next();
  }
};

// **********
// ROUTES
// **********

// CAMPGROUNDS

app.get('/', (req, res) => {
  res.render('home');
});

// GET list of all campgrounds
app.get(
  '/campgrounds',
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

// GET form for adding campgrounds
app.get('/campgrounds/new', (req, res, next) => {
  res.render('campgrounds/new');
});

// GET form for editing campground
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

// GET a campground by id
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    res.render('campgrounds/show', { campground });
  })
);

// POST a new campground to db
app.post(
  '/campgrounds',
  validateCampground,
  catchAsync(async (req, res, next) => {
    // if (!req.body.campground)
    //   throw new ExpressError(400, 'Invalid Campground Data');

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// PUT for updating a campground
app.put(
  '/campgrounds/:id',
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      { ...req.body.campground },
      { runValidators: true, new: true }
    );
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// DELETE a specific campground by id
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
  })
);

// POST a new review
app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// DELETE a review
app.delete(
  '/campgrounds/:id/reviews/:reviewId',
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull removes the reference from reviews array
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

// ****************
// ERROR HANDLING
// ****************
app.all('*', (req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Sorry, something went wrong...';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000');
});
