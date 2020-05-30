const auth = require("../middleware/auth"); // authorisation
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();

// get the current user, can't user "/:id", because a user can see the details of other users by sending id
// auth middleware makes sure that only authorised user can get to this route handler
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password"); // exclude the hashed password
  res.send(user);
});

// register a new user
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
