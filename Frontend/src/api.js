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

import { mockInterns, mockAttendanceHistory } from './data/mockInterns.js';

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

export function logout() {
  localStorage.removeItem('ims_token');
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
