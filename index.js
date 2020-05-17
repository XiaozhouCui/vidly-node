const express = require("express");
const bodyParser = require("body-parser");
const Joi = require("@hapi/joi");
const app = express();

// parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

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
