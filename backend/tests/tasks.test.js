require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Task = require("../models/Task");
const Notification = require("../models/Notification");


jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: "Mock notification sent" } })),
}));

let server;
let testEmployeeId;
let testTaskId;
let nonExistentId = new mongoose.Types.ObjectId();

jest.setTimeout(15000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  server = app.listen(0);

  
  testEmployeeId = new mongoose.Types.ObjectId();

  const task = await new Task({
    title: "Initial Task",
    description: "Do something important",
    assignedTo: testEmployeeId,
  }).save();

  testTaskId = task._id;
});

afterAll(async () => {
  await Task.deleteMany({});
  await Notification.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe("Task API", () => {
  it("should fetch all tasks", async () => {
    const res = await request(server).get("/api/tasks/");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fetch tasks for a valid employee ID", async () => {
    const res = await request(server).get(`/api/tasks/${testEmployeeId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 400 for invalid employee ID format", async () => {
    const res = await request(server).get("/api/tasks/invalid123");
    expect(res.statusCode).toBe(400);
  });

  it("should return 404 for non-existent employee task", async () => {
    const res = await request(server).get(`/api/tasks/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
  });

  it("should assign a new task to an employee", async () => {
    const res = await request(server).post("/api/tasks/").send({
      title: "New Task",
      description: "Complete the testing",
      assignedTo: testEmployeeId.toString(),
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("task");
    expect(res.body.task).toHaveProperty("title", "New Task");
  });

  it("should return 400 for assigning with invalid assignedTo ID", async () => {
    const res = await request(server).post("/api/tasks/").send({
      title: "Fail Task",
      description: "This should fail",
      assignedTo: "invalid123",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should mark a task as completed", async () => {
    const res = await request(server).patch(`/api/tasks/${testTaskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.updatedTask).toHaveProperty("status", "Completed");
  });

  it("should return 400 for invalid task ID", async () => {
    const res = await request(server).patch("/api/tasks/invalid123");
    expect(res.statusCode).toBe(400);
  });

  it("should return 404 for non-existent task ID", async () => {
    const res = await request(server).patch(`/api/tasks/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
  });
});