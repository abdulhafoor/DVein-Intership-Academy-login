import { isEligible } from '../utils.js';

export default function Dashboard({ interns, user, onNavigate }) {
  const total = interns.length;
  const present = interns.filter((i) => i.status === 'present').length;
  const onLeave = interns.filter((i) => i.status === 'leave').length;
  const certEligible = interns.filter(isEligible).length;

  const activities = [
    { icon: '✅', text: `${present} interns marked present today`, time: 'Just now' },
    { icon: '🏅', text: `${certEligible} interns are currently certificate-eligible`, time: '10m ago' },
    { icon: '🏖️', text: `${onLeave} interns are on leave today`, time: '1h ago' }
  ];

  const firstName = (user?.name || 'Mentor').split(' ')[0];

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Welcome back, {firstName.replace(/\b\w/g, (c) => c.toUpperCase())} 👋</h1>
          <p>Here's what's happening across your interns today.</p>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>👥</div></div>
          <div className="val">{total}</div>
          <div className="lbl">Total Interns</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>✅</div></div>
          <div className="val">{present}</div>
          <div className="lbl">Present Today</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>🏖️</div></div>
          <div className="val">{onLeave}</div>
          <div className="lbl">On Leave Today</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🎓</div></div>
          <div className="val">{certEligible}</div>
          <div className="lbl">Certificates Eligible</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Quick Access</h3></div>
        <div className="quick-grid">
          <button className="quick-card" onClick={() => onNavigate('leave')}>
            <div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📋</div>
            <h3>Leave Management</h3>
            <p>Mark daily attendance &amp; leave</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('certificate')}>
            <div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🏅</div>
            <h3>Certificate Management</h3>
            <p>Verify eligibility &amp; generate certificates</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('batch')}>
            <div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>🗂️</div>
            <h3>Batch Management</h3>
            <p>Add students — instantly live in Attendance</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('attendance')}>
            <div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>🗓️</div>
            <h3>Attendance Management</h3>
            <p>Review attendance trends</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('session')}>
            <div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>📅</div>
            <h3>Session Scheduler</h3>
            <p>Book &amp; manage mentoring sessions</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('aimentor')}>
            <div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>🤖</div>
            <h3>AI Mentor</h3>
            <p>Personalized learning &amp; guidance</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('task')}>
            <div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>✅</div>
            <h3>Task Assignment</h3>
            <p>Create &amp; track student tasks</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('assessment')}>
            <div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>📝</div>
            <h3>Assessment Management</h3>
            <p>Upload &amp; review Excel assessment records</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('analytics')}>
            <div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>📊</div>
            <h3>Analytics &amp; Insights</h3>
            <p>Batch performance &amp; eligibility trends</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('notification')}>
            <div className="ic-box" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>🔔</div>
            <h3>Notification &amp; Reminder</h3>
            <p>Send updates &amp; track deadlines</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('auth')}>
            <div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🪪</div>
            <h3>Auth &amp; Mentor Profile</h3>
            <p>Manage your account &amp; assigned interns</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('tech')}>
            <div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>💻</div>
            <h3>Tech Management</h3>
            <p>Inventory, assets &amp; license tracking</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('announce')}>
            <div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>📢</div>
            <h3>Announcements &amp; Communication</h3>
            <p>Broadcasts, messages &amp; reminders</p>
          </button>
          <button className="quick-card" onClick={() => onNavigate('performance')}>
            <div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>📈</div>
            <h3>Performance Tracking</h3>
            <p>Mentor activity &amp; review status</p>
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Recent Activity</h3></div>
        {activities.map((a, idx) => (
          <div className="activity-row" key={idx}>
            <div className="aicon">{a.icon}</div>
            <div className="atext">{a.text}</div>
            <div className="atime">{a.time}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
