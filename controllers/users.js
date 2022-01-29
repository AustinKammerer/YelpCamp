const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

module.exports.register = async (req, res, next) => {
  const { email, username, password } = req.body;
  try {
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    // log the user in after registering:
    req.login(registeredUser, (error) => {
      if (error) return next(error);
      req.flash('success', 'Welcome to YelpCamp!');
      res.redirect('/campgrounds');
    });
  } catch (error) {
    req.flash('error', error.message);
    res.redirect('/register');
  }
};

module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

module.exports.login = (req, res) => {
  req.flash('success', 'Welcome Back!');
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Logged you out!');
  res.redirect('/campgrounds');
};
