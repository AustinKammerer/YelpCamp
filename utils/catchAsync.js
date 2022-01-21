// this function will wrap async functions and pass any errors to next()
module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};
