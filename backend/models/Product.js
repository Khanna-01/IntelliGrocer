const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true }, 
  expirationDate: { type: Date, required: true }, 
  salesTrend: { type: Number, required: true }, 
  stockLevel: { type: Number, required: true }, 
});

module.exports = mongoose.model("Product", ProductSchema);
