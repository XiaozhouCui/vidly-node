const request = require("supertest");
const { User } = require("../../models/user");
const { Genre } = require("../../models/genre");

describe("auth middleware", () => {
  // for each test suite, need to open and close server
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  let token;

  const exec = () => {
    // return a promise
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });
  // test an empty token
  it("should return 401 if no token is provided", async () => {
    token = ""; // can't be null, otherwise the token will be a string "null", and get a 400 response
    const res = await exec();
    expect(res.status).toBe(401);
  });
  // test an invalid token
  it("should return 400 if token is invalid", async () => {
    token = "a";
    const res = await exec();
    expect(res.status).toBe(400);
  });
  // test valid token
  it("should return 200 if token is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
