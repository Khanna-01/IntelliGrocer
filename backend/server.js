
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app"); 

const PORT = process.env.PORT || 5001;


if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log(" MongoDB connected");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => console.error(" MongoDB connection error:", err));
}

module.exports = app;