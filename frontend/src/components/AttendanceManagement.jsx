import { useState, useEffect, useMemo } from 'react';
import { LeaveModal } from './Modals.jsx';
import { updateAttendanceStatus, submitLeave, fetchAttendanceHistory } from '../api.js';
import { initials, attPct } from '../utils.js';

const TABS = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'batch', label: 'Batch-wise Summary' },
  { id: 'history', label: 'Attendance History' }
];

export default function AttendanceManagement({ interns, setInterns, showToast }) {
  const [domain, setDomain] = useState('');
  const [batch, setBatch] = useState('');
  const [internId, setInternId] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pendingLeaveId, setPendingLeaveId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [history, setHistory] = useState([]);

  const domains = useMemo(() => [...new Set(interns.map((i) => i.dept))], [interns]);
  const batches = useMemo(
    () => [...new Set(interns.filter((i) => !domain || i.dept === domain).map((i) => i.batch))],
    [interns, domain]
  );

  useEffect(() => {
    fetchAttendanceHistory().then(({ data }) => setHistory(data));
  }, []);

  // Selecting a domain resets batch/intern if they no longer apply.
  useEffect(() => {
    if (batch && !batches.includes(batch)) setBatch('');
  }, [domain]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [i.id, i.name, i.dept, i.batch].join(' ').toLowerCase().includes(q);
    const matchDomain = !domain || i.dept === domain;
    const matchBatch = !batch || i.batch === batch;
    const matchIntern = !internId || i.id === internId;
    return matchSearch && matchDomain && matchBatch && matchIntern;
  });

  const internOptions = interns.filter((i) => (!domain || i.dept === domain) && (!batch || i.batch === batch));

  function updateIntern(id, patch) {
    setInterns((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  function handleStatusChange(id, value) {
    if (value === 'leave') {
      setPendingLeaveId(id);
    } else {
      updateIntern(id, { status: value });
    }
  }

  async function handleSave(id) {
    const intern = interns.find((i) => i.id === id);
    setSavingId(id);
    await updateAttendanceStatus(id, date, intern.status);
    if (intern.status === 'absent') {
      setHistory((prev) => [{ internId: id, name: intern.name, dept: intern.dept, batch: intern.batch, date, status: 'absent', type: '-', reason: 'Marked by staff' }, ...prev]);
    }
    showToast(`Attendance saved for ${intern.name}`);
    setTimeout(() => setSavingId(null), 1400);
  }

  async function handleLeaveSave(details) {
    const intern = interns.find((i) => i.id === pendingLeaveId);
    updateIntern(pendingLeaveId, { status: 'leave', leaveType: details.type, leaveDate: details.date, reason: details.reason });
    await submitLeave({ internId: pendingLeaveId, ...details });
    setHistory((prev) => [{ internId: pendingLeaveId, name: intern.name, dept: intern.dept, batch: intern.batch, date: details.date, status: 'leave', type: details.type, reason: details.reason }, ...prev]);
    showToast(`Leave recorded for ${intern.name}`);
    setPendingLeaveId(null);
  }

  // Batch-wise summary aggregates.
  const batchSummary = useMemo(() => {
    const groups = {};
    interns.forEach((i) => {
      const key = `${i.dept} · ${i.batch}`;
      if (!groups[key]) groups[key] = { dept: i.dept, batch: i.batch, total: 0, present: 0, absent: 0, leave: 0, avgAttendance: 0 };
      groups[key].total += 1;
      groups[key][i.status] += 1;
      groups[key].avgAttendance += attPct(i);
    });
    return Object.values(groups).map((g) => ({ ...g, avgAttendance: Math.round((g.avgAttendance / g.total) * 10) / 10 }));
  }, [interns]);

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Attendance Management</h1>
          <p>Record, update and monitor intern attendance by domain, batch and individual intern.</p>
        </div>
        <div className="head-actions">
          <input type="date" className="btn" style={{ fontWeight: 600 }} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="panel">
        <div className="filters-row">
          <select value={domain} onChange={(e) => { setDomain(e.target.value); setInternId(''); }}>
            <option value="">Select Domain — All</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={batch} onChange={(e) => { setBatch(e.target.value); setInternId(''); }}>
            <option value="">Select Batch — All</option>
            {batches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={internId} onChange={(e) => setInternId(e.target.value)}>
            <option value="">Select Individual Intern — All</option>
            {internOptions.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.id})</option>)}
          </select>
          <input type="text" placeholder="Search by name, ID, department or batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 6, borderBottom: '1.5px solid var(--border)', marginBottom: 18, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="btn"
              style={{
                border: 'none',
                borderRadius: '9px 9px 0 0',
                background: tab === t.id ? 'var(--primary-light)' : 'transparent',
                color: tab === t.id ? 'var(--primary)' : 'var(--muted)',
                marginBottom: -1.5
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* DAILY / MARK & EDIT ATTENDANCE */}
        {tab === 'daily' && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Intern</th><th>Department</th><th>Batch</th><th>Status</th><th>Leave Type</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="intern-cell">
                        <div className="intern-ava">{initials(i.name)}</div>
                        <div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div>
                      </div>
                    </td>
                    <td>{i.dept}</td>
                    <td>{i.batch}</td>
                    <td>
                      <select className="status-select" value={i.status} onChange={(e) => handleStatusChange(i.id, e.target.value)}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="leave">Leave</option>
                      </select>
                    </td>
                    <td>{i.status === 'leave' ? <span className="pill leave">{i.leaveType}</span> : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td>
                      <button className={`save-btn ${savingId === i.id ? 'saved' : ''}`} onClick={() => handleSave(i.id)}>
                        {savingId === i.id ? 'Saved ✓' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-note">No interns match your search or filters.</div>}
          </div>
        )}

        {/* WEEKLY / MONTHLY OVERVIEW */}
        {(tab === 'weekly' || tab === 'monthly') && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Intern</th><th>Department</th><th>Batch</th><th>{tab === 'weekly' ? 'Weekly' : 'Monthly'} Attendance</th></tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const pct = attPct(i);
                  return (
                    <tr key={i.id}>
                      <td>
                        <div className="intern-cell">
                          <div className="intern-ava">{initials(i.name)}</div>
                          <div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div>
                        </div>
                      </td>
                      <td>{i.dept}</td>
                      <td>{i.batch}</td>
                      <td>
                        <span className="mini-bar"><div style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? 'var(--green)' : 'var(--red)' }}></div></span>
                        {pct}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-note">No interns match your search or filters.</div>}
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              {tab === 'weekly' ? 'Weekly' : 'Monthly'} figures are calculated from each intern's overall working-day attendance percentage.
            </p>
          </div>
        )}

        {/* BATCH-WISE SUMMARY */}
        {tab === 'batch' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {batchSummary
              .filter((g) => (!domain || g.dept === domain) && (!batch || g.batch === batch))
              .map((g) => (
                <div key={`${g.dept}-${g.batch}`} className="stat-card">
                  <div className="lbl" style={{ marginBottom: 6 }}>{g.dept}</div>
                  <div className="val" style={{ fontSize: 17 }}>{g.batch}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, fontSize: 12.5 }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>{g.present} Present</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>{g.absent} Absent</span>
                    <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{g.leave} Leave</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>Avg. attendance: <strong style={{ color: 'var(--text)' }}>{g.avgAttendance}%</strong></div>
                </div>
              ))}
          </div>
        )}

        {/* ATTENDANCE HISTORY */}
        {tab === 'history' && (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Intern</th><th>Department</th><th>Batch</th><th>Status</th><th>Type</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {history
                  .filter((h) => (!domain || h.dept === domain) && (!batch || h.batch === batch) && (!internId || h.internId === internId))
                  .map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.date}</td>
                      <td>{h.name} <span className="isub">({h.internId})</span></td>
                      <td>{h.dept}</td>
                      <td>{h.batch}</td>
                      <td><span className={`pill ${h.status}`}>{h.status === 'leave' ? 'Leave' : 'Absent'}</span></td>
                      <td>{h.type}</td>
                      <td>{h.reason}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {history.length === 0 && <div className="empty-note">No attendance history recorded yet.</div>}
          </div>
        )}
      </div>

      <LeaveModal
        intern={interns.find((i) => i.id === pendingLeaveId)}
        onCancel={() => setPendingLeaveId(null)}
        onSave={handleLeaveSave}
      />
    </section>
  );
}
