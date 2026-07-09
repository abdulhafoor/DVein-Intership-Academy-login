import { useState } from "react";

const initialSessions = [
  {
    id: 1,
    title: "React Basics",
    date: "2026-07-10",
    time: "10:00",
    mentor: "Alicia",
    status: "scheduled",
  },
  {
    id: 2,
    title: "Career Guidance",
    date: "2026-07-12",
    time: "14:30",
    mentor: "Daniel",
    status: "scheduled",
  },
  {
    id: 3,
    title: "Portfolio Review",
    date: "2026-07-05",
    time: "09:00",
    mentor: "Mina",
    status: "completed",
  },
];

const emptyForm = {
  id: "",
  title: "",
  date: "",
  time: "",
  mentor: "",
  status: "scheduled",
};

export default function SessionScheduler() {
  const [sessions, setSessions] = useState(initialSessions);
  const [showBooking, setShowBooking] = useState(false);
  const [view, setView] = useState("calendar");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  const handleBookSession = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time || !formData.mentor) {
      setError("Please complete all fields before saving the session.");
      return;
    }

    if (formData.id) {
      setSessions((prev) =>
        prev.map((session) => (session.id === formData.id ? { ...session, ...formData } : session))
      );
    } else {
      setSessions((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          status: "scheduled",
        },
      ]);
    }

    setFormData(emptyForm);
    setShowBooking(false);
    setError("");
  };

  const handleReschedule = (id) => {
    const session = sessions.find((item) => item.id === id);
    if (session) {
      setFormData({ ...session });
      setShowBooking(true);
    }
  };

  const handleCancel = (id) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
  };

  const completeSession = (id) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === id ? { ...session, status: "completed" } : session))
    );
  };

  const upcomingSessions = sessions.filter((session) => session.status === "scheduled");
  const completedSessions = sessions.filter((session) => session.status === "completed");

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const calendarDays = [];
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const daysInMonth = getDaysInMonth(calendarMonth);

  for (let i = 0; i < firstDay; i += 1) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i += 1) {
    calendarDays.push(i);
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>📅 Session Scheduler</h1>
          <p>Book, manage, and track your mentoring sessions</p>
        </div>
      </div>

      <div
        className="tabs-nav"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => setView("calendar")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "calendar" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "calendar" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          📆 Calendar
        </button>
        <button
          onClick={() => setView("list")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "list" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "list" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          📋 Upcoming
        </button>
        <button
          onClick={() => setView("history")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "history" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "history" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          ✅ History
        </button>
      </div>

      <button
        onClick={() => setShowBooking((prev) => !prev)}
        style={{
          padding: "0.75rem 1.5rem",
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          marginBottom: "1.5rem",
          fontWeight: 600,
        }}
      >
        {showBooking ? "✕ Cancel" : "+ Book New Session"}
      </button>

      {showBooking && (
        <div className="panel" style={{ background: "var(--background-alt)", marginBottom: "1.5rem" }}>
          <div className="panel-head">
            <h3>{formData.id ? "Update Session" : "Book a New Session"}</h3>
          </div>
          <form onSubmit={handleBookSession} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {error && <p style={{ color: "var(--red)", margin: 0 }}>{error}</p>}
            <input
              type="text"
              placeholder="Session Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "0.5rem" }}
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "0.5rem" }}
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "0.5rem" }}
              required
            />
            <input
              type="text"
              placeholder="Mentor Name"
              value={formData.mentor}
              onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
              style={{ padding: "0.75rem", border: "1px solid var(--border)", borderRadius: "0.5rem" }}
              required
            />
            <button
              type="submit"
              style={{
                padding: "0.75rem 1.5rem",
                background: "var(--primary)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {formData.id ? "Save Changes" : "Confirm Booking"}
            </button>
          </form>
        </div>
      )}

      {view === "calendar" && (
        <div className="panel">
          <div className="panel-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ◀
              </button>
              <h3>{calendarMonth.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
              <button
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ▶
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", padding: "1rem" }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} style={{ textAlign: "center", fontWeight: 600, color: "var(--text-secondary)", padding: "0.5rem" }}>
                {day}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              const hasSession =
                day &&
                sessions.some(
                  (session) =>
                    session.date ===
                    `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                );
              return (
                <div
                  key={idx}
                  style={{
                    padding: "0.75rem",
                    background: hasSession ? "var(--primary-light)" : "var(--background-alt)",
                    border: hasSession ? "2px solid var(--primary)" : "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                    cursor: "pointer",
                    fontWeight: hasSession ? 600 : 400,
                    color: hasSession ? "var(--primary)" : "var(--text)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "list" && (
        <div className="panel">
          <div className="panel-head">
            <h3>Upcoming Sessions ({upcomingSessions.length})</h3>
          </div>
          {upcomingSessions.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>No upcoming sessions scheduled.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "var(--background-alt)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 0.5rem 0" }}>{session.title}</h4>
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      📅 {session.date} at {session.time} | 👤 {session.mentor}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleReschedule(session.id)}
                      style={{ padding: "0.5rem 1rem", background: "var(--orange)", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                      📝 Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(session.id)}
                      style={{ padding: "0.5rem 1rem", background: "var(--red)", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                      ✕ Cancel
                    </button>
                    <button
                      onClick={() => completeSession(session.id)}
                      style={{ padding: "0.5rem 1rem", background: "var(--green)", color: "white", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                      ✅ Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="panel">
          <div className="panel-head">
            <h3>Session History ({completedSessions.length})</h3>
          </div>
          {completedSessions.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>No completed sessions yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {completedSessions.map((session) => (
                <div key={session.id} style={{ padding: "1rem", background: "var(--green-light)", borderRadius: "0.5rem", border: "1px solid var(--green)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--green)" }}>✅ {session.title}</h4>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                        📅 {session.date} at {session.time} | 👤 {session.mentor}
                      </p>
                    </div>
                    <span style={{ color: "var(--green)", fontWeight: 600 }}>Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="panel" style={{ marginTop: "1.5rem" }}>
        <div className="panel-head">
          <h3>🔔 Upcoming Reminders</h3>
        </div>
        {upcomingSessions.slice(0, 3).map((session) => (
          <div key={session.id} className="activity-row">
            <div className="aicon">🔔</div>
            <div className="atext">Session "{session.title}" with {session.mentor}</div>
            <div className="atime">{session.date} at {session.time}</div>
          </div>
        ))}
        {upcomingSessions.length === 0 && <p style={{ color: "var(--text-secondary)", padding: "1rem" }}>No upcoming reminders.</p>}
      </div>
    </section>
  );
}