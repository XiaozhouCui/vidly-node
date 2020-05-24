const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

const Movie = mongoose.model(
  "Movie",
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      trim: true, // get rid of padding
      minlength: 3,
      maxlength: 255,
    },
    genre: {
      type: genreSchema, // embeded schema as type
      required: true,
    },
    numberInStock: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
    dailyRentalRate: {
      type: Number,
      required: true,
      min: 0,
      max: 255,
    },
  })
);

function validateMovie(movie) {
  // Joi schema is what clients send us
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    genreId: Joi.string().required(), // client will only send genre ID, selected from a dropdown menu
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
  });
  return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validate = validateMovie;
