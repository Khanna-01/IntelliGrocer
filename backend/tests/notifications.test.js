require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Notification = require("../models/Notification");

let server;
let mockUserId;

jest.setTimeout(15000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  server = app.listen(0);
  mockUserId = new mongoose.Types.ObjectId();

  
  await Notification.create({
    userId: mockUserId,
    role: "manager",
    message: "🔔 Test notification",
  });
});

afterAll(async () => {
  await Notification.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe("Notifications API", () => {
  it("should fetch notifications for a user", async () => {
    const res = await request(server).get(`/api/notifications/${mockUserId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("message", "🔔 Test notification");
  });

  it("should create a new notification", async () => {
    const res = await request(server).post("/api/notifications").send({
      userId: mockUserId,
      message: "📣 New update available",
      role: "manager",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.notification).toHaveProperty("message", "📣 New update available");
  });

  it("should mark notifications as read", async () => {
    const res = await request(server).patch(`/api/notifications/mark-read/${mockUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/marked as read/i);
  });

  it("should clear all notifications for a user", async () => {
    const res = await request(server).delete(`/api/notifications/clear/${mockUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/cleared/i);
  });

  it("should reject creation with invalid userId format", async () => {
    const res = await request(server).post("/api/notifications").send({
      userId: "invalid123",
      message: "Should fail",
      role: "manager",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid user ID format/i);
    });
});