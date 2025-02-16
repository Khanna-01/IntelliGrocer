const mongoose = require("mongoose");
const Product = require("./models/Product"); // Import the Product model
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ✅ Function to generate random sales trends
const getRandomSalesTrend = () => Math.floor(Math.random() * 100);

// ✅ Function to generate random stock levels
const getRandomStockLevel = () => Math.floor(Math.random() * 50) + 1;

// ✅ Function to generate expiration dates within the next 30 days
const getRandomExpirationDate = () => {
  const today = new Date();
  return new Date(today.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1));
};

// 📌 Seed Sample Products
const seedProducts = async () => {
  await Product.deleteMany(); // Clears existing data

  const products = [
    { name: "Milk", basePrice: 2.5, expirationDate: getRandomExpirationDate(), salesTrend: getRandomSalesTrend(), stockLevel: getRandomStockLevel() },
    { name: "Bread", basePrice: 1.2, expirationDate: getRandomExpirationDate(), salesTrend: getRandomSalesTrend(), stockLevel: getRandomStockLevel() },
    { name: "Eggs", basePrice: 3.0, expirationDate: getRandomExpirationDate(), salesTrend: getRandomSalesTrend(), stockLevel: getRandomStockLevel() },
    { name: "Apple", basePrice: 0.8, expirationDate: getRandomExpirationDate(), salesTrend: getRandomSalesTrend(), stockLevel: getRandomStockLevel() },
    { name: "Chicken", basePrice: 5.0, expirationDate: getRandomExpirationDate(), salesTrend: getRandomSalesTrend(), stockLevel: getRandomStockLevel() },
  ];

  await Product.insertMany(products);
  console.log("✅ Database seeded with sample products!");
  mongoose.connection.close();
};

// Run the seed function
seedProducts();
