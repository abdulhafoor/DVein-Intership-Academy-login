import { useState, useEffect, useRef } from "react";

/**
 * ---------------------------------------------------------------------------
 * DEMO-MODE DATA LAYER
 * ---------------------------------------------------------------------------
 * The rest of this app runs in "Demo mode (backend offline)", but AIMentor.jsx
 * was still calling the real service functions in services/mentor.js
 * (getProgress, getAssessments, getRecommendations, sendMessage,
 * submitAssessment), which all try to hit a live API and fail with
 * "Failed to fetch".
 *
 * The fix: give this component its own local, in-memory "mock backend" that
 * mimics those service functions (same shape, same async signature, small
 * artificial delay) so the UI always has data to render, with no network
 * calls at all. If you later bring a real backend online, just swap the
 * imports back to services/mentor.js — the component logic doesn't change.
 * ---------------------------------------------------------------------------
 */

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const MOCK_PROGRESS = {
  topics: ["React Hooks", "REST APIs", "Database Design", "Unit Testing"],
  completedTopics: ["HTML & CSS", "JavaScript Basics", "Git & GitHub", "Node.js Fundamentals"],
  currentTopic: "React Hooks",
  progressPercentage: 62,
  totalHours: 48,
};

const MOCK_ASSESSMENTS = [
  { id: 1, title: "JavaScript Fundamentals Quiz", status: "completed", score: 88, totalScore: 100, date: "Jun 12, 2026" },
  { id: 2, title: "React Basics Assessment", status: "completed", score: 72, totalScore: 100, date: "Jun 28, 2026" },
  { id: 3, title: "API Integration Challenge", status: "pending" },
  { id: 4, title: "Database Design Quiz", status: "pending" },
];

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    type: "Course",
    title: "Mastering React Hooks",
    level: "Intermediate",
    duration: "3h 20m",
    description: "Deep dive into useState, useEffect, and custom hooks with hands-on exercises.",
  },
  {
    id: 2,
    type: "Resource",
    title: "REST API Design Best Practices",
    level: "Intermediate",
    duration: "45m read",
    description: "A guide to designing clean, consistent, and scalable REST APIs.",
  },
  {
    id: 3,
    type: "Project",
    title: "Build a Task Manager with Node & React",
    level: "Advanced",
    duration: "6h",
    description: "Apply your skills in a full-stack project combining everything you've learned so far.",
  },
];

async function getProgress() {
  await delay(500);
  return MOCK_PROGRESS;
}

async function getAssessments() {
  await delay(500);
  return MOCK_ASSESSMENTS;
}

async function getRecommendations() {
  await delay(500);
  return MOCK_RECOMMENDATIONS;
}

async function submitAssessment(assessmentId) {
  await delay(600);
  const assessment = MOCK_ASSESSMENTS.find((a) => a.id === assessmentId);
  if (assessment) {
    assessment.status = "completed";
    assessment.score = Math.floor(Math.random() * 21) + 70; // 70-90
    assessment.totalScore = 100;
    assessment.date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  return { success: true };
}

// A tiny canned "AI" so the chat feels responsive without a real model call.
function mockMentorReply(question) {
  const q = question.toLowerCase();
  if (q.includes("hook")) {
    return "React Hooks let you use state and other React features in function components. useState manages local state, and useEffect handles side effects like data fetching. Want a quick example?";
  }
  if (q.includes("api") || q.includes("rest")) {
    return "A REST API organizes access to resources around URLs and HTTP verbs (GET, POST, PUT, DELETE). Keep endpoints resource-based and stateless, and you'll have a solid foundation.";
  }
  if (q.includes("progress") || q.includes("how am i doing")) {
    return `You're at ${MOCK_PROGRESS.progressPercentage}% overall, currently working through "${MOCK_PROGRESS.currentTopic}". Check the Progress tab for the full breakdown!`;
  }
  if (q.includes("assessment") || q.includes("quiz") || q.includes("test")) {
    const pending = MOCK_ASSESSMENTS.filter((a) => a.status === "pending").length;
    return `You have ${pending} pending assessment${pending === 1 ? "" : "s"}. Head to the Skills tab whenever you're ready to test yourself.`;
  }
  if (q.includes("recommend") || q.includes("what should i learn") || q.includes("next")) {
    return "Based on your progress, I'd suggest starting with \"Mastering React Hooks\" next — check the Recommendations tab for the full list tailored to you.";
  }
  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return "Hey there! Happy to help with anything — React, APIs, databases, testing, or just figuring out what to learn next.";
  }
  return "Good question! While I don't have a live connection right now, I can help with React, JavaScript, APIs, and general study guidance. Try asking about your progress, a pending assessment, or a topic you're stuck on.";
}

