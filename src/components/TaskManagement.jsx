import { useState, useMemo } from 'react';
import { TaskModal } from './Modals.jsx';
import { createTask, updateTaskStatus as apiUpdateTaskStatus } from '../api.js';
import { initials, taskDurationDays, taskTimelinePct, deadlineInfo, priorityTone, statusTone } from '../utils.js';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

export default function TaskManagement({ interns, tasks, setTasks, showToast }) {
  const [showCreate, setShowCreate] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [internFilter, setInternFilter] = useState('');
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  const internById = useMemo(() => Object.fromEntries(interns.map((i) => [i.id, i])), [interns]);

  const filtered = tasks.filter((t) => {
    const intern = internById[t.internId];
    const q = search.toLowerCase();
    const matchSearch = !q || [t.title, intern?.name, intern?.id, intern?.dept].join(' ').toLowerCase().includes(q);
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchIntern = !internFilter || t.internId === internFilter;
    return matchSearch && matchPriority && matchStatus && matchIntern;
  });

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length
  }), [tasks]);

  async function handleCreate({ title, description, internIds, startDate, dueDate, priority }) {
    const newTasks = internIds.map((internId, idx) => ({
      id: `TSK-${Date.now()}-${idx}`,
      title,
      description,
      internId,
      startDate,
      dueDate,
      priority,
      status: 'Pending'
    }));
    setTasks((prev) => [...newTasks, ...prev]);
    for (const t of newTasks) await createTask(t); // eslint-disable-line no-await-in-loop
    showToast(`"${title}" assigned to ${internIds.length} student${internIds.length > 1 ? 's' : ''}`);
    setShowCreate(false);
  }

  async function handleStatusChange(taskId, status) {
    setSavingId(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    await apiUpdateTaskStatus(taskId, status);
    showToast('Task status updated');
    setTimeout(() => setSavingId(null), 900);
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Task Assignment Management</h1>
          <p>Create tasks, assign them to students, and track timelines through to completion.</p>
        </div>
        <div className="head-actions">
          <button className="btn blue" onClick={() => setShowCreate(true)}>+ Create Task</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>📋</div></div>
          <div className="val">{stats.total}</div>
          <div className="lbl">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>⏳</div></div>
          <div className="val">{stats.pending}</div>
          <div className="lbl">Pending</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}>🚧</div></div>
          <div className="val">{stats.inProgress}</div>
          <div className="lbl">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>✅</div></div>
          <div className="val">{stats.completed}</div>
          <div className="lbl">Completed</div>
        </div>
      </div>

      <div className="panel">
        <div className="filters-row">
          <input type="text" placeholder="Search by task, student, ID or department..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={internFilter} onChange={(e) => setInternFilter(e.target.value)}>
            <option value="">Select Student — All</option>
            {interns.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">Priority — All</option>
            {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status — All</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Assigned To</th>
                <th>Start / Due</th>
                <th>Duration</th>
                <th>Timeline</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const intern = internById[t.internId];
                const duration = taskDurationDays(t.startDate, t.dueDate);
                const timelinePct = taskTimelinePct(t.startDate, t.dueDate);
                const deadline = t.status === 'Completed'
                  ? { label: 'Completed', tone: 'green' }
                  : deadlineInfo(t.dueDate, t.status);
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="iname">{t.title}</div>
                      {t.description && <div className="isub" style={{ maxWidth: 220 }}>{t.description}</div>}
                    </td>
                    <td>
                      {intern ? (
                        <div className="intern-cell">
                          <div className="intern-ava">{initials(intern.name)}</div>
                          <div><div className="iname">{intern.name}</div><div className="isub">{intern.id}</div></div>
                        </div>
                      ) : <span className="isub">Unknown</span>}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12.5 }}>{t.startDate}</div>
                      <div className="isub">to {t.dueDate}</div>
                    </td>
                    <td>{duration} day{duration !== 1 ? 's' : ''}</td>
                    <td>
                      <span className="mini-bar" style={{ width: 70 }}>
                        <div style={{ width: `${timelinePct}%`, background: timelinePct >= 100 && t.status !== 'Completed' ? 'var(--red)' : 'var(--primary)' }}></div>
                      </span>
                      {timelinePct}%
                    </td>
                    <td><span className={`pill ${deadline.tone}`}>{deadline.label}</span></td>
                    <td><span className={`pill ${priorityTone(t.priority)}`}>{t.priority}</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        disabled={savingId === t.id}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-note">No tasks match your search or filters.</div>}
        </div>
      </div>

      <TaskModal show={showCreate} interns={interns} onCancel={() => setShowCreate(false)} onSave={handleCreate} />
    </section>
  );
}
