require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");
const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/auth");
const home = require("./routes/home");
const error = require("./middleware/error");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

// // handle uncaught synchronous exceptions outside of Express
// process.on("uncaughtException", (ex) => {
//   winston.error(ex.message, ex);
//   process.exit(1);
// });

// alternative way of handling uncaught synchronous exceptions outside of Express
winston.handleExceptions(
  new winston.transports.File({ filename: "uncaughtExceptions.log" })
);

// handle uncaught promise rejections outside of Express
process.on("unhandledRejection", (ex) => {
  // winston.error(ex.message, ex);
  // process.exit(1);
  throw ex;
});

// via error middleware, log errors into "logfile.log"
winston.add(winston.transports.File, { filename: "logfile.log" });
// with "winston-mongodb", errors will be logged into MongoDB
winston.add(winston.transports.MongoDB, {
  db: "mongodb://localhost/vidly",
  level: "error", // only "error" level will be logged
});

// throw new Error("Something failed suring startup.");
const p = Promise.reject(new Error("Something failed miserably!"));
p.then(() => console.log("Done"));

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}
mongoose
  .connect("mongodb://localhost/vidly", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

//"config/custom-environment-variables.json" will map config settings to environment variables
// need to run in terminal: set NODE_ENV=development (or production)
// need to run in terminal: set app_password=1234
// need to run in terminal: set pk=1234
console.log("Application Name: " + config.get("name"));
console.log("Mail Server: " + config.get("mail.host"));
// console.log("Mail Password: " + config.get("mail.password"));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Mail Host Password: ${process.env.app_password}`);
console.log(`JWT Private Key: ${process.env.pk}`);
console.log(`app: ${app.get("env")}`);

// use morgan as logger
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled..."); // need to run in terminal: set DEBUG=app:startup
}

// DB work...
dbDebugger("Connected to the database..."); // need to run in terminal: set DEBUG=app:db

app.set("view engine", "pug");
app.set("views", "./views"); // default

// built-in middleware: parse json in req and populate req.body
app.use(express.json());
// built-in middleware: parse web form body key1=value1&key2=value2... and populate req.body
app.use(express.urlencoded({ extended: true }));
// built-in middleware: give access to static assets from url (e.g. localhost:3000/readme.txt)
app.use(express.static("public"));
// 3rd party middleware: helmet to help set some HTTP response headers
app.use(helmet());

app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/", home);

// Error catching middleware after all other middlewares
app.use(error); // only passing a reference to "error" function, not invoking error()

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));
