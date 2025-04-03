
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();


app.use(cors());
app.use(express.json());


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/pricing", require("./routes/pricingRoutes"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/sales", require("./routes/sales"));
app.use("/api/schedule", require("./routes/schedule"));
app.use("/api/notifications", require("./routes/notifications"));


app.use(express.static(path.join(__dirname, "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

module.exports = app;