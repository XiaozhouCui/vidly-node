const express = require("express");
const helmet = require("helmet");
const genres = require("../routes/genres");
const customers = require("../routes/customers");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const home = require("../routes/home");
const error = require("../middleware/error");

module.exports = function (app) {
  // built-in middleware: parse json in req and populate req.body
  app.use(express.json());
  // built-in middleware: parse web form body key1=value1&key2=value2... and populate req.body
  app.use(express.urlencoded({ extended: true }));
  // built-in middleware: give access to static assets from url (e.g. localhost:3000/readme.txt)
  app.use(express.static("public"));
  // 3rd party middleware: helmet to help set some HTTP response headers
  app.use(helmet());
  // route handlers start here
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/", home);

  // Error catching middleware after all other middlewares
  app.use(error); // only passing a reference to "error" function, not invoking error()
};
