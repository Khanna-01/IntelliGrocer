const mongoose = require("mongoose");

const InventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, 
  basePrice: { type: Number, required: true },  
  stockLevel: { type: Number, required: true, default: 0 },  
  salesTrend: { type: Number, required: true, default: 0 }, 
  expirationDate: { type: Date }, 
  suggestedPrice: { type: Number, default: null }, 
  category: { type: String },
});

module.exports = mongoose.model("InventoryItem", InventoryItemSchema);