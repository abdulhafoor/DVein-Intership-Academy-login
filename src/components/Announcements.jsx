import { useMemo, useState } from 'react';

const announcements = [
  { title: 'Weekly Tech Sync', channel: 'All Staff', type: 'Announcement', time: '10 min ago' },
  { title: 'Maintenance Window Tonight', channel: 'IT Team', type: 'Alert', time: '1 hour ago' },
  { title: 'Feedback Survey: Portal Experience', channel: 'Interns', type: 'Poll', time: 'Today' }
];

const messages = [
  { sender: 'Yuvashree', preview: 'Please confirm the session agenda.', time: '09:15' },
  { sender: 'Dilliraja', preview: 'Asset handover update is ready.', time: '08:40' }
];

const reminders = [
  { title: 'Orientation Session', time: '2:00 PM' },
  { title: 'License Renewal Review', time: '4:30 PM' },
  { title: 'Mentor Feedback Poll', time: '6:00 PM' }
];

export default function Announcements() {
  const [filter, setFilter] = useState('');
  const filteredAnnouncements = useMemo(() => {
    const q = filter.toLowerCase();
    return announcements.filter((item) => !q || [item.title, item.channel, item.type].join(' ').toLowerCase().includes(q));
  }, [filter]);

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Announcements & Communication</h1>
          <p>Publish updates, send alerts, collaborate in groups, and collect feedback from users.</p>
        </div>
        <div className="head-actions">
          <button className="btn blue">+ New Announcement</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📢</div></div>
          <div className="val">12</div>
          <div className="lbl">Active Announcements</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>💬</div></div>
          <div className="val">48</div>
          <div className="lbl">Unread Messages</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>🔔</div></div>
          <div className="val">6</div>
          <div className="lbl">Pending Alerts</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🗳️</div></div>
          <div className="val">3</div>
          <div className="lbl">Live Polls</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Announcements</h3>
        </div>
        <div className="filters-row">
          <input type="text" placeholder="Search announcement or audience" value={filter} onChange={(e) => setFilter(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {filteredAnnouncements.map((item) => (
            <div key={item.title} className="quick-card" style={{ boxShadow: 'none', border: '1.5px solid var(--border)' }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span className={`pill ${item.type === 'Alert' ? 'noteligible' : item.type === 'Poll' ? 'orange' : 'eligible'}`} style={item.type === 'Poll' ? { background: 'var(--orange-light)', color: 'var(--orange)' } : {}}>{item.type}</span>
                <span className="isub">{item.time}</span>
              </div>
              <h3>{item.title}</h3>
              <p style={{ marginTop: 6 }}>{item.channel}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Direct Messaging</h3>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {messages.map((message) => (
            <div key={message.sender} className="activity-row">
              <div className="aicon">✉️</div>
              <div className="atext">
                <div style={{ fontWeight: 700 }}>{message.sender}</div>
                <div className="isub">{message.preview}</div>
              </div>
              <span className="isub">{message.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Upcoming Reminders</h3>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {reminders.map((item) => (
            <div key={item.title} className="activity-row">
              <div className="aicon">⏰</div>
              <div className="atext">
                <div style={{ fontWeight: 700 }}>{item.title}</div>
              </div>
              <span className="pill eligible">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
