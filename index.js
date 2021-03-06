const winston = require("winston");
const express = require("express");
const app = express();

// logging error first, in case other processes fail
require("./startup/logging")();
// allow CORS to add "Access-Control-Allow-Origin" in response header
require("./startup/cors")(app);
// call route handlers and middlewares
require("./startup/routes")(app);
// call db connection function
require("./startup/db")();
// call config function
require("./startup/config")(app);
// call validation function
require("./startup/validation")();
// call miscelaneous function
require("./startup/misc")(app);
// middleware for production environment
require("./startup/prod")(app);

// throw new Error("Something failed suring startup.");
// const p = Promise.reject(new Error("Something failed miserably!"));
// p.then(() => console.log("Done"));

app.set("view engine", "pug");
app.set("views", "./views"); // default

const port = process.env.PORT || 3900;
const server = app.listen(port, () =>
  winston.info(`Listening to port ${port}...`)
);

module.exports = server;
