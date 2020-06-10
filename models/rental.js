const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Rental = mongoose.model(
  "Rental",
  mongoose.Schema({
    customer: {
      // not referring customer schema: because we don't need all the properties in customers schema.
      // new subdocument
      type: new mongoose.Schema({
        name: {
          type: String,
          required: true,
          minlength: 3,
          maxlength: 50,
        },
        isGold: {
          type: Boolean,
          default: false,
        },
        phone: {
          type: String,
          required: true,
          minlength: 5,
          maxlength: 50,
        },
      }),
      required: true,
    },
    movie: {
      // not reusing movie schema, because we only need 2 properties here
      type: new mongoose.Schema({
        title: {
          type: String,
          required: true,
          trim: true,
          minlength: 3,
          maxlength: 255,
        },
        dailyRentalRate: {
          type: Number,
          required: true,
          min: 0,
          max: 255,
        },
      }),
      required: true,
    },
    dateOut: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dateReturned: {
      type: Date,
      // not a required property, because it's only added when a movie is returned
    },
    rentalFee: {
      type: Number,
      min: 0,
    },
  })
);

// Only 2 variables from client side, other properties are filled by server
function validateRental(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validate = validateRental;
