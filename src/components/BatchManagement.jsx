import { useState, useMemo } from 'react';
import { createIntern, moveIntern, removeIntern } from '../api.js';
import { initials, attPct, nextInternId } from '../utils.js';
import Icon from '../icons.jsx';

export default function BatchManagement({ interns, setInterns, showToast }) {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const domains = useMemo(() => [...new Set(interns.map((i) => i.dept))], [interns]);
  const batchesForFilter = useMemo(
    () => [...new Set(interns.filter((i) => !domainFilter || i.dept === domainFilter).map((i) => i.batch))],
    [interns, domainFilter]
  );

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [i.id, i.name, i.dept, i.batch, i.mentor].join(' ').toLowerCase().includes(q);
    const matchDomain = !domainFilter || i.dept === domainFilter;
    const matchBatch = !batchFilter || i.batch === batchFilter;
    return matchSearch && matchDomain && matchBatch;
  });

  // Batch roster cards — one per Domain · Batch combination.
  const batchGroups = useMemo(() => {
    const groups = {};
    interns.forEach((i) => {
      const key = `${i.dept} · ${i.batch}`;
      if (!groups[key]) groups[key] = { dept: i.dept, batch: i.batch, students: [] };
      groups[key].students.push(i);
    });
    return Object.values(groups).sort((a, b) => a.dept.localeCompare(b.dept) || a.batch.localeCompare(b.batch));
  }, [interns]);

  async function handleAddStudent(details) {
    const newIntern = {
      id: nextInternId(interns),
      name: details.name,
      dept: details.dept,
      batch: details.batch,
      mentor: details.mentor || 'Unassigned',
      status: 'present',
      leaveType: '-',
      leaveDate: '',
      reason: '',
      workingDays: 60,
      present: 0,
      tasksTotal: 0,
      tasksDone: 0,
      assignTotal: 0,
      assignDone: 0,
      certGenerated: false,
      hoursLogged: 0,
      history: []
    };

    // Add to the shared roster immediately — this is the same `interns`
    // array read by Leave, Certificate, Attendance, Report, Task and
    // Analytics modules, so the new student appears in Attendance
    // Management's Domain/Batch/Intern dropdowns and tables right away.
    setInterns((prev) => [...prev, newIntern]);
    await createIntern(newIntern);
    showToast(`${details.name} added to ${details.batch} — now visible in Attendance Management`);
    setShowAdd(false);
  }

  async function handleMoveStudent(id, patch) {
    setInterns((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await moveIntern(id, patch);
    showToast('Student moved to the new batch');
    setMovingId(null);
  }

  async function handleRemoveStudent(intern) {
    if (!window.confirm(`Remove ${intern.name} (${intern.id}) from ${intern.batch}? This removes them from every module.`)) return;
    setInterns((prev) => prev.filter((i) => i.id !== intern.id));
    await removeIntern(intern.id);
    showToast(`${intern.name} removed from ${intern.batch}`);
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Batch Management</h1>
          <p>Add students to a domain and batch — they're instantly available across Attendance, Leave, Certificates, Tasks and Reports.</p>
        </div>
        <div className="head-actions">
          <button className="btn blue" onClick={() => setShowAdd(true)}>+ Add Student</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>👥</div></div>
          <div className="val">{interns.length}</div>
          <div className="lbl">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>🗂️</div></div>
          <div className="val">{batchGroups.length}</div>
          <div className="lbl">Active Batches</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>🏷️</div></div>
          <div className="val">{domains.length}</div>
          <div className="lbl">Domains</div>
        </div>
      </div>

      {/* BATCH ROSTER CARDS */}
      <div className="panel">
        <div className="panel-head"><h3>Batches</h3></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {batchGroups.map((g) => (
            <div key={`${g.dept}-${g.batch}`} className="stat-card">
              <div className="lbl" style={{ marginBottom: 6 }}>{g.dept}</div>
              <div className="val" style={{ fontSize: 17 }}>{g.batch}</div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: 'var(--muted)' }}>{g.students.length} student(s)</div>
              <div style={{ display: 'flex', marginTop: 10 }}>
                {g.students.slice(0, 5).map((s) => (
                  <div key={s.id} className="intern-ava" style={{ marginLeft: -8, border: '2px solid var(--card)' }} title={s.name}>{initials(s.name)}</div>
                ))}
                {g.students.length > 5 && (
                  <div className="intern-ava" style={{ marginLeft: -8, border: '2px solid var(--card)', background: 'var(--bg)', color: 'var(--muted)' }}>
                    +{g.students.length - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
          {batchGroups.length === 0 && <div className="empty-note">No batches yet — add your first student to create one.</div>}
        </div>
      </div>

      {/* STUDENT ROSTER TABLE */}
      <div className="panel">
        <div className="panel-head"><h3>Student Roster</h3></div>
        <div className="filters-row">
          <input type="text" placeholder="Search by name, ID, department, batch or mentor..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={domainFilter} onChange={(e) => { setDomainFilter(e.target.value); setBatchFilter(''); }}>
            <option value="">All Domains</option>
            {domains.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)}>
            <option value="">All Batches</option>
            {batchesForFilter.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>Student</th><th>Domain</th><th>Batch</th><th>Mentor</th><th>Attendance</th><th>Action</th></tr>
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
                  <td>
                    {movingId === i.id ? (
                      <MoveBatchSelect
                        intern={i}
                        domains={domains}
                        interns={interns}
                        onCancel={() => setMovingId(null)}
                        onMove={(patch) => handleMoveStudent(i.id, patch)}
                      />
                    ) : (
                      <span className="pill neutral">{i.batch}</span>
                    )}
                  </td>
                  <td>{i.mentor}</td>
                  <td>{attPct(i)}%</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {movingId !== i.id && (
                      <button className="link-btn" onClick={() => setMovingId(i.id)}>Move</button>
                    )}
                    <button className="link-btn" style={{ color: 'var(--red)' }} onClick={() => handleRemoveStudent(i)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="empty-note">No students match your search or filters.</div>}
      </div>

      <AddStudentModal show={showAdd} domains={domains} interns={interns} onCancel={() => setShowAdd(false)} onSave={handleAddStudent} />
    </section>
  );
}

function MoveBatchSelect({ intern, domains, interns, onCancel, onMove }) {
  const [dept, setDept] = useState(intern.dept);
  const [batch, setBatch] = useState(intern.batch);
  const [customBatch, setCustomBatch] = useState('');
  const batches = [...new Set(interns.filter((i) => i.dept === dept).map((i) => i.batch))];

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <select value={dept} onChange={(e) => setDept(e.target.value)} style={{ fontSize: 12, padding: '5px 8px' }}>
        {domains.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select
        value={batches.includes(batch) ? batch : '__custom'}
        onChange={(e) => setBatch(e.target.value === '__custom' ? '' : e.target.value)}
        style={{ fontSize: 12, padding: '5px 8px' }}
      >
        {batches.map((b) => <option key={b} value={b}>{b}</option>)}
        <option value="__custom">+ New batch…</option>
      </select>
      {!batches.includes(batch) && (
        <input
          type="text"
          placeholder="New batch name"
          value={customBatch}
          onChange={(e) => { setCustomBatch(e.target.value); setBatch(e.target.value); }}
          style={{ fontSize: 12, padding: '5px 8px', width: 100 }}
        />
      )}
      <button className="save-btn" style={{ padding: '5px 10px' }} onClick={() => batch.trim() && onMove({ dept, batch: batch.trim() })}>Save</button>
      <button className="link-btn" onClick={onCancel}>Cancel</button>
    </div>
  );
}

function AddStudentModal({ show, domains, interns, onCancel, onSave }) {
  const [name, setName] = useState('');
  const [dept, setDept] = useState(domains[0] || '');
  const [isNewDomain, setIsNewDomain] = useState(domains.length === 0);
  const [newDept, setNewDept] = useState('');
  const [batch, setBatch] = useState('');
  const [isNewBatch, setIsNewBatch] = useState(false);
  const [newBatch, setNewBatch] = useState('');
  const [mentor, setMentor] = useState('');
  const [error, setError] = useState('');

  const effectiveDept = isNewDomain ? newDept.trim() : dept;
  const batchesForDept = [...new Set(interns.filter((i) => i.dept === effectiveDept).map((i) => i.batch))];

  if (!show) return null;

  function resetAndClose() {
    setName(''); setDept(domains[0] || ''); setIsNewDomain(domains.length === 0); setNewDept('');
    setBatch(''); setIsNewBatch(false); setNewBatch(''); setMentor(''); setError('');
    onCancel();
  }

  function handleSubmit() {
    const finalDept = isNewDomain ? newDept.trim() : dept;
    const finalBatch = isNewBatch ? newBatch.trim() : batch;
    if (!name.trim()) return setError('Student name is required.');
    if (!finalDept) return setError('Select or enter a domain.');
    if (!finalBatch) return setError('Select or enter a batch.');
    setError('');
    onSave({ name: name.trim(), dept: finalDept, batch: finalBatch, mentor: mentor.trim() });
    setName(''); setBatch(''); setIsNewBatch(false); setNewBatch(''); setMentor('');
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Add Student to Batch</h3>
        <p className="msub">New students are added straight into the shared roster — they'll show up in Attendance Management immediately.</p>

        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label>Student Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aditi Rao" />
        </div>

        <div className="field">
          <label>Domain</label>
          {!isNewDomain && domains.length > 0 ? (
            <select value={dept} onChange={(e) => setDept(e.target.value)}>
              {domains.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          ) : (
            <input type="text" value={newDept} onChange={(e) => setNewDept(e.target.value)} placeholder="e.g. Machine Learning" />
          )}
          {domains.length > 0 && (
            <button type="button" className="link-btn" style={{ marginTop: 4, padding: '4px 0' }} onClick={() => setIsNewDomain((v) => !v)}>
              {isNewDomain ? 'Choose an existing domain instead' : '+ Add a new domain'}
            </button>
          )}
        </div>

        <div className="field">
          <label>Batch</label>
          {!isNewBatch && batchesForDept.length > 0 ? (
            <select value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">Select a batch</option>
              {batchesForDept.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          ) : (
            <input type="text" value={newBatch} onChange={(e) => setNewBatch(e.target.value)} placeholder="e.g. Batch D" />
          )}
          {batchesForDept.length > 0 && (
            <button type="button" className="link-btn" style={{ marginTop: 4, padding: '4px 0' }} onClick={() => setIsNewBatch((v) => !v)}>
              {isNewBatch ? 'Choose an existing batch instead' : '+ Add a new batch'}
            </button>
          )}
        </div>

        <div className="field">
          <label>Mentor (Optional)</label>
          <input type="text" value={mentor} onChange={(e) => setMentor(e.target.value)} placeholder="e.g. Yuvashree" />
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={resetAndClose}>Cancel</button>
          <button className="confirm" onClick={handleSubmit}>Add Student</button>
        </div>
      </div>
    </div>
  );
}
