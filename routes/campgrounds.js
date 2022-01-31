const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
  isValidIdFormat,
} = require('../middleware');

router
  .route('/')
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('images'),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
  .route('/:id')
  .get(isValidIdFormat, catchAsync(campgrounds.showCampground))
  .put(
    isValidIdFormat,
    isLoggedIn,
    isAuthor,
    upload.array('images'),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  '/:id/edit',
  isValidIdFormat,
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