async function sendMessage(question) {
  await delay(700 + Math.random() * 500);
  return { response: mockMentorReply(question) };
}

/**
 * ---------------------------------------------------------------------------
 * COMPONENT
 * ---------------------------------------------------------------------------
 */
export default function AIMentor({ user, onNavigate }) {
  const [messages, setMessages] = useState([
    { role: "mentor", content: "Hello! I'm your AI Mentor. How can I help you today?" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState("chat"); // chat, progress, assessment, recommendations

  const [learning, setLearning] = useState({
    topics: [],
    completedTopics: [],
    currentTopic: "",
    progressPercentage: 0,
  });
  const [assessments, setAssessments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  const loadMentorData = async () => {
    setLoading(true);
    setError("");
    try {
      const [progressData, assessmentsData, recommendationsData] = await Promise.all([
        getProgress(),
        getAssessments(),
        getRecommendations(),
      ]);
      setLearning(progressData);
      setAssessments(assessmentsData);
      setRecommendations(recommendationsData);
    } catch (err) {
      setError(err.message || "Something went wrong while loading your mentor data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentorData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = inputMessage.trim();
    if (!question || isSending) return;

    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await sendMessage(question);
      setMessages((prev) => [...prev, { role: "mentor", content: response.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "mentor", content: "Sorry, I couldn't process that right now. Please try again." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleStartAssessment = (assessment) => {
    if (assessment.status === "pending") {
      setCurrentAssessment(assessment);
      setShowAssessmentModal(true);
    }
  };

  const handleCompleteAssessment = async () => {
    if (!currentAssessment) return;
    try {
      await submitAssessment(currentAssessment.id);
      await loadMentorData();
    } catch (err) {
      setError(err.message || "Something went wrong while submitting your assessment.");
    } finally {
      setShowAssessmentModal(false);
      setCurrentAssessment(null);
    }
  };

  if (loading) {
    return (
      <section className="view active">
        <div className="panel">
          <h2>Loading AI Mentor...</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="view active">
        <div className="panel">
          <h2 style={{ color: "red" }}>{error}</h2>
          <button
            onClick={loadMentorData}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>🤖 AI Mentor</h1>
          <p>Personalized learning with AI-powered guidance and support</p>
        </div>
      </div>

      {/* View Tabs */}
      <div
        className="tabs-nav"
        style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={() => setView("chat")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "chat" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "chat" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setView("progress")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "progress" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "progress" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          📊 Progress
        </button>
        <button
          onClick={() => setView("assessment")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "assessment" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "assessment" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          📝 Skills
        </button>
        <button
          onClick={() => setView("recommendations")}
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: view === "recommendations" ? "2px solid var(--primary)" : "none",
            background: "transparent",
            cursor: "pointer",
            color: view === "recommendations" ? "var(--primary)" : "var(--text-secondary)",
          }}
        >
          🎯 Recommendations
        </button>
      </div>

      {/* AI Chat View */}
      {view === "chat" && (
        <div className="panel" style={{ display: "flex", flexDirection: "column", height: "600px" }}>
          <div className="panel-head">
            <h3>AI Chat Assistance</h3>
          </div>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: msg.role === "user" ? "var(--primary)" : "var(--background-alt)",
                    color: msg.role === "user" ? "white" : "var(--text)",
                    border: msg.role === "user" ? "none" : "1px solid var(--border)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "var(--background-alt)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: "0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
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
              Send
            </button>
          </form>
        </div>
      )}

      {/* Progress Tracking View */}
      {view === "progress" && (
        <div className="panel">
          <div className="panel-head">
            <h3>📊 Learning Progress</h3>
          </div>

          {/* Current Topic */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ marginBottom: "0.5rem" }}>Current Topic: {learning.currentTopic}</h4>
            <div
              style={{
                background: "var(--background-alt)",
                borderRadius: "0.5rem",
                overflow: "hidden",
                height: "2rem",
              }}
            >
              <div
                style={{
                  background: "var(--primary)",
                  height: "100%",
                  width: `${learning.progressPercentage}%`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {learning.progressPercentage}%
              </div>
            </div>
          </div>

          {/* Completed Topics */}
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>✅ Completed Topics ({learning.completedTopics.length})</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {learning.completedTopics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--green-light)",
                    color: "var(--green)",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Topics */}
          <div>
            <h4 style={{ marginBottom: "1rem" }}>📚 Upcoming Topics ({learning.topics.length})</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {learning.topics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    borderRadius: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "2rem" }}>
            <div
              style={{
                padding: "1rem",
                background: "var(--background-alt)",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {learning.completedTopics.length}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>Topics Completed</div>
            </div>
            <div
              style={{
                padding: "1rem",
                background: "var(--background-alt)",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {learning.progressPercentage}%
              </div>
              <div style={{ color: "var(--text-secondary)" }}>Overall Progress</div>
            </div>
            <div
              style={{
                padding: "1rem",
                background: "var(--background-alt)",
                borderRadius: "0.5rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {learning.totalHours ? `${learning.totalHours} hrs` : "—"}
              </div>
              <div style={{ color: "var(--text-secondary)" }}>Total Learning</div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Assessment View */}
      {view === "assessment" && (
        <div className="panel">
          <div className="panel-head">
            <h3>📝 Skill Assessment</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                style={{
                  padding: "1rem",
                  background: "var(--background-alt)",
                  borderRadius: "0.5rem",
                  border: `2px solid ${assessment.status === "completed" ? "var(--green)" : "var(--orange)"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 0.5rem 0" }}>{assessment.title}</h4>
                  {assessment.status === "completed" ? (
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Score:{" "}
                      <span style={{ fontWeight: 600, color: "var(--green)" }}>
                        {assessment.score}/{assessment.totalScore}
                      </span>{" "}
                      | Completed on {assessment.date}
                    </p>
                  ) : (
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      Status: <span style={{ fontWeight: 600, color: "var(--orange)" }}>Pending</span>
                    </p>
                  )}
                </div>
                {assessment.status === "completed" && (
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color:
                        assessment.score >= 80 ? "var(--green)" : assessment.score >= 60 ? "var(--orange)" : "var(--red)",
                      marginLeft: "1rem",
                    }}
                  >
                    {assessment.score}%
                  </div>
                )}
                {assessment.status === "pending" && (
                  <button
                    onClick={() => handleStartAssessment(assessment)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      marginLeft: "1rem",
                    }}
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations View */}
      {view === "recommendations" && (
        <div className="panel">
          <div className="panel-head">
            <h3>🎯 Learning Recommendations</h3>
          </div>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Based on your current progress, here are personalized recommendations:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                style={{
                  padding: "1.5rem",
                  background: "var(--background-alt)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.25rem 0" }}>
                      {rec.type === "Course" ? "📚" : rec.type === "Resource" ? "📖" : "💻"} {rec.title}
                    </h4>
                    <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {rec.type} • {rec.level}
                    </p>
                  </div>
                  <button
                    style={{
                      padding: "0.5rem 1rem",
                      background: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    Enroll
                  </button>
                </div>
                <p style={{ margin: "0 0 0.75rem 0", color: "var(--text)" }}>{rec.description}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>⏱️ Duration: {rec.duration}</span>
                  <span>Level: {rec.level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Modal */}
      {showAssessmentModal && currentAssessment && (
        <AssessmentModal
          assessment={currentAssessment}
          onCancel={() => {
            setShowAssessmentModal(false);
            setCurrentAssessment(null);
          }}
          onSubmit={handleCompleteAssessment}
        />
      )}
    </section>
  );
}

function AssessmentModal({ assessment, onCancel, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (questionNumber, option) => {
    setAnswers((prev) => ({ ...prev, [questionNumber]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "0.75rem",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <h2>{assessment.title}</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Answer the following questions to test your knowledge.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {[1, 2, 3].map((q) => (
            <div key={q}>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Question {q}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {["Option A", "Option B", "Option C", "Option D"].map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name={`q${q}`}
                      checked={answers[q] === opt}
                      onChange={() => handleSelect(q, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    </div>
  );
}