const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// GET list of all campgrounds
router.get('/', catchAsync(campgrounds.index));

// GET form for adding campgrounds
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// GET a campground by id
router.get('/:id', catchAsync(campgrounds.showCampground));

// GET form for editing campground
router.get(
  '/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// POST a new campground to db
router.post(
  '/',
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

// PUT for updating a campground
router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

// DELETE a specific campground by id
router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);

module.exports = router;
