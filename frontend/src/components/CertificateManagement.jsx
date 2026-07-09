import { useState, useMemo } from 'react';
import { CertModal } from './Modals.jsx';
import { generateCertificate, exportReport } from '../api.js';
import { attPct, isEligible, eligReason, initials, progressColor } from '../utils.js';

export default function CertificateManagement({ interns, setInterns, showToast }) {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingCertId, setPendingCertId] = useState(null);

  const depts = useMemo(() => [...new Set(interns.map((i) => i.dept))], [interns]);

  const filtered = interns.filter((i) => {
    const q = search.toLowerCase();
    const matchSearch = !q || [i.id, i.name, i.dept, i.batch].join(' ').toLowerCase().includes(q);
    const matchDept = !dept || i.dept === dept;
    let matchStatus = true;
    if (statusFilter === 'eligible') matchStatus = isEligible(i);
    if (statusFilter === 'noteligible') matchStatus = !isEligible(i);
    if (statusFilter === 'generated') matchStatus = i.certGenerated;
    return matchSearch && matchDept && matchStatus;
  });

  const total = interns.length;
  const eligible = interns.filter(isEligible).length;
  const notEligible = interns.filter((i) => !isEligible(i)).length;
  const generated = interns.filter((i) => i.certGenerated).length;

  function updateIntern(id, patch) {
    setInterns((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function handleConfirmGenerate() {
    const intern = interns.find((i) => i.id === pendingCertId);
    updateIntern(pendingCertId, { certGenerated: true });
    await generateCertificate(pendingCertId);
    showToast(`Certificate generated for ${intern.name}`);
    setPendingCertId(null);
  }

  async function handleExport() {
    await exportReport('certificates', 'Excel');
    showToast('Certificate report exported as Excel');
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Certificate Management</h1>
          <p>Review eligibility criteria and generate certificates for qualifying interns.</p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={handleExport}>Export Excel</button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card"><div className="val">{total}</div><div className="lbl">Total Interns</div></div>
        <div className="stat-card"><div className="val" style={{ color: 'var(--green)' }}>{eligible}</div><div className="lbl">Eligible</div></div>
        <div className="stat-card"><div className="val" style={{ color: 'var(--red)' }}>{notEligible}</div><div className="lbl">Not Eligible</div></div>
        <div className="stat-card"><div className="val" style={{ color: 'var(--purple)' }}>{generated}</div><div className="lbl">Certificates Generated</div></div>
      </div>

      <div className="panel">
        <div className="panel-head"><h3>Eligibility Overview</h3></div>
        <div className="filters-row">
          <input type="text" placeholder="Search by name, ID, department or batch..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {depts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="eligible">Eligible</option>
            <option value="noteligible">Not Eligible</option>
            <option value="generated">Certificate Generated</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Intern</th><th>Department</th><th>Attendance</th><th>Tasks</th><th>Assignments</th><th>Eligibility</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => {
                const pct = attPct(i);
                const elig = isEligible(i);
                return (
                  <tr key={i.id}>
                    <td>
                      <div className="intern-cell">
                        <div className="intern-ava">{initials(i.name)}</div>
                        <div><div className="iname">{i.name}</div><div className="isub">{i.id} · {i.batch}</div></div>
                      </div>
                    </td>
                    <td>{i.dept}</td>
                    <td>
                      <span className="mini-bar"><div style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? 'var(--green)' : 'var(--red)' }}></div></span>
                      {pct}%
                    </td>
                    <td>
                      <span className="mini-bar"><div style={{ width: `${(i.tasksDone / i.tasksTotal) * 100}%`, background: progressColor(i.tasksDone, i.tasksTotal) }}></div></span>
                      {i.tasksDone}/{i.tasksTotal}
                    </td>
                    <td>
                      <span className="mini-bar"><div style={{ width: `${(i.assignDone / i.assignTotal) * 100}%`, background: progressColor(i.assignDone, i.assignTotal) }}></div></span>
                      {i.assignDone}/{i.assignTotal}
                    </td>
                    <td>
                      {elig
                        ? <span className="pill eligible">Eligible</span>
                        : <><span className="pill noteligible">Not Eligible</span><div className="reason-note">{eligReason(i)}</div></>}
                    </td>
                    <td>
                      {!elig && <button className="link-btn disabled" disabled title={eligReason(i)}>Not Eligible</button>}
                      {elig && i.certGenerated && <button className="link-btn" onClick={() => showToast(`Certificate downloaded for ${i.name}`)}>Download</button>}
                      {elig && !i.certGenerated && <button className="save-btn" onClick={() => setPendingCertId(i.id)}>Generate</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="empty-note">No interns match your search or filters.</div>}
      </div>

      <CertModal
        intern={interns.find((i) => i.id === pendingCertId)}
        onCancel={() => setPendingCertId(null)}
        onConfirm={handleConfirmGenerate}
      />
    </section>
  );
}
