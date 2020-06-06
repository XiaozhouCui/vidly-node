const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => winston.info(`Connected to ${db}...`));
  // global error handler will deal the rejected promises
  // .catch((err) => console.error("Could not connect to MongoDB...", err));
};
