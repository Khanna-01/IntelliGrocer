const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    
  
    if (!userId || userId === "null" || userId === "undefined") {
      return res.status(400).json({ error: "Invalid userId" });
    }
  
    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      console.error(" Error fetching notifications:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
router.patch('/mark-read/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      res.json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      res.status(500).json({ error: "Failed to update notifications" });
    }
  });

  
router.delete("/clear/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
      await Notification.deleteMany({ userId });
      res.json({ message: "All notifications cleared." });
    } catch (err) {
      console.error(" Error clearing notifications:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  const mongoose = require('mongoose');

  router.get("/:id", async (req, res) => {
    try {
      const item = await InventoryItem.findById(req.params.id);
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  router.post("/", async (req, res) => {
    console.log(" Incoming Notification Payload:", req.body);
  
    try {
      const { userId, message, role } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
      if (!userId || !message || !role) {
        return res.status(400).json({ error: "userId, message, and role are required" });
      }
  
      
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId format" });
      }
  
      const newNotification = new Notification({ userId, message, role });
      await newNotification.save();
  
      res.status(201).json({ message: "Notification created", notification: newNotification });
  
    } catch (err) {
      console.error(" Error creating notification:", err);
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;