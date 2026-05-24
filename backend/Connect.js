const mongoose = require("mongoose");
// require("dotenv").config();

const connectiona = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB connected");
  } catch (err) {
    console.log("Database connection error:", err.message);
  }
};

module.exports = connectiona;
