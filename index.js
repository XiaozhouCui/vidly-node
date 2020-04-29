const express = require("express");
const app = express();
const Joi = require("@hapi/joi");

const genres = [
  { id: 1, name: "genre1" },
  { id: 2, name: "genre2" },
  { id: 3, name: "genre3" },
];

app.get("/", (req, res) => {
  res.send("Hello World!");
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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
