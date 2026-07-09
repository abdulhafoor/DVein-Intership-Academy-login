import { useRef, useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import Icon from '../icons.jsx';
import { uploadAssessmentRecords, deleteAssessmentRecord } from '../api.js';

const ACCEPTED_EXT = ['.xlsx', '.xls'];

// Normalizes whatever column headers the mentor's spreadsheet happens to use
// (Name / Student Name / student_name, etc.) into the Assessment_Records shape
// described in the backend doc: student_name, assessment_name, marks, submitted_date.
function normalizeRow(row, index) {
  const get = (...keys) => {
    for (const k of keys) {
      const found = Object.keys(row).find((rk) => rk.trim().toLowerCase() === k);
      if (found && row[found] !== undefined && row[found] !== '') return row[found];
    }
    return '';
  };

  const rawDate = get('submitted_date', 'submitted date', 'date');
  let submittedDate = rawDate;
  if (rawDate instanceof Date) {
    submittedDate = rawDate.toISOString().slice(0, 10);
  } else if (typeof rawDate === 'number') {
    // Excel serial date fallback
    const parsed = XLSX.SSF ? XLSX.SSF.parse_date_code(rawDate) : null;
    submittedDate = parsed ? `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}` : '';
  }

  return {
    id: `tmp-${Date.now()}-${index}`,
    studentName: String(get('student_name', 'student name', 'name', 'intern name') || '').trim(),
    assessmentName: String(get('assessment_name', 'assessment name', 'assessment', 'title') || '').trim(),
    marks: Number(get('marks', 'score') || 0),
    submittedDate: submittedDate || new Date().toISOString().slice(0, 10)
  };
}

export default function AssessmentManagement({ showToast }) {
  const fileInputRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.studentName, r.assessmentName].join(' ').toLowerCase().includes(q)
    );
  }, [records, search]);

  const total = records.length;
  const avgMarks = total ? Math.round((records.reduce((s, r) => s + r.marks, 0) / total) * 10) / 10 : 0;
  const passCount = records.filter((r) => r.marks >= 40).length;

  function validExtension(file) {
    const name = file.name.toLowerCase();
    return ACCEPTED_EXT.some((ext) => name.endsWith(ext));
  }

  async function processFile(file) {
    if (!file) return;

    if (!validExtension(file)) {
      setStatus({ type: 'error', text: `"${file.name}" is not a valid Excel file. Please upload a .xlsx or .xls file.` });
      return;
    }

    setIsUploading(true);
    setStatus(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      if (!rows.length) {
        setStatus({ type: 'error', text: 'The uploaded file has no readable rows.' });
        setIsUploading(false);
        return;
      }

      const parsed = rows
        .map((row, idx) => normalizeRow(row, idx))
        .filter((r) => r.studentName);

      if (!parsed.length) {
        setStatus({
          type: 'error',
          text: 'Could not find student/assessment columns. Expected headers like "Student Name", "Assessment Name", "Marks", "Submitted Date".'
        });
        setIsUploading(false);
        return;
      }

      setRecords((prev) => [...parsed, ...prev]);
      const { live } = await uploadAssessmentRecords(file, parsed);
      setStatus({
        type: 'success',
        text: `${parsed.length} assessment record${parsed.length > 1 ? 's' : ''} uploaded from "${file.name}"${live ? '' : ' (saved locally — backend not connected)'}.`
      });
      showToast?.(`${parsed.length} records uploaded`);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', text: 'Failed to read the Excel file. Please check the file format and try again.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleFileInput(e) {
    processFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer.files[0]);
  }

  async function handleDelete(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    const { live } = await deleteAssessmentRecord(id);
    showToast?.(`Record removed${live ? '' : ' locally'}`);
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Assessment Management</h1>
          <p>Upload and manage assessment records for your interns using Excel files.</p>
        </div>
        <div className="head-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <button className="btn blue" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="upload" size={15} />
              {isUploading ? 'Uploading…' : 'Upload Excel'}
            </span>
          </button>
        </div>
      </div>

      <div className="cards-row">
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><Icon name="edit" /></div></div>
          <div className="val">{total}</div>
          <div className="lbl">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--green-light)', color: 'var(--green)' }}><Icon name="check" /></div></div>
          <div className="val">{passCount}</div>
          <div className="lbl">Passing (≥40 marks)</div>
        </div>
        <div className="stat-card">
          <div className="top"><div className="ic-box" style={{ background: 'var(--orange-light)', color: 'var(--orange)' }}><Icon name="trend" /></div></div>
          <div className="val">{avgMarks}</div>
          <div className="lbl">Average Marks</div>
        </div>
      </div>

      <div
        className={`upload-drop ${isDragOver ? 'drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="ic-box"><Icon name="upload" size={22} /></div>
        <h3>Drag &amp; drop an Excel file here</h3>
        <p>or click to browse — accepts .xlsx and .xls files</p>
        <p className="hint">Expected columns: Student Name, Assessment Name, Marks, Submitted Date</p>
      </div>

      {status && (
        <div className={`status-msg ${status.type}`}>
          {status.text}
        </div>
      )}

      <div className="panel">
        <div className="panel-head">
          <h3>Uploaded Records</h3>
        </div>
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by student or assessment name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assessment</th>
                <th>Marks</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.studentName}</td>
                  <td>{r.assessmentName}</td>
                  <td>
                    <span className={`pill ${r.marks >= 40 ? 'eligible' : 'noteligible'}`}>{r.marks}</span>
                  </td>
                  <td>{r.submittedDate}</td>
                  <td>
                    <button className="link-btn" style={{ color: 'var(--red)' }} onClick={() => handleDelete(r.id)}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Icon name="trash" size={13} /> Delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-note">
            {records.length === 0
              ? 'No assessment records yet — upload an Excel file to get started.'
              : 'No records match your search.'}
          </div>
        )}
      </div>
    </section>
  );
}
