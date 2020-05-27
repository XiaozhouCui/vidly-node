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

  // // save user into database
  // user = new User({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  // });

  // lodash pick() return a new object with only the listed properties
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10); // salt: 10 rounds by default
  user.password = await bcrypt.hash(user.password, salt); // hash the password
  await user.save();

  // res.send({
  //   name: user.name,
  //   email: user.email,
  // });
  res.send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
