const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");
const mongoose = require("mongoose");

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

    it("should return 404 if no genre with the given ID exists", async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });
  });

  // test suite 3: post a new genre
  describe("POST /", () => {
    // Define the happy path, and then in each test, we change one parameter that clearly aligns with the name of the test.
    let token;
    let name;
    // happy path: exec() function to send a default post request
    const exec = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token) // set header with token
        .send({ name });
    };

    beforeEach(() => {
      // generate a token for post request
      token = new User().generateAuthToken();
      // set a default value for the genre name
      name = "genre1";
    });

    // testing authorisation
    it("should return 401 if client if client is not logged in", async () => {
      // explicitly set token to empty, because this test doesn't need token in exec() function
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    // testing invalid input
    it("should return 400 if client if genre is less than 3 characters", async () => {
      name = "ge";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    // testing another invalid input
    it("should return 400 if client if genre is more than 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });
    // testing the data is saved in database
    it("should save the genre if if is valid", async () => {
      await exec();
      // query the database
      const genre = await Genre.find({ name: "genre1" });
      expect(genre).not.toBeNull();
    });
    // testing the data is in response
    it("should return the genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  // test suite 4: update a genre
  describe("PUT /:id", () => {
    let token;
    let newName;
    let genre;
    let id;

    const exec = async () => {
      return await request(server)
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: newName });
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and put it in the database
      genre = new Genre({ name: "genre1" });
      await genre.save();

      token = new User().generateAuthToken();
      id = genre._id;
      newName = "updatedName";
    });

    // testing authorisation
    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
    // testing invalid input
    it("should return 400 if genre is less thant 3 characters", async () => {
      newName = "ge";
      const res = await exec();
      expect(res.status).toBe(400);
    });
    // testing another invalid input
    it("should return 400 if genre is greater thant 5 characters", async () => {
      newName = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });
    // testing invalid ID
    it("should return 404 if ID is invalid", async () => {
      id = 1; // need validateObjectId middleware, otherwise will send 500
      const res = await exec();
      expect(res.status).toBe(404);
    });
    // testing a valid ID that doesn't exist
    it("should return 404 if the genre with the given ID was not found", async () => {
      id = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });
    // testing valid input
    it("should update the genre if input is valid", async () => {
      await exec();
      const updatedGenre = await Genre.findById(genre._id);
      expect(updatedGenre.name).toBe(newName);
    });
    // testing returned genre in response
    it("should return the updated genre if it is valid", async () => {
      const res = await exec();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newName);
    });
  });

  // test suite 5: delete a genre
  describe("DELETE /:id", () => {
    let token;
    let genre;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      genre = new Genre({ name: "genre1" });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(403);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no genre with the given id was found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the genre if input is valid", async () => {
      await exec();

      const genreInDb = await Genre.findById(id);

      expect(genreInDb).toBeNull();
    });

    it("should return the removed genre", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id", genre._id.toHexString());
      expect(res.body).toHaveProperty("name", genre.name);
    });
  });
});
