const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 📌 Fetch Dynamic Pricing Data
router.get("/dynamic", async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({ message: "No pricing data found" });
    }

    // ✅ Adjust pricing dynamically based on demand & stock levels
    const pricingData = products.map(product => {
      let priceAdjustmentFactor = 1.0;
      let priceMessage = "";

      // If stock is high and sales are low, suggest a lower price (discount)
      if (product.stockLevel > 30 && product.salesTrend < 50) {
        priceAdjustmentFactor -= 0.25; // 25% discount
        priceMessage = "Discounted due to low demand";
      }

      // If stock is low and sales are high, suggest a higher price (increase)
      if (product.stockLevel < 10 && product.salesTrend > 70) {
        priceAdjustmentFactor += 0.30; // 30% increase
        priceMessage = "Price increased due to high demand";
      }

      // If product is expiring soon, suggest a discount
      const daysUntilExpiration = (new Date(product.expirationDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilExpiration < 7) { // Increased window for expiry discounts
        priceAdjustmentFactor -= 0.35; // 35% discount for near-expiry products
        priceMessage = "Discounted due to expiration risk";
      }

      // If stock is very high and sales are also high (overstock situation), consider a price drop
      if (product.stockLevel > 50 && product.salesTrend > 60) {
        priceAdjustmentFactor -= 0.10; // Small discount for overstocked items
        priceMessage = "Discounted due to overstock";
      }

      // Apply the price adjustment and calculate the suggested price
      const suggestedPrice = (product.basePrice * priceAdjustmentFactor).toFixed(2);

      // Ensure the price doesn't fall below a minimum threshold
      const minimumPrice = product.basePrice * 0.5; // e.g., price can't go below 50% of the base price
      const finalSuggestedPrice = Math.max(parseFloat(suggestedPrice), minimumPrice).toFixed(2);

      return {
        name: product.name,
        currentPrice: product.basePrice.toFixed(2),
        suggestedPrice: finalSuggestedPrice,
        priceMessage: priceMessage
      };
    });

    res.json(pricingData);
  } catch (error) {
    console.error("Error fetching dynamic pricing:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
