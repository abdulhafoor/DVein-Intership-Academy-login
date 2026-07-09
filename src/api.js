// ---------------------------------------------------------------------------
// API layer — connects the React frontend to your Node.js/Express backend.
//
// Endpoints below mirror the schema in the project doc:
//   Users Table        -> /auth, /users
//   Attendance Table    -> /attendance, /leave
//   (Certificate logic is derived from attendance + tasks + assignments)
//
// If the backend isn't reachable yet, every call falls back to local mock
// data (src/data/mockInterns.js) so the UI keeps working during frontend
// development. Swap API_BASE in .env (VITE_API_URL) once your backend is live.
// ---------------------------------------------------------------------------

import { mockInterns, mockAttendanceHistory, mockTasks, mockMentors } from './data/mockInterns.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('ims_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------- AUTH ----------------
// Expected backend: POST /api/auth/login { email, password, role } -> { token, user }
export async function login(email, password, role) {
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    });
    localStorage.setItem('ims_token', data.token);
    return { user: data.user, live: true };
  } catch (err) {
    // Backend not connected yet — allow a demo sign-in so the UI is usable.
    console.warn('[api] login: falling back to demo mode —', err.message);
    const demoUser = {
      name: email.includes('@') ? email.split('@')[0].replace(/[._]/g, ' ') : email,
      role
    };
    localStorage.setItem('ims_token', 'demo-token');
    return { user: demoUser, live: false };
  }
}

// Expected backend: POST /api/auth/forgot-password { email } -> { message }
export async function requestPasswordReset(email) {
  try {
    return { data: await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }), live: true };
  } catch (err) {
    console.warn('[api] requestPasswordReset: backend not connected, simulated locally —', err.message);
    return { data: { message: 'If an account exists for this email, a reset link has been sent.' }, live: false };
  }
}

// Expected backend: POST /api/auth/change-password { currentPassword, newPassword }
export async function changePassword(payload) {
  try {
    return { data: await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] changePassword: backend not connected, simulated locally —', err.message);
    return { data: null, live: false };
  }
}

export function logout() {
  localStorage.removeItem('ims_token');
}

// ---------------- AUTH & MENTOR PROFILE ----------------
// Expected backend: GET /api/mentors/me -> Mentor (resolved from the auth token)
// `name` is passed through so the demo-mode fallback can match the signed-in
// user against the local mentor directory (src/data/mockInterns.js).
export async function fetchMentorProfile(name) {
  try {
    return { data: await request('/mentors/me'), live: true };
  } catch (err) {
    console.warn('[api] fetchMentorProfile: using mock data —', err.message);
    const match = mockMentors.find((m) => m.name.toLowerCase() === (name || '').toLowerCase());
    return {
      data: match || {
        id: 'MNT000',
        name: name || 'Mentor',
        email: '',
        phone: '',
        designation: 'Mentor',
        department: '-',
        domain: '-',
        bio: '',
        skills: [],
        joinDate: ''
      },
      live: false
    };
  }
}

