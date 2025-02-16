require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // ✅ Parse JSON Requests

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// ✅ Import Models
const SalesModel = require("./models/Sales"); // Ensure the model exists

// ✅ Define API Routes
app.use("/api/auth", require("./routes/authRoutes")); // Authentication Routes
const pricingRoutes = require("./routes/pricingRoutes");
app.use("/api/pricing", pricingRoutes);



// ✅ Sales Analytics Route
app.get("/api/sales/analytics", async (req, res) => {
  try {
    const sales = await SalesModel.find();
    const formattedData = {
      dates: sales.map((sale) => sale.date.toISOString().split("T")[0]), // Format Date
      revenues: sales.map((sale) => sale.totalRevenue),
    };
    res.json(formattedData);
  } catch (error) {
    console.error("❌ Error fetching sales data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Serve React Frontend (if deployed)
app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
