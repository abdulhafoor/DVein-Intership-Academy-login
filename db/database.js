const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
const dbFile = path.join(dataDir, "programs.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Seed sample data on first run so the dashboard isn't empty
const seed = [
  {
    id: 1,
    name: "Frontend Engineering Cohort 4",
    track: "Web Development",
    mentor: "Ananya Rao",
    description: "Hands-on internship covering HTML, CSS, JavaScript and React through real client projects.",
    start_date: "2026-06-01",
    end_date: "2026-08-23",
    duration_weeks: 12,
    capacity: 25,
    enrolled: 22,
    status: "active"
  },
  {
    id: 2,
    name: "Data Analytics Immersion",
    track: "Data Science",
    mentor: "Karthik Subramaniam",
    description: "Interns work with real datasets to build dashboards and predictive models.",
    start_date: "2026-05-15",
    end_date: "2026-07-24",
    duration_weeks: 10,
    capacity: 20,
    enrolled: 20,
    status: "active"
  },
  {
    id: 3,
    name: "Cloud & DevOps Fundamentals",
    track: "Cloud Computing",
    mentor: "Priya Menon",
    description: "Interns deploy and monitor services using CI/CD pipelines on AWS.",
    start_date: "2026-08-01",
    end_date: "2026-10-10",
    duration_weeks: 10,
    capacity: 18,
    enrolled: 6,
    status: "upcoming"
  },
  {
    id: 4,
    name: "UI/UX Design Sprint",
    track: "Product Design",
    mentor: "Rahul Nair",
    description: "A design-focused internship producing case studies and a portfolio piece.",
    start_date: "2026-03-01",
    end_date: "2026-04-26",
    duration_weeks: 8,
    capacity: 15,
    enrolled: 15,
    status: "completed"
  },
  {
    id: 5,
    name: "Mobile App Development",
    track: "Mobile Development",
    mentor: "Divya Iyer",
    description: "Interns build and ship a cross-platform app using React Native.",
    start_date: "2026-09-01",
    end_date: "2026-11-21",
    duration_weeks: 12,
    capacity: 20,
    enrolled: 3,
    status: "upcoming"
  },
  {
    id: 6,
    name: "Cybersecurity Fundamentals",
    track: "Cybersecurity",
    mentor: "Vikram Sharma",
    description: "Interns learn threat modelling, secure coding and run a capture-the-flag capstone.",
    start_date: "2026-02-01",
    end_date: "2026-03-29",
    duration_weeks: 8,
    capacity: 16,
    enrolled: 16,
    status: "completed"
  }
];

function nowIso() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function load() {
  if (!fs.existsSync(dbFile)) {
    const initial = {
      nextId: seed.length + 1,
      programs: seed.map((p) => ({ ...p, created_at: nowIso(), updated_at: nowIso() }))
    };
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(dbFile, "utf-8");
  return raw.trim() ? JSON.parse(raw) : { nextId: 1, programs: [] };
}

function save(state) {
  fs.writeFileSync(dbFile, JSON.stringify(state, null, 2));
}

// ---- Public data-access API (used by the routes) ----

function getAll({ status, track, search } = {}) {
  const state = load();
  let rows = [...state.programs];

  if (status) rows = rows.filter((p) => p.status === status);
  if (track) rows = rows.filter((p) => p.track === track);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.mentor || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }

  rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return rows;
}

function getById(id) {
  const state = load();
  return state.programs.find((p) => p.id === Number(id)) || null;
}

function create(fields) {
  const state = load();
  const record = {
    id: state.nextId,
    name: fields.name,
    track: fields.track,
    mentor: fields.mentor ?? null,
    description: fields.description ?? null,
    start_date: fields.start_date,
    end_date: fields.end_date,
    duration_weeks: Number(fields.duration_weeks),
    capacity: Number(fields.capacity),
    enrolled: Number(fields.enrolled ?? 0),
    status: fields.status ?? "upcoming",
    created_at: nowIso(),
    updated_at: nowIso()
  };
  state.programs.push(record);
  state.nextId += 1;
  save(state);
  return record;
}

function update(id, fields) {
  const state = load();
  const idx = state.programs.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;

  const merged = { ...state.programs[idx], ...fields, updated_at: nowIso() };
  if (fields.duration_weeks !== undefined) merged.duration_weeks = Number(fields.duration_weeks);
  if (fields.capacity !== undefined) merged.capacity = Number(fields.capacity);
  if (fields.enrolled !== undefined) merged.enrolled = Number(fields.enrolled);

  state.programs[idx] = merged;
  save(state);
  return merged;
}

function remove(id) {
  const state = load();
  const idx = state.programs.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;

  const [removed] = state.programs.splice(idx, 1);
  save(state);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };
