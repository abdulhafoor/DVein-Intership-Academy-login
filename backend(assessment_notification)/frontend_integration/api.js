// Drop-in implementation for the `api.js` imported by AssessmentManagement.jsx
// and Notification.jsx. Exposes the exact function names those components
// already call: uploadAssessmentRecords, deleteAssessmentRecord, sendNotification.
//
// Every function returns { live, data } — `live: true` when the backend call
// succeeded, `live: false` if it failed (network/server down), so the
// existing "(saved locally — backend not connected)" fallback messaging in
// the components keeps working unchanged.

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function safeFetch(url, options) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request failed with status ${res.status}`);
    }
    const data = await res.json();
    return { live: true, data };
  } catch (err) {
    console.error(`API call failed: ${url}`, err);
    return { live: false, data: null, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Assessment Management
// ---------------------------------------------------------------------------

/**
 * Uploads the raw Excel file plus the already-parsed records (from SheetJS)
 * to the backend, which persists them as AssessmentRecord rows.
 *
 * @param {File} file - the raw .xlsx/.xls file selected/dropped by the user
 * @param {Array} parsedRecords - rows already normalized client-side, each
 *   shaped like { studentName, assessmentName, marks, submittedDate }
 */
export async function uploadAssessmentRecords(file, parsedRecords) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('records', JSON.stringify(parsedRecords));

  return safeFetch(`${API_BASE_URL}/assessment-records/upload`, {
    method: 'POST',
    body: formData,
  });
}

/** Fetches all assessment records (optionally filtered by ?search=). */
export async function getAssessmentRecords(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return safeFetch(`${API_BASE_URL}/assessment-records${query}`, { method: 'GET' });
}

/** Fetches the stat-card totals (total / passCount / avgMarks). */
export async function getAssessmentStats() {
  return safeFetch(`${API_BASE_URL}/assessment-records/stats`, { method: 'GET' });
}

/** Deletes a single assessment record by id. */
export async function deleteAssessmentRecord(id) {
  return safeFetch(`${API_BASE_URL}/assessment-records/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Notification & Reminder
// ---------------------------------------------------------------------------

/**
 * Sends a notification to a recipient group.
 * @param {{ message: string, recipient: string }} payload
 */
export async function sendNotification(payload) {
  return safeFetch(`${API_BASE_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/** Fetches notifications, optionally filtered by status ('unread' | 'read'). */
export async function getNotifications(status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return safeFetch(`${API_BASE_URL}/notifications${query}`, { method: 'GET' });
}

/** Marks a single notification as read. */
export async function markNotificationRead(id) {
  return safeFetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PATCH' });
}

/** Marks every unread notification as read. */
export async function markAllNotificationsRead() {
  return safeFetch(`${API_BASE_URL}/notifications/read-all`, { method: 'PATCH' });
}