// Expected backend: PUT /api/mentors/:id { ...profile fields }
export async function updateMentorProfile(mentorId, payload) {
  try {
    return { data: await request(`/mentors/${mentorId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] updateMentorProfile: not connected, saved locally only —', err.message);
    return { data: null, live: false };
  }
}

// ---------------- INTERNS / ATTENDANCE / LEAVE ----------------
// Expected backend: GET /api/interns -> Intern[]
export async function fetchInterns() {
  try {
    return { data: await request('/interns'), live: true };
  } catch (err) {
    console.warn('[api] fetchInterns: using mock data —', err.message);
    return { data: mockInterns, live: false };
  }
}

// Expected backend: PATCH /api/attendance/:internId { date, status }
export async function updateAttendanceStatus(internId, date, status) {
  try {
    return { data: await request(`/attendance/${internId}`, {
      method: 'PATCH',
      body: JSON.stringify({ date, status })
    }), live: true };
  } catch (err) {
    console.warn('[api] updateAttendanceStatus: not connected, updated locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: POST /api/leave { internId, date, type, reason, remarks }
export async function submitLeave(payload) {
  try {
    return { data: await request('/leave', {
      method: 'POST',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] submitLeave: not connected, saved locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: GET /api/attendance/history?domain=&batch=&internId=
export async function fetchAttendanceHistory() {
  try {
    return { data: await request('/attendance/history'), live: true };
  } catch (err) {
    console.warn('[api] fetchAttendanceHistory: using mock data —', err.message);
    return { data: mockAttendanceHistory, live: false };
  }
}

// Expected backend: GET /api/reports/attendance?format=csv|pdf&date=...
export async function exportReport(type, format) {
  try {
    const res = await fetch(`${API_BASE}/reports/${type}?format=${format}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error('Export failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.${format.toLowerCase()}`;
    a.click();
    return { live: true };
  } catch (err) {
    console.warn('[api] exportReport: backend not connected —', err.message);
    return { live: false };
  }
}

// Expected backend: POST /api/certificates/:internId/generate
export async function generateCertificate(internId) {
  try {
    return { data: await request(`/certificates/${internId}/generate`, { method: 'POST' }), live: true };
  } catch (err) {
    console.warn('[api] generateCertificate: not connected, marked locally only —', err.message);
    return { data: null, live: false };
  }
}

// ---------------- TASK ASSIGNMENT MANAGEMENT ----------------
// Expected backend: GET /api/tasks -> Task[]
export async function fetchTasks() {
  try {
    return { data: await request('/tasks'), live: true };
  } catch (err) {
    console.warn('[api] fetchTasks: using mock data —', err.message);
    return { data: mockTasks, live: false };
  }
}

// Expected backend: POST /api/tasks { title, description, internId, startDate, dueDate, priority, status }
export async function createTask(payload) {
  try {
    return { data: await request('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] createTask: not connected, saved locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: PATCH /api/tasks/:taskId { status }
export async function updateTaskStatus(taskId, status) {
  try {
    return { data: await request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }), live: true };
  } catch (err) {
    console.warn('[api] updateTaskStatus: not connected, updated locally only —', err.message);
    return { data: null, live: false };
  }
}

// ---------------- ASSESSMENT MANAGEMENT ----------------
// Expected backend: GET /api/assessments -> Assessment_Records[]
export async function fetchAssessmentRecords() {
  try {
    return { data: await request('/assessments'), live: true };
  } catch (err) {
    console.warn('[api] fetchAssessmentRecords: backend not connected, using local records —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: POST /api/assessments/upload (multipart/form-data, field name "file")
// The Excel file is parsed client-side (XLSX package) so the UI works instantly; the raw
// file + parsed rows are also POSTed so the real backend (Multer + xlsx) can re-validate
// and persist to the Assessment_Records collection/table.
export async function uploadAssessmentRecords(file, parsedRecords) {
  try {
    const form = new FormData();
    form.append('file', file);
    form.append('records', JSON.stringify(parsedRecords));
    const token = getToken();
    const res = await fetch(`${API_BASE}/assessments/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return { data: await res.json(), live: true };
  } catch (err) {
    console.warn('[api] uploadAssessmentRecords: backend not connected, stored locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: DELETE /api/assessments/:id
export async function deleteAssessmentRecord(id) {
  try {
    return { data: await request(`/assessments/${id}`, { method: 'DELETE' }), live: true };
  } catch (err) {
    console.warn('[api] deleteAssessmentRecord: not connected, removed locally only —', err.message);
    return { data: null, live: false };
  }
}

// ---------------- NOTIFICATION & REMINDER ----------------
// Expected backend: GET /api/notifications -> Notification[]
export async function fetchNotifications() {
  try {
    return { data: await request('/notifications'), live: true };
  } catch (err) {
    console.warn('[api] fetchNotifications: backend not connected, using local list —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: POST /api/notifications { message, recipient }
export async function sendNotification(payload) {
  try {
    return { data: await request('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] sendNotification: not connected, saved locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: GET /api/reminders -> deadline reminders derived from pending assessments
export async function fetchReminders() {
  try {
    return { data: await request('/reminders'), live: true };
  } catch (err) {
    console.warn('[api] fetchReminders: backend not connected, using local reminders —', err.message);
    return { data: null, live: false };
  }
}

// ---------------- BATCH MANAGEMENT ----------------
// Expected backend: POST /api/interns { name, dept, batch, mentor } -> Intern
// Adding a student here is the single source of truth for the roster — the
// same `interns` list is shared by Leave, Certificate, Attendance, Report,
// Task, and Analytics modules, so a new student shows up in all of them
// (including Attendance Management) immediately, with no extra step.
export async function createIntern(payload) {
  try {
    return { data: await request('/interns', {
      method: 'POST',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] createIntern: not connected, added locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: PATCH /api/interns/:internId { batch, dept, mentor }
export async function moveIntern(internId, payload) {
  try {
    return { data: await request(`/interns/${internId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }), live: true };
  } catch (err) {
    console.warn('[api] moveIntern: not connected, updated locally only —', err.message);
    return { data: null, live: false };
  }
}

// Expected backend: DELETE /api/interns/:internId
export async function removeIntern(internId) {
  try {
    return { data: await request(`/interns/${internId}`, { method: 'DELETE' }), live: true };
  } catch (err) {
    console.warn('[api] removeIntern: not connected, removed locally only —', err.message);
    return { data: null, live: false };
  }
}
