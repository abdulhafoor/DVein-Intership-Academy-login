// server.js
require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");

const batchRoutes = require("./routes/batch.routes");
const resourceRoutes = require("./routes/resource.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serves uploaded resource files (PDFs, videos, docs, slides) at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "DVein Innovations — Batch & Resource API", time: new Date().toISOString() });
});

app.use("/api/batches", batchRoutes);
app.use("/api/resources", resourceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Central error handler
app.use((err, req, res, next) => {
  if (err && err.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE"
      ? "That file is too large — the limit is 200MB."
      : `Upload error: ${err.message}`;
    return res.status(400).json({ message });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`DVein Innovations Batch & Resource API running on http://localhost:${PORT}`);
});
