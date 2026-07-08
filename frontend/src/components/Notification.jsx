import { useState, useMemo } from 'react';
import Icon from '../icons.jsx';
import { sendNotification } from '../api.js';

const RECIPIENT_OPTIONS = ['All Interns', 'Batch A', 'Batch B', 'Batch C'];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function Notification({ interns = [], showToast }) {
  const [notifications, setNotifications] = useState([
    { id: 'n1', message: 'Week 6 assessment scores have been published for Batch A.', recipient: 'Batch A', status: 'unread', createdAt: new Date(Date.now() - 3600e3).toISOString() },
    { id: 'n2', message: 'Reminder: submit pending task reviews before Friday.', recipient: 'All Interns', status: 'read', createdAt: new Date(Date.now() - 20 * 3600e3).toISOString() }
  ]);
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState(RECIPIENT_OPTIONS[0]);
  const [isSending, setIsSending] = useState(false);
  const [filter, setFilter] = useState('all');

  // Deadline reminders are derived from pending / incomplete assessment work,
  // matching the doc's "Deadline Reminder" feature backed by scheduled checks.
  const reminders = useMemo(() => {
    return interns
      .filter((i) => i.tasksDone < i.tasksTotal || i.assignDone < i.assignTotal)
      .slice(0, 6)
      .map((i) => ({
        id: i.id,
        name: i.name,
        detail: i.tasksDone < i.tasksTotal
          ? `${i.tasksTotal - i.tasksDone} task(s) pending`
          : `${i.assignTotal - i.assignDone} assignment(s) pending`
      }));
  }, [interns]);

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const filteredNotifications = notifications.filter((n) =>
    filter === 'all' ? true : n.status === filter
  );

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    const payload = { message: message.trim(), recipient };
    const localItem = {
      id: `local-${Date.now()}`,
      message: payload.message,
      recipient: payload.recipient,
      status: 'unread',
      createdAt: new Date().toISOString()
    };
    setNotifications((prev) => [localItem, ...prev]);
    const { live } = await sendNotification(payload);
    showToast?.(`Notification sent to ${recipient}${live ? '' : ' (saved locally — backend not connected)'}`);
    setMessage('');
    setIsSending(false);
  }

  function markRead(id) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)));
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Notification &amp; Reminder</h1>
          <p>Send notifications to interns and track upcoming assessment deadlines.</p>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Icon name="bell" /></div></div>
          <div className="val">{notifications.length}</div>
          <div className="lbl">Total Notifications</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--red-light)', color: 'var(--red)' }}><Icon name="alert" /></div></div>
          <div className="val">{unreadCount}</div>
          <div className="lbl">Unread</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}><Icon name="clock" /></div></div>
          <div className="val">{reminders.length}</div>
          <div className="lbl">Deadline Reminders</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Send Notification</h3></div>
        <form onSubmit={handleSend}>
          <div className="filters-row" style={{ marginBottom: 12 }}>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} style={{ minWidth: 160 }}>
              {RECIPIENT_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input
              type="text"
              placeholder="Type your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn blue" type="submit" disabled={isSending || !message.trim()}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon name="send" size={14} />
                {isSending ? 'Sending…' : 'Send'}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Notifications</h3>
          <div className="filters-row" style={{ margin: 0 }}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        {filteredNotifications.map((n) => (
          <div className="activity-row" key={n.id}>
            <div className="aicon"><Icon name="bell" size={16} /></div>
            <div className="atext">
              {n.message}
              <div className="isub" style={{ marginTop: 2 }}>To: {n.recipient}</div>
            </div>
            {n.status === 'unread'
              ? <button className="link-btn" onClick={() => markRead(n.id)}>Mark as read</button>
              : <span className="pill present">Read</span>}
            <div className="atime">{timeAgo(n.createdAt)}</div>
          </div>
        ))}
        {filteredNotifications.length === 0 && <div className="empty-note">No notifications to show.</div>}
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Deadline Reminders</h3></div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Intern</th><th>Pending Item</th></tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td><span className="pill leave">{r.detail}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reminders.length === 0 && <div className="empty-note">Everyone is up to date — no pending deadlines.</div>}
      </div>
    </section>
  );
}
