const path = require("path");
const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard");
const programRoutes = require("./routes/programs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "internship-academy-backend" });
});

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/programs", programRoutes);

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Route not found." });
});

// Serve the plain HTML/CSS/JS frontend from the same server,
// so frontend + backend run together with a single command.
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Internship Academy running at http://localhost:${PORT}`);
});
