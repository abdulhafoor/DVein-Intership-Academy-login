// api.js — shared helpers used across the Batch Management and Resource Library pages.
// No auth/token handling here — this module assumes it will sit behind whatever
// login system the team's auth module provides. If/when that's ready, add an
// Authorization header inside apiRequest() below.

const API_BASE = "http://localhost:5000/api";

// Thin fetch wrapper that parses JSON responses and surfaces clean error messages.
async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Is the backend running on port 5000?");
  }

  let data = {};
  try { data = await response.json(); } catch (_) { /* empty body */ }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }
  return data;
}

// Toast notifications
function showToast(message, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.className = type === "error" ? "error show" : "show";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { el.className = el.className.replace("show", ""); }, 3200);
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
