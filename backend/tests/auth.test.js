require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

let server;
let testUserId;

jest.setTimeout(20000); 

beforeAll(async () => {
 
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  
  server = app.listen(0);
});

afterAll(async () => {
 
  if (testUserId) {
    await User.findByIdAndDelete(testUserId);
  }

  await mongoose.connection.close();
  server.close();
});

describe("Auth API", () => {
  it("should register a new user", async () => {
    const uniqueUsername = `user_${Date.now()}`;
    const res = await request(server).post("/api/auth/register").send({
      username: uniqueUsername,
      email: `${uniqueUsername}@test.com`,
      password: "securepass",
      role: "employee",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");

   
    const user = await User.findOne({ username: uniqueUsername });
    testUserId = user._id;
  });

  it("should fail register with missing fields", async () => {
    const res = await request(server).post("/api/auth/register").send({
      username: "missingpassword",
    });

    expect(res.statusCode).toBe(400);
  });

  
it("should update user profile with new role", async () => {
    const res = await request(server)
      .put(`/api/auth/update/${testUserId}`)
      .send({ role: "manager" }); 
  
    expect(res.statusCode).toBe(200);
  });
});