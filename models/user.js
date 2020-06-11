const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true, // email must be unique
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024, // for hashed password
  },
  isAdmin: Boolean,
  // roles: ['moderator', 'guest'],
  // operations: ['deleteGenres', 'createGenres'],
});

// Information Expert Principle
// Schema.methods returns an object, it allows us to add methods to a schema object (not Schema Class)
userSchema.methods.generateAuthToken = function () {
  // sign the jwt with user._id as payload, and an envirnoment variable as private key
  // no arrow function, "this" refers to the user instance generated from this Schema
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  ); // private stored in env "vidly_jwtPrivateKey"
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(3).max(255).required().email(), // email()
    password: Joi.string().min(5).max(255).required(), // password before hash
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.validate = validateUser;
