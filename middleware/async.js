// This middleware is replaced with require("express-async-errors");
module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (ex) {
      // pass control to the error handling middleware registered in Index.js
      next(ex); // argument "ex" will become the first "err" parameter of error handling middleware
    }
  };
};
