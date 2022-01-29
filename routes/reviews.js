const express = require('express');
const router = express.Router({ mergeParams: true }); // so we have access to route params in the router URL prefix

const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

// POST a new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// DELETE a review
router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
