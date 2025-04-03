const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");


if (!inventoryController.getAllItems || !inventoryController.createItem) {
  throw new Error("Missing inventoryController functions. Check the import.");
}


router.get("/", inventoryController.getAllItems);


router.post("/", inventoryController.createItem);


router.post("/request-change", inventoryController.requestChange);


router.get("/:id", async (req, res) => {
  try {
    const item = await require("../models/InventoryItem").findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router.put("/:id", inventoryController.updateItem);
module.exports = router;