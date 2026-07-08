import { useState } from 'react';

export default function AIMentor({ user, onNavigate }) {
  const [messages, setMessages] = useState([
    { role: 'mentor', content: 'Hello! I\'m your AI Mentor. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [view, setView] = useState('chat'); // chat, progress, assessment, recommendations
  const [learning, setLearning] = useState({
    topics: ['React Basics', 'JavaScript ES6', 'Web APIs'],
    completedTopics: ['HTML & CSS', 'JavaScript Fundamentals'],
    currentTopic: 'React Basics',
    progressPercentage: 65
  });
  const [assessments, setAssessments] = useState([
    { id: 1, title: 'JavaScript Quiz', score: 85, totalScore: 100, date: '2026-07-03', status: 'completed' },
    { id: 2, title: 'React Basics Quiz', score: 0, totalScore: 100, date: '2026-07-05', status: 'pending' }
  ]);
  const [recommendations, setRecommendations] = useState([
    { id: 1, type: 'Course', title: 'Advanced React Patterns', description: 'Learn hooks, context, and performance optimization', level: 'Intermediate', duration: '8 weeks' },
    { id: 2, type: 'Resource', title: 'JavaScript Design Patterns', description: 'Master common design patterns in JavaScript', level: 'Intermediate', duration: 'Self-paced' },
    { id: 3, type: 'Practice', title: 'Build a Todo App', description: 'Apply React concepts by building a real application', level: 'Beginner', duration: '2 hours' }
  ]);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      // Add user message
      const userMsg = { role: 'user', content: inputMessage };
      setMessages([...messages, userMsg]);

      // Simulate AI response
      setTimeout(() => {
        const responses = [
          'That\'s a great question! Let me explain...',
          'Based on your current progress, I recommend focusing on...',
          'I notice you\'re struggling with this concept. Here\'s a tip...',
          'Great progress! You\'ve mastered this topic. Next, try...',
          'Would you like me to explain that in more detail?',
          'Let me provide you with some resources on that topic.'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setMessages(prev => [...prev, { role: 'mentor', content: randomResponse }]);
      }, 500);

      setInputMessage('');
    }
  };

  const handleStartAssessment = (assessment) => {
    if (assessment.status === 'pending') {
      setCurrentAssessment(assessment);
      setShowAssessmentModal(true);
    }
  };

  const handleCompleteAssessment = (score) => {
    setAssessments(assessments.map(a =>
      a.id === currentAssessment.id
        ? { ...a, score, status: 'completed' }
        : a
    ));
    setShowAssessmentModal(false);
    setCurrentAssessment(null);
  };

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>🤖 AI Mentor</h1>
          <p>Personalized learning with AI-powered guidance and support</p>
        </div>
      </div>

      {/* View Tabs */}
      <div className="tabs-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setView('chat')}
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: view === 'chat' ? '2px solid var(--primary)' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: view === 'chat' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setView('progress')}
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: view === 'progress' ? '2px solid var(--primary)' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: view === 'progress' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          📊 Progress
        </button>
        <button
          onClick={() => setView('assessment')}
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: view === 'assessment' ? '2px solid var(--primary)' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: view === 'assessment' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          📝 Skills
        </button>
        <button
          onClick={() => setView('recommendations')}
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: view === 'recommendations' ? '2px solid var(--primary)' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: view === 'recommendations' ? 'var(--primary)' : 'var(--text-secondary)'
          }}
        >
          🎯 Recommendations
        </button>
      </div>

      {/* AI Chat View */}
      {view === 'chat' && (
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
          <div className="panel-head"><h3>AI Chat Assistance</h3></div>
          <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '0.5rem'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    background: msg.role === 'user' ? 'var(--primary)' : 'var(--background-alt)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border)'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Progress Tracking View */}
      {view === 'progress' && (
        <div className="panel">
          <div className="panel-head"><h3>📊 Learning Progress</h3></div>

          {/* Current Topic */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Current Topic: {learning.currentTopic}</h4>
            <div style={{ background: 'var(--background-alt)', borderRadius: '0.5rem', overflow: 'hidden', height: '2rem' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  height: '100%',
                  width: `${learning.progressPercentage}%`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {learning.progressPercentage}%
              </div>
            </div>
          </div>

          {/* Completed Topics */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>✅ Completed Topics ({learning.completedTopics.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {learning.completedTopics.map(topic => (
                <span
                  key={topic}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--green-light)',
                    color: 'var(--green)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Topics */}
          <div>
            <h4 style={{ marginBottom: '1rem' }}>📚 Upcoming Topics ({learning.topics.length})</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {learning.topics.map(topic => (
                <span
                  key={topic}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ padding: '1rem', background: 'var(--background-alt)', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{learning.completedTopics.length}</div>
              <div style={{ color: 'var(--text-secondary)' }}>Topics Completed</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--background-alt)', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>{learning.progressPercentage}%</div>
              <div style={{ color: 'var(--text-secondary)' }}>Overall Progress</div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--background-alt)', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>15 hrs</div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Learning</div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Assessment View */}
      {view === 'assessment' && (
        <div className="panel">
          <div className="panel-head"><h3>📝 Skill Assessment</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assessments.map(assessment => (
              <div
                key={assessment.id}
                style={{
                  padding: '1rem',
                  background: 'var(--background-alt)',
                  borderRadius: '0.5rem',
                  border: `2px solid ${assessment.status === 'completed' ? 'var(--green)' : 'var(--orange)'}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{assessment.title}</h4>
                  {assessment.status === 'completed' ? (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Score: <span style={{ fontWeight: 600, color: 'var(--green)' }}>{assessment.score}/{assessment.totalScore}</span> | Completed on {assessment.date}
                    </p>
                  ) : (
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Status: <span style={{ fontWeight: 600, color: 'var(--orange)' }}>Pending</span>
                    </p>
                  )}
                </div>
                {assessment.status === 'completed' && (
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: assessment.score >= 80 ? 'var(--green)' : assessment.score >= 60 ? 'var(--orange)' : 'var(--red)',
                      marginLeft: '1rem'
                    }}
                  >
                    {assessment.score}%
                  </div>
                )}
                {assessment.status === 'pending' && (
                  <button
                    onClick={() => handleStartAssessment(assessment)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      marginLeft: '1rem'
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
      {view === 'recommendations' && (
        <div className="panel">
          <div className="panel-head"><h3>🎯 Learning Recommendations</h3></div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Based on your current progress, here are personalized recommendations:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recommendations.map(rec => (
              <div
                key={rec.id}
                style={{
                  padding: '1.5rem',
                  background: 'var(--background-alt)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0' }}>
                      {rec.type === 'Course' ? '📚' : rec.type === 'Resource' ? '📖' : '💻'} {rec.title}
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {rec.type} • {rec.level}
                    </p>
                  </div>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Enroll
                  </button>
                </div>
                <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text)' }}>{rec.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <h2>{currentAssessment.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Answer the following questions to test your knowledge.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3].map(q => (
                <div key={q}>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Question {q}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['Option A', 'Option B', 'Option C', 'Option D'].map(opt => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" name={`q${q}`} defaultChecked={opt === 'Option A'} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowAssessmentModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteAssessment(85)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
