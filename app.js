const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const sessionConfig = {
  secret: 'thiswillchangetoabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expires in one week (ms)
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const User = require('./models/user');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

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

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session()); // must come after session initialization
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// **********
// ROUTERS
// **********
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

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
