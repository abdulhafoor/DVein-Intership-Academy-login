const express = require("express");
const db = require("../db/database");

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", (req, res) => {
  const programs = db.getAll();

  const totals = {
    totalPrograms: programs.length,
    activePrograms: programs.filter((p) => p.status === "active").length,
    upcomingPrograms: programs.filter((p) => p.status === "upcoming").length,
    completedPrograms: programs.filter((p) => p.status === "completed").length,
    totalInterns: programs.reduce((sum, p) => sum + (p.enrolled || 0), 0),
    totalCapacity: programs.reduce((sum, p) => sum + (p.capacity || 0), 0)
  };

  const utilizationRate = totals.totalCapacity > 0
    ? Math.round((totals.totalInterns / totals.totalCapacity) * 1000) / 10
    : 0;

  const openSeats = Math.max(0, totals.totalCapacity - totals.totalInterns);

  const mentorSet = new Set(programs.filter((p) => p.mentor).map((p) => p.mentor));
  const mentorCount = mentorSet.size;

  const avgDurationWeeks = programs.length
    ? Math.round((programs.reduce((sum, p) => sum + (p.duration_weeks || 0), 0) / programs.length) * 10) / 10
    : 0;

  const fullPrograms = programs.filter((p) => p.capacity > 0 && p.enrolled >= p.capacity).length;

  const trackMap = new Map();
  for (const p of programs) {
    const entry = trackMap.get(p.track) || { track: p.track, programCount: 0, interns: 0 };
    entry.programCount += 1;
    entry.interns += p.enrolled || 0;
    trackMap.set(p.track, entry);
  }
  const tracksBreakdown = [...trackMap.values()].sort((a, b) => b.programCount - a.programCount);

  const recentPrograms = [...programs]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5)
    .map(({ id, name, track, mentor, status, start_date, end_date, capacity, enrolled, created_at }) => ({
      id, name, track, mentor, status, start_date, end_date, capacity, enrolled, created_at
    }));

  const endingSoon = programs
    .filter((p) => p.status === "active")
    .sort((a, b) => (a.end_date > b.end_date ? 1 : -1))
    .slice(0, 5)
    .map(({ id, name, end_date, status }) => ({ id, name, end_date, status }));

  res.json({
    data: {
      ...totals,
      utilizationRate,
      openSeats,
      mentorCount,
      avgDurationWeeks,
      fullPrograms,
      tracksBreakdown,
      recentPrograms,
      endingSoon
    }
  });
});

module.exports = router;
