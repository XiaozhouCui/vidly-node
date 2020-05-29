const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // server is expecting a "x-auth-token" header from client
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");
  // verify a token with private key
  try {
    // if valid, jwt.verify() will return the decoded payload: {_id: user._id} defined in user.generateAuthToken()
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decoded; // save the decoded payload as user property of request
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
