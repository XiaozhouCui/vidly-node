module.exports = function (req, res, next) {
  // 401: Unauthorised - invalid token
  // 403: Forbidden - valid token but no previlige
  if (!req.user.isAdmin) return res.status(403).send("Access denied.");
  next();
};
