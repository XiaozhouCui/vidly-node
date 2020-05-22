const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const config = require("config");
const morgan = require("morgan");
const helmet = require("helmet");
const logger = require("./middleware/logger");
const auth = require("./middleware/auth");
const genres = require("./routes/genres");
const home = require("./routes/home");
const mongoose = require("mongoose");
const express = require("express");
const app = express();

mongoose
  .connect("mongodb://localhost/vidly", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

app.set("view engine", "pug");
app.set("views", "./views"); // default

// built-in middleware: parse json in req and populate req.body
app.use(express.json());
// built-in middleware: parse web form body key1=value1&key2=value2... and populate req.body
app.use(express.urlencoded({ extended: true }));
// built-in middleware: give access to static assets from url (e.g. localhost:3000/readme.txt)
app.use(express.static("public"));
// 3rd party middleware: helmet to help set some HTTP response headers
app.use(helmet());

app.use("/api/genres", genres);
app.use("/", home);

// Configuration
// need to run in terminal: set NODE_ENV=development (or production)
// need to run in terminal: set app_password=1234
console.log("Application Name: " + config.get("name"));
console.log("Mail Server: " + config.get("mail.host"));
console.log("Mail Password: " + config.get("mail.password"));
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Password: ${process.env.app_password}`);
console.log(`app: ${app.get("env")}`);

// use morgan as logger
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  startupDebugger("Morgan enabled..."); // need to run in terminal: set DEBUG=app:startup
}

// DB work...
dbDebugger("Connected to the database..."); // need to run in terminal: set DEBUG=app:db

app.use(logger);

app.use(auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));
