const morgan = require("morgan");
const helmet = require("helmet");
const Joi = require("@hapi/joi");
const logger = require("./logger");
const auth = require("./auth");
const express = require("express");
const app = express();

// parse json in req and populate req.body
app.use(express.json());
// parse web form body key1=value1&key2=value2... and populate req.body
app.use(express.urlencoded({ extended: true }));
// give access to static assets from url (e.g. localhost:3000/readme.txt)
app.use(express.static("public"));
// helmet to help set some HTTP response headers
app.use(helmet());
// use morgan as logger
app.use(morgan("tiny"));

app.use(logger);

app.use(auth);

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Horror" },
  { id: 3, name: "Romance" },
];

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/genres", (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const genre = {
    id: genres.length + 1,
    name: req.body.name,
  };
  genres.push(genre);
  res.send(genre);
});

app.get("/api/genres", (req, res) => {
  res.send(genres);
});

app.get("/api/genres/:id", (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre) {
    res.status(404).send("Genre with the given ID was not found");
    return; // stop executing following code
  }
  res.send(genre);
});

app.put("/api/genres/:id", (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Genre not found");
  genre.name = req.body.name;
  res.send(genre);
});

app.delete("/api/genres/:id", (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Genre already deleted");
  index = genres.indexOf(genre);
  genres.splice(index, 1);
  res.send(genre);
});

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
  });
  return schema.validate(genre);
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening to port ${port}...`));
