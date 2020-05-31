const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const morgan = require("morgan");

module.exports = function (app) {
  // use morgan as logger
  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
    startupDebugger("Morgan enabled..."); // need to run in terminal: set DEBUG=app:startup
  }

  // DB work...
  dbDebugger("Connected to the database..."); // need to run in terminal: set DEBUG=app:db
};
