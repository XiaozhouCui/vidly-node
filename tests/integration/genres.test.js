const request = require("supertest");
const { Genre } = require("../../models/genre");

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
  // test suite 2: all tests for /:id
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
});
