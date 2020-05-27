const { User } = require("../models/user");
const mongoose = require("mongoose");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // if user email doesn't exist, reject the auth with 400, not 404
  let user = await User.findOne({ email: req.body.email }); // findOne(), not find by id
  if (!user) return res.status(400).send("Invalid email or password.");
  // compare the plain password with the hashed password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");
  // if passed above validation, return true
  res.send(true);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(3).max(255).required().email(), // email()
    password: Joi.string().min(5).max(255).required(), // password before hash
  });
  return schema.validate(req);
}

module.exports = router;
