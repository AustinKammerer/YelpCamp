module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // store the url they are requesting:
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'Please login to continue!');
    return res.redirect('/login');
  }
  next();
};
