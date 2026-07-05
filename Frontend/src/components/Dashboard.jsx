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

  const firstName = (user?.name || 'Staff').split(' ')[0];

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
          <button className="quick-card" onClick={() => onNavigate('attendance')}>
            <div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>🗓️</div>
            <h3>Attendance Management</h3>
            <p>Review attendance trends</p>
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
