// Dvein Innovations - Internship Academy Backend
// Modules: Technical Management, Announcement & Communication
// No login/authentication - open internal tool.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

require('./config/db'); // initializes SQLite DB + tables on startup

const taskRoutes = require('./routes/taskRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', company: 'Dvein Innovations', project: 'Internship Academy' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/announcements', announcementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Dvein Innovations - Internship Academy backend running on port ${PORT}`);
});
