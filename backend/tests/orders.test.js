require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const InventoryItem = require("../models/InventoryItem");
const Order = require("../models/Order");

jest.setTimeout(15000);

let server;
let testItem;
let validUserId = new mongoose.Types.ObjectId(); 
let managerId = "67cb0e3f9e93986dda6b20cf"; 

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: "Mock notification sent" } })),
}));

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  server = app.listen(0);

  testItem = await InventoryItem.create({
    name: "Test Apple",
    basePrice: 2.5,
    stockLevel: 15,
    salesTrend: 30,
    expirationDate: "2025-12-31",
    category: "Fruits",
  });
});

afterAll(async () => {
  await InventoryItem.deleteMany({});
  await Order.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe("Orders API", () => {
  it("should place a valid order and reduce stock", async () => {
    const res = await request(server).post("/api/orders").send({
      userId: validUserId,
      items: [{ itemId: testItem._id, quantity: 3 }],
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Order placed successfully!");
    expect(res.body.totalAmount).toBeGreaterThan(0);

    const updatedItem = await InventoryItem.findById(testItem._id);
    expect(updatedItem.stockLevel).toBe(12);
  });

  it("should reject order if itemId is invalid", async () => {
    const res = await request(server).post("/api/orders").send({
      userId: validUserId,
      items: [{ itemId: "invalid-id", quantity: 2 }],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid item ID/i);
  });

  it("should reject order if stock is insufficient", async () => {
    const res = await request(server).post("/api/orders").send({
      userId: validUserId,
      items: [{ itemId: testItem._id, quantity: 999 }],
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/not enough stock/i);
  });

  it("should fetch order history for a user", async () => {
    const res = await request(server).get(`/api/orders/user/${validUserId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return error for invalid user ID in history", async () => {
    const res = await request(server).get("/api/orders/user/invalid123");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/invalid user ID format/i);
  });
});