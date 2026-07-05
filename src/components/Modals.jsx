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
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
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
          <label>Staff Remarks (Optional)</label>
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
