const express = require("express");
const router = express.Router();
const InventoryItem = require("../models/InventoryItem");
const Order = require("../models/Order");
const axios = require("axios"); 
const mongoose = require("mongoose");
router.post("/", async (req, res) => {
  try {
    console.log("📢 Received Order Request:", req.body);

    const { userId, items } = req.body;

    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid order items" });
    }

    let totalAmount = 0;

    for (let orderItem of items) {
      if (!mongoose.Types.ObjectId.isValid(orderItem.itemId)) {
        return res.status(400).json({ error: `Invalid item ID format: ${orderItem.itemId}` });
      }
      const inventoryItem = await InventoryItem.findById(orderItem.itemId);

      if (inventoryItem.stockLevel < orderItem.quantity) {
        return res.status(400).json({ error: `Not enough stock for ${inventoryItem.name}` });
      }

      
      inventoryItem.stockLevel -= orderItem.quantity;
      await inventoryItem.save();

      
      totalAmount += inventoryItem.basePrice * orderItem.quantity;

      
      if (inventoryItem.stockLevel < 10) {
        const managerId = "67cb0e3f9e93986dda6b20cf"; 

        try {
          await axios.post("http://localhost:5001/api/notifications", {
            userId: managerId,
            role: "manager",
            message: `Low stock alert: ${inventoryItem.name} has only ${inventoryItem.stockLevel} left!`
          });

          console.log(` Notification sent for low stock of ${inventoryItem.name}`);
        } catch (notifyError) {
          console.error(" Failed to send low stock notification:", notifyError.response?.data || notifyError.message);
        }
      }
    }

    
    const newOrder = new Order({ userId, items, totalAmount });
    await newOrder.save();
    try {
      await axios.post("http://localhost:5001/api/notifications", {
        userId,
        role: "shopper",
        message: ` Order placed! Total: $${totalAmount.toFixed(2)} | Items: ${items.length}`,
      });
      console.log(" Shopper notified about order placement");
    } catch (err) {
      console.error("Failed to send shopper notification:", err.response?.data || err.message);
    }res.status(201).json({ message: "Order placed successfully!", totalAmount });

  } catch (error) {
    console.error(" Error placing order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    const orders = await Order.find({ userId }).populate("items.itemId");
    res.json(orders);
  } catch (error) {
    console.error("\u274c Error fetching order history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;