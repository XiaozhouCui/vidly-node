const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  // handle uncaught synchronous exceptions outside Express
  winston.handleExceptions(
    new winston.transports.Console({ colorize: true, prettyPrint: true }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  // handle uncaught promise rejections outside Express
  process.on("unhandledRejection", (ex) => {
    // winston.error(ex.message, ex);
    // process.exit(1);
    throw ex;
  });
  // // alternative way of handling uncaught synchronous exceptions outside Express
  // process.on("uncaughtException", (ex) => {
  //   winston.error(ex.message, ex);
  //   process.exit(1);
  // });

  // INSIDE EXPRESS:
  // via error middleware, log errors into "logfile.log"
  winston.add(winston.transports.File, { filename: "logfile.log" });
  // with "winston-mongodb", errors will be logged into MongoDB
  winston.add(winston.transports.MongoDB, {
    db: "mongodb://localhost/vidly",
    level: "error", // only "error" level will be logged into DB, others will be logged into file
  });
};
