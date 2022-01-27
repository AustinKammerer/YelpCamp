const express = require('express');
const router = express.Router({ mergeParams: true }); // so we have access to route params in the router URL prefix

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // grab the validation error, if any
  if (error) {
    const message = error.details.map((el) => el.message).join(','); // map the error messages
    throw new ExpressError(400, message); // pass it to the custom error class
  } else {
    next();
  }
};

// POST a new review
router.post(
  '/',
  validateReview,
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new review!');
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

// DELETE a review
router.delete(
  '/:reviewId',
  catchAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // $pull removes the reference from reviews array
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
