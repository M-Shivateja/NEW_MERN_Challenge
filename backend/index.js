const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const transactionRoutes = require("./src/routes/transactions");

const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://shivateja2062002:ikvgC2w4RmzWFFA3@cluster0.zta5onb.mongodb.net",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Routes
app.use("/api/transactions", transactionRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
