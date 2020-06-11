const helmet = require("helmet");
const compression = require("compression");

// middleware for production environment
module.exports = function (app) {
  // 3rd party middleware: helmet to help set some HTTP response headers
  app.use(helmet());
  // 3rd party middleware: compress the HTTP response sent to client
  app.use(compression());
};

