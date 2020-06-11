const Joi = require("@hapi/joi");
const validate = require("../middleware/validate");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  // // Validation is now handled by validate middleware
  // if (!req.body.customerId)
  //   return res.status(400).send("customerId not provided");
  // if (!req.body.movieId) return res.status(400).send("movieId not provided");

  // use a class-level static method lookup() from Rental class, to get a rental object
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("Rental not found");

  // if we pass above tests, it means we do have a rental object
  if (rental.dateReturned)
    return res.status(400).send("Return already processed");

  // if we pass above tests, it means we have a valid request, then we can set rental properties
  // Information Expert Principle
  // return() is an instance-level method of Rental class, it sets return date and rental fee
  rental.return();
  await rental.save();

  // updating the movie
  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(req);
}

module.exports = router;
