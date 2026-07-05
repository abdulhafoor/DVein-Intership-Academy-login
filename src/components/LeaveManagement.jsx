import { useState, useMemo } from 'react';
import { LeaveModal } from './Modals.jsx';
import { updateAttendanceStatus, submitLeave, exportReport } from '../api.js';
import { initials } from '../utils.js';

export default function LeaveManagement({ interns, setInterns, showToast }) {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [pendingLeaveId, setPendingLeaveId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const depts = useMemo(() => [...new Set(interns.map((i) => i.dept))], [interns]);

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [i.id, i.name, i.dept, i.batch].join(' ').toLowerCase().includes(q);
    const matchDept = !dept || i.dept === dept;
    const matchStatus = !statusFilter || i.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const total = interns.length;
  const present = interns.filter((i) => i.status === 'present').length;
  const absent = interns.filter((i) => i.status === 'absent').length;
  const onLeave = interns.filter((i) => i.status === 'leave').length;

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
    showToast(`Attendance saved for ${intern.name}`);
    setTimeout(() => setSavingId(null), 1400);
  }

  async function handleLeaveSave(details) {
    const intern = interns.find((i) => i.id === pendingLeaveId);
    updateIntern(pendingLeaveId, { status: 'leave', leaveType: details.type, leaveDate: details.date, reason: details.reason });
    await submitLeave({ internId: pendingLeaveId, ...details });
    showToast(`Leave recorded for ${intern.name}`);
    setPendingLeaveId(null);
  }

  async function handleExport(format) {
    await exportReport('leave', format);
    showToast(`Attendance report exported as ${format}`);
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Leave Management</h1>
          <p>Mark daily attendance and record leave details for your interns.</p>
        </div>
        <div className="head-actions">
          <input type="date" className="btn" style={{ fontWeight: 600 }} value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn" onClick={() => handleExport('CSV')}>Export CSV</button>
          <button className="btn" onClick={() => handleExport('PDF')}>Export PDF</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card"><div className="val">{total}</div><div className="lbl">Total Interns</div></div>
        <div className="stat-card"><div className="val" style={{ color: 'var(--green)' }}>{present}</div><div className="lbl">Present Today</div></div>
        <div className="stat-card"><div className="val" style={{ color: 'var(--red)' }}>{absent}</div><div className="lbl">Absent Today</div></div>

      </div>

      <div className="panel">
        <div className="panel-head"><h3>Intern List</h3></div>
        <div className="filters-row">
          <input type="text" placeholder="Search by name, ID, department or batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Intern</th><th>Department</th><th>Batch</th><th>Mentor</th><th>Leave Type</th><th>Action</th>
              </tr>
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
                  <td>{i.mentor}</td>

                  <td>
                    <select
                      value={i.leaveType || "Casual Leave"}
                      onChange={(e) =>
                        updateIntern(i.id, {
                          status: "leave",
                          leaveType: e.target.value,
                        })
                      }
                    >
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Emergency Leave">Emergency Leave</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                    </select>
                  </td>
                  <td>
                    <button className={`save-btn ${savingId === i.id ? 'saved' : ''}`} onClick={() => handleSave(i.id)}>
                      {savingId === i.id ? 'Saved ✓' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="empty-note">No interns match your search or filters.</div>}
      </div>

      <LeaveModal
        intern={interns.find((i) => i.id === pendingLeaveId)}
        onCancel={() => setPendingLeaveId(null)}
        onSave={handleLeaveSave}
      />
    </section>
  );
}
