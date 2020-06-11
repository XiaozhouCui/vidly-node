const Joi = require("@hapi/joi");
const moment = require("moment");
const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
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
});

// define a class-level static method lookup() for the Rental class ("this" is a Class)
rentalSchema.statics.lookup = function(customerId, movieId) {
  // return a promise, and "await" the lookup() method elsewhere.
  return this.findOne({
    // access _id of subdocument
    "customer._id": customerId,
    "movie._id": movieId,
  });
}

// Information Expert Principle
// define an instance-level method return() for a rental object ("this" is an object)
rentalSchema.methods.return = function() {
  this.dateReturned = new Date(); // set return date to now

  rentalDays = moment().diff(this.dateOut, "days"); // calculate rental days using moment
  this.rentalFee = rentalDays * this.movie.dailyRentalRate; // calculate rental fee
}

// define the Rental class
const Rental = mongoose.model("Rental", rentalSchema);

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
