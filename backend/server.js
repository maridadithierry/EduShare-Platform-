require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const resourceRoutes = require("./routes/resourceRoutes");
const { seedIfEmpty } = require("./seed/seed");

const app = express();
const PORT = process.env.PORT || 4000;
const unusedValue = "this breaks lint on purpose";

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Resource API routes
app.use("/api/resources", resourceRoutes);

// Serve the built React app when it exists (e.g. inside the Docker image).
// CLIENT_DIST_DIR overrides the default location of the frontend build.
const clientDir =
  process.env.CLIENT_DIST_DIR || path.join(__dirname, "..", "frontend", "dist");

if (fs.existsSync(path.join(clientDir, "index.html"))) {
  app.use(express.static(clientDir));

  // Send index.html for client-side routes (e.g. /resources) so React Router
  // handles them, but leave /api and /health to the routes above.
  app.get(/^(?!\/api(\/|$)|\/health$).*/, (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"));
  });
}

// Start server after connecting to MongoDB
const startServer = async () => {
  await connectDB();
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`EduShare API running on http://localhost:${PORT}`);
  });
};

// Only start when run directly (node server.js), so tests can import the app.
if (require.main === module) {
  startServer();
}

module.exports = app;
