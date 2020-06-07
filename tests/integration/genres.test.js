const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;

describe("/api/genres", () => {
  // for each test suite, need to open and close server
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    server.close();
    // clean up all the inserted documents in database
    await Genre.remove({});
  });
  // test suite 1: get all genres
  describe("GET /", () => {
    it("should return all genres", async () => {
      // insert multiple documents into a collection in one command
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      // supertest get method will return a promise
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((genre) => genre.name === "genre1")).toBeTruthy();
      expect(res.body.some((genre) => genre.name === "genre2")).toBeTruthy();
    });
  });
  // test suite 2: get a single genre from /:id
  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();

      const res = await request(server).get("/api/genres/" + genre._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });
  });

  // test suite 3: post a new genre
  describe("POST /", () => {
    // testing authorisation
    it("should return 401 if client if client is not logged in", async () => {
      const res = await request(server)
        .post("/api/genres")
        .send({ name: "genre1" });
      expect(res.status).toBe(401);
    });
    // testing invalid input
    it("should return 400 if client if genre is less than 3 characters", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "ge" });
      expect(res.status).toBe(400);
    });
    // testing another invalid input
    it("should return 400 if client if genre is more than 50 characters", async () => {
      // generate a token for post request
      const token = new User().generateAuthToken();
      // generate a string of 51 characters
      const name = new Array(52).join("a");

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token) // set header with token
        .send({ name: name });
      expect(res.status).toBe(400);
    });
    // testing the data is saved in database
    it("should save the genre if if is valid", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token) // set header with token
        .send({ name: "genre1" });
      // query the database
      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });
    // testing the data is in response
    it("should return the genre if it is valid", async () => {
      const token = new User().generateAuthToken();

      const res = await request(server)
        .post("/api/genres")
        .set("x-auth-token", token) // set header with token
        .send({ name: "genre1" });
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });
});
