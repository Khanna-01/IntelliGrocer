const InventoryItem = require("../models/InventoryItem");
const fetch = require("node-fetch"); 
const managerId = "67cb0e3f9e93986dda6b20cf"; 
const axios = require("axios");
const Notification = require("../models/Notification");



exports.getAllItems = async (req, res) => {
  try {
    const items = await InventoryItem.find();
    if (items.length === 0) return res.status(404).json({ message: "No inventory items found" });

    const updatedItems = items.map(item => {
      let factor = 1.0;
      let priceMessage = "";

      if (item.stockLevel > 30 && item.salesTrend < 50) factor -= 0.25;
      if (item.stockLevel < 10 && item.salesTrend > 70) factor += 0.30;
      const daysUntilExpiry = (new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiry < 7) factor -= 0.35;
      if (item.stockLevel > 50 && item.salesTrend > 60) factor -= 0.10;

      const suggested = (item.basePrice * factor).toFixed(2);
      const final = Math.max(parseFloat(suggested), item.basePrice * 0.5).toFixed(2);
      item.suggestedPrice = final;
      return { ...item.toObject(), priceMessage };
    });

    await Promise.all(updatedItems.map(item => InventoryItem.findByIdAndUpdate(item._id, { suggestedPrice: item.suggestedPrice })));
    res.json(updatedItems);
  } catch (err) {
    console.error("Error fetching inventory:", err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.createItem = async (req, res) => {
  try {
    const { name, description, image, basePrice, stockLevel, salesTrend, expirationDate, category } = req.body;
    if (!basePrice) return res.status(400).json({ error: "Base price is required" });

    const newItem = new InventoryItem({
      name, description, image, basePrice,
      stockLevel: stockLevel || 0,
      salesTrend: salesTrend || 0,
      expirationDate, category,
      suggestedPrice: basePrice
    });

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(400).json({ error: err.message });
  }
};


exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        basePrice: req.body.basePrice,
        stockLevel: req.body.stockLevel,
        image: req.body.image
      },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ error: "Item not found" });

    
    if (updatedItem.stockLevel < 10) {
      console.log("🚨 Low stock detected. Sending notification for:", updatedItem.name);
    
      try {
        const notifRes = await axios.post("http://localhost:5001/api/notifications", {
          userId: managerId,
          message: `Low stock alert: ${updatedItem.name} has only ${updatedItem.stockLevel} left!`,
          role: "manager"
        });
    
        console.log("✅ Notification sent successfully:", notifRes.data);
      } catch (err) {
        console.error("❌ Error sending notification from backend:", err.response?.data || err.message);
      }
    }

    res.json({ message: "Item updated successfully", updatedItem });
  } catch (error) {
    console.error("❌ Error updating item:", error);
    res.status(400).json({ error: error.message });
  }
};


exports.deleteItem = async (req, res) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.requestChange = async (req, res) => {
  try {
    const { itemId, message, employee } = req.body;
    if (!itemId || !message || !employee) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    
    await axios.post("http://localhost:5001/api/notifications", {
      userId: managerId,
      role: "manager",
      message: ` ${employee} requested change for ${item.name}: "${message}"`
    });

    console.log(` Change request received from ${employee} for ${item.name}`);
    res.status(200).json({ message: "Request sent to manager" });
  } catch (error) {
    console.error("Error handling change request:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.approvePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPrice } = req.body;

    const item = await InventoryItem.findById(id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });

    item.basePrice = newPrice;
    item.suggestedPrice = null;
    await item.save();

    const updatedInventory = await InventoryItem.find();
    res.json({ message: "Price approved successfully", updatedInventory });
  } catch (error) {
    console.error("❌ Error approving price:", error);
    res.status(500).json({ message: "Server error" });
  }
};
