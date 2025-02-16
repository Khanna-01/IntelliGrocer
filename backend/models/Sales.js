const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  totalRevenue: { type: Number, required: true },
});

const SalesModel = mongoose.model("Sales", SalesSchema);
module.exports = SalesModel;
