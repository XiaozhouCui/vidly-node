const { Rental, validate } = require("../models/rental");
const { Customer } = require("../models/customer");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const express = require("express");
const router = express.Router();

// Initialise Fawn for "transaction"
Fawn.init(mongoose);

router.get("/", auth, async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // customer ID is in request body, find the IDs in customer collection
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");
  // movie ID is in request body, find the IDs in movie collection
  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie.");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie out of stock");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
    // dateOut is not required, as its default value will be saved during rental.save()
  });
  // perform Fawn "transaction" of two queries: save rental and update movie stock
  // Fawn will internally perform perform "2-phase commits" in MongoDB, and generate a temporary collection
  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update(
        "movies",
        { _id: movie._id },
        {
          $inc: { numberInStock: -1 },
        }
      )
      .run();

    res.send(rental);
  } catch (ex) {
    res.status(500).send("Something failed.");
  }
});

router.get("/:id", auth, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental not found.");
  res.send(rental);
});

router.delete("/:id", auth, async (req, res) => {
  const rental = await Rental.findByIdAndRemove(req.params.id);
  if (!rental) return res.status(404).send("Rental already deleted.");
  res.send(rental);
});

module.exports = router;
