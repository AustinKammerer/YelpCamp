class ExpressError extends Error {
  constructor(statusCode, message) {
    super(); // calls Error's constructor
    this.statusCode = statusCode;
    this.message = message;
  }
}

module.exports = ExpressError;
