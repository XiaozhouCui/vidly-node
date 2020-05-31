const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  mongoose
    .connect("mongodb://localhost/vidly", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => winston.info("Connected to MongoDB..."));
  // global error handler will deal the rejected promises
  // .catch((err) => console.error("Could not connect to MongoDB...", err));
};
