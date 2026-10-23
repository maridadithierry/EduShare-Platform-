
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const resourceRoutes = require("./routes/resourceRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Resource API routes
app.use("/api/resources", resourceRoutes);

// Start server after connecting to MongoDB
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`EduShare API running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
