const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body); // grab the validation error, if any
  if (error) {
    const message = error.details.map((el) => el.message).join(','); // map the error messages
    throw new ExpressError(400, message); // pass it to the custom error class
  } else {
    next();
  }
};

// GET list of all campgrounds
router.get(
  '/',
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

// GET form for adding campgrounds
router.get('/new', (req, res, next) => {
  res.render('campgrounds/new');
});

// GET a campground by id
router.get(
  '/:id',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate(
      'reviews'
    );
    res.render('campgrounds/show', { campground });
  })
);

// GET form for editing campground
router.get(
  '/:id/edit',
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

// POST a new campground to db
router.post(
  '/',
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
router.put(
  '/:id',
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
router.delete(
  '/:id',
  catchAsync(async (req, res, next) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
  })
);

module.exports = router;
