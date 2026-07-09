import { useState, useEffect } from 'react';

export function LeaveModal({ intern, onCancel, onSave }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('Casual Leave');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (intern) {
      setDate(new Date().toISOString().slice(0, 10));
      setType(
        intern.leaveType && intern.leaveType !== '-'
          ? intern.leaveType
          : 'Casual Leave'
      );
      setReason(intern.reason || '');
      setRemarks('');
    }
  }, [intern]);

  if (!intern) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Leave Details</h3>
        <p className="msub">Recording leave for {intern.name} ({intern.id})</p>

        <div className="field">
          <label>Leave Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label>Leave Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Emergency Leave">Emergency Leave</option>
            <option value="Personal Leave">Personal Leave</option>
            <option value="Sick Leave">Sick Leave</option>
          </select>
        </div>
        <div className="field">
          <label>Reason</label>
          <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason for leave" />
        </div>
        <div className="field">
          <label>Mentor Remarks (Optional)</label>
          <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Any additional remarks" />
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm" onClick={() => onSave({ date, type, reason, remarks })}>Save Leave</button>
        </div>
      </div>
    </div>
  );
}

export function TaskModal({ show, interns, onCancel, onSave }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(todayStr);
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setTitle('');
      setDescription('');
      setSelectedIds([]);
      setStartDate(todayStr);
      setDueDate(todayStr);
      setPriority('Medium');
      setError('');
    }
  }, [show]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!show) return null;

  function toggleIntern(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSave() {
    if (!title.trim()) return setError('Task title is required.');
    if (selectedIds.length === 0) return setError('Select at least one student to assign this task to.');
    if (new Date(dueDate) < new Date(startDate)) return setError('Due date cannot be before the start date.');
    setError('');
    onSave({ title: title.trim(), description: description.trim(), internIds: selectedIds, startDate, dueDate, priority });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <h3>Create Task</h3>
        <p className="msub">Define the task, then assign it to one or more students.</p>

        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label>Task Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Build responsive landing page" />
        </div>
        <div className="field">
          <label>Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the task" />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Task Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
        <div className="field">
          <label>Assign to Students</label>
          <div className="assignee-list">
            {interns.map((i) => (
              <label key={i.id} className="assignee-row">
                <input type="checkbox" checked={selectedIds.includes(i.id)} onChange={() => toggleIntern(i.id)} />
                <span>{i.name}</span>
                <span className="isub">{i.id} · {i.dept}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm" onClick={handleSave}>Create &amp; Assign</button>
        </div>
      </div>
    </div>
  );
}

export function CertModal({ intern, onCancel, onConfirm }) {
  if (!intern) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Generate Certificate</h3>
        <p className="msub">Confirm certificate generation for {intern.name} ({intern.id})?</p>
        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm" onClick={onConfirm}>Generate</button>
        </div>
      </div>
    </div>
  );
}
