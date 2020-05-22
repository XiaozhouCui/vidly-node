const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Genre = mongoose.model(
  "Genre",
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
  })
);

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.post("/", async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let genre = new Genre({ name: req.body.name });
  genre = await genre.save(); // save() returns the new genre with _id
  res.send(genre);
});

router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    res.status(404).send("Genre with the given ID was not found");
    return; // stop executing following code
  }
  res.send(genre);
});

router.put("/:id", async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!genre)
    return res.status(404).send("The genre with the given ID was not found");
  res.send(genre);
});

router.delete("/:id", async (req, res) => {
  const genre = await Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(404).send("Genre already deleted");
  res.send(genre);
});

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(genre);
}

module.exports = router;
