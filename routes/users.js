const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // make sure user is not already registered
  let user = await User.findOne({ email: req.body.email }); // findOne(), not find by id
  if (user) return res.status(400).send("User already registered.");

  // lodash _.pick() return a new object with only the listed properties
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10); // salt: 10 rounds by default
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  await user.save();
  // sign and send jwt to client, so they don't have to login after a successful register
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token) // include token in a custom header (starts with "x")
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
