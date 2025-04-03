require("dotenv").config({ path: ".env.test" });
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const InventoryItem = require("../models/InventoryItem");

jest.mock("axios", () => ({
  post: jest.fn(() => Promise.resolve({ data: { message: "Mock notification sent" } }))
}));

let server;
let createdItemId;
let nonExistentValidId = new mongoose.Types.ObjectId();

jest.setTimeout(15000);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  server = app.listen(0);

  const item = await new InventoryItem({
    name: "Test Product",
    description: "Sample",
    basePrice: 10.99,
    stockLevel: 5,
    salesTrend: 60,
    expirationDate: "2025-12-31",
    category: "Snacks",
  }).save();

  createdItemId = item._id;
});

afterAll(async () => {
  await InventoryItem.deleteMany({});
  await mongoose.connection.close();
  server.close();
});

describe("Inventory API", () => {
  it("should get all inventory items", async () => {
    const res = await request(server).get("/api/inventory");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should get a single item by ID", async () => {
    const res = await request(server).get(`/api/inventory/${createdItemId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name", "Test Product");
  });

  it("should return 404 for non-existing item", async () => {
    const res = await request(server).get(`/api/inventory/${nonExistentValidId}`);
    expect(res.statusCode).toBe(404);
  });

  it("should create a new inventory item", async () => {
    const res = await request(server).post("/api/inventory").send({
      name: "New Item",
      description: "Fresh stock",
      basePrice: 9.99,
      stockLevel: 10,
      salesTrend: 20,
      expirationDate: "2025-12-31",
      category: "Drinks",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "New Item");
  });

  it("should reject creation without basePrice", async () => {
    const res = await request(server).post("/api/inventory").send({
      name: "No Price",
    });

    expect(res.statusCode).toBe(400);
  });

  it("should update an inventory item", async () => {
    
    const testItem = await InventoryItem.create({
      name: "Initial Item",
      description: "For update testing",
      basePrice: 15.0,
      stockLevel: 20,
      salesTrend: 70,
      expirationDate: new Date("2025-12-31"),
      category: "Snacks"
    });
  
    expect(testItem._id).toBeDefined();
  
   
    const res = await request(server)
      .put(`/api/inventory/${testItem._id}`)
      .send({
        name: "Updated Test Product",
        description: "Updated Description",
        basePrice: 10.5,
        stockLevel: 4,
        image: "updated.jpg"
      });
  
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("updatedItem");
    expect(res.body.updatedItem).toHaveProperty("name", "Updated Test Product");
  });

  it("should send change request for an item", async () => {
    const res = await request(server)
      .post("/api/inventory/request-change")
      .send({
        itemId: createdItemId.toString(),
        message: "Change base price to 8.99",
        employee: "John",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Request sent/i);
  });

  it("should fail change request with non-existent ObjectId", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(server).post("/api/inventory/request-change").send({
      itemId: fakeId,
      employee: "Jane",
      message: "Invalid item ID test",
    });

    expect(res.statusCode).toBe(404);
  });
});