const Joi = require("@hapi/joi");
const moment = require("moment");
const validate = require("../middleware/validate")
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

  const rental = await Rental.findOne({
    // access _id of subdocument
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });
  if (!rental) return res.status(404).send("Rental not found");

  // if we pass above tests, it means we do have a rental object
  if (rental.dateReturned)
    return res.status(400).send("Return already processed");

  // if we pass above tests, it means we have a valid request, then we can set rental properties
  rental.dateReturned = new Date();
  rentalDays = moment().diff(rental.dateOut, "days");
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;
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
