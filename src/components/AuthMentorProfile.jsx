import { useState, useEffect, useMemo } from 'react';
import Icon from '../icons.jsx';
import { fetchMentorProfile, updateMentorProfile, changePassword } from '../api.js';
import { initials, attPct, progressColor } from '../utils.js';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: 'user' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'interns', label: 'Assigned Interns', icon: 'list' }
];

const emptyProfile = { id: '', name: '', email: '', phone: '', designation: '', department: '', domain: '', bio: '', skills: [], joinDate: '' };
const emptyPwd = { current: '', next: '', confirm: '' };

export default function AuthMentorProfile({ user, setUser, interns, showToast }) {
  const isMentor = (user?.role || '') === 'Mentor';
  const [tab, setTab] = useState('profile');

  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState(emptyPwd);
  const [pwdVisible, setPwdVisible] = useState({ current: false, next: false, confirm: false });
  const [pwdError, setPwdError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchMentorProfile(user?.name).then(({ data }) => {
      if (!active) return;
      setProfile(data);
      setDraft(data);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user?.name]);

  const assignedInterns = useMemo(
    () => interns.filter((i) => i.mentor && profile.name && i.mentor.toLowerCase() === profile.name.toLowerCase()),
    [interns, profile.name]
  );

  function startEdit() {
    setDraft(profile);
    setSkillInput('');
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(profile);
    setSkillInput('');
    setAvatarPreview('');
    setEditing(false);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s) return;
    if (draft.skills.some((x) => x.toLowerCase() === s.toLowerCase())) { setSkillInput(''); return; }
    setDraft((d) => ({ ...d, skills: [...d.skills, s] }));
    setSkillInput('');
  }

  function removeSkill(skill) {
    setDraft((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }));
  }

  function handleAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    await updateMentorProfile(draft.id, draft);
    setProfile(draft);
    setUser?.((u) => (u ? { ...u, name: draft.name } : u));
    setSaving(false);
    setEditing(false);
    setAvatarPreview('');
    showToast(`Profile updated for ${draft.name}`);
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!pwd.current || !pwd.next || !pwd.confirm) return setPwdError('Please fill in all password fields.');
    if (pwd.next.length < 8) return setPwdError('New password must be at least 8 characters long.');
    if (pwd.next !== pwd.confirm) return setPwdError('New password and confirmation do not match.');
    setPwdError('');
    setPwdSaving(true);
    await changePassword({ currentPassword: pwd.current, newPassword: pwd.next });
    setPwdSaving(false);
    setPwd(emptyPwd);
    showToast('Password changed successfully');
  }

  if (loading) {
    return (
      <section className="view active">
        <div className="page-head"><div><h1>Auth &amp; Mentor Profile</h1><p>Loading your profile…</p></div></div>
      </section>
    );
  }

  return (
    <section className="view active">
      <div className="page-head">
        <div>
          <h1>Auth &amp; Mentor Profile</h1>
          <p>Manage your account security and {isMentor ? 'your mentor profile & assigned interns' : 'your profile details'}.</p>
        </div>
      </div>

      <div className="profile-tabs">
        {TABS.filter((t) => t.id !== 'interns' || isMentor).map((t) => (
          <button key={t.id} className={`profile-tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <Icon name={t.icon} size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="panel">
          <div className="profile-header">
            <div className="profile-avatar-lg" style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}>
              {!avatarPreview && initials(profile.name || 'M')}
              {editing && (
                <label className="avatar-edit-btn" title="Change photo">
                  <Icon name="camera" size={14} />
                  <input type="file" accept="image/*" hidden onChange={handleAvatarPick} />
                </label>
              )}
            </div>
            <div className="profile-header-info">
              <h2>{profile.name}</h2>
              <p>{profile.designation} &middot; {profile.department}</p>
              <span className="pill neutral">{user?.role || 'Mentor'}</span>
            </div>
            {!editing && (
              <button className="btn blue" onClick={startEdit}>Edit Profile</button>
            )}
          </div>

          <div className="info-grid">
            <div className="field">
              <label>Full Name</label>
              {editing
                ? <input type="text" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                : <div className="info-value"><Icon name="user" size={14} /> {profile.name || '—'}</div>}
            </div>
            <div className="field">
              <label>Email</label>
              {editing
                ? <input type="email" value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} />
                : <div className="info-value"><Icon name="mail" size={14} /> {profile.email || '—'}</div>}
            </div>
            <div className="field">
              <label>Phone</label>
              {editing
                ? <input type="text" value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} />
                : <div className="info-value"><Icon name="phone" size={14} /> {profile.phone || '—'}</div>}
            </div>
            <div className="field">
              <label>Designation</label>
              {editing
                ? <input type="text" value={draft.designation} onChange={(e) => setDraft((d) => ({ ...d, designation: e.target.value }))} />
                : <div className="info-value">{profile.designation || '—'}</div>}
            </div>
            <div className="field">
              <label>Department / Domain</label>
              {editing
                ? <input type="text" value={draft.department} onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value, domain: e.target.value }))} />
                : <div className="info-value">{profile.department || '—'}</div>}
            </div>
            <div className="field">
              <label>Joined</label>
              <div className="info-value">{profile.joinDate || '—'}</div>
            </div>
          </div>

          <div className="field">
            <label>Bio / About</label>
            {editing
              ? <textarea rows={3} value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} placeholder="A short bio about your role and experience" />
              : <div className="info-value bio-text">{profile.bio || 'No bio added yet.'}</div>}
          </div>

          <div className="field">
            <label>Skills &amp; Expertise</label>
            <div className="skills-row">
              {(editing ? draft.skills : profile.skills).map((s) => (
                <span key={s} className="chip">
                  {s}
                  {editing && <button type="button" onClick={() => removeSkill(s)}><Icon name="x" size={11} /></button>}
                </span>
              ))}
              {(!editing && profile.skills.length === 0) && <span className="isub">No skills added yet.</span>}
            </div>
            {editing && (
              <div className="chip-input">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Type a skill and press Enter"
                />
                <button type="button" className="btn" onClick={addSkill}>Add</button>
              </div>
            )}
          </div>

          {editing && (
            <div className="modal-actions" style={{ maxWidth: 320, marginTop: 8 }}>
              <button className="cancel" onClick={cancelEdit} disabled={saving}>Cancel</button>
              <button className="confirm" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Update Profile'}</button>
            </div>
          )}
        </div>
      )}

      {tab === 'security' && (
        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-head"><h3>Change Password</h3></div>
          {pwdError && <div className="login-error">{pwdError}</div>}
          <form onSubmit={handlePasswordChange}>
            {[
              { key: 'current', label: 'Current Password' },
              { key: 'next', label: 'New Password' },
              { key: 'confirm', label: 'Confirm New Password' }
            ].map(({ key, label }) => (
              <div className="field" key={key}>
                <label>{label}</label>
                <div className="pwd-field">
                  <input
                    type={pwdVisible[key] ? 'text' : 'password'}
                    value={pwd[key]}
                    onChange={(e) => setPwd((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={label}
                  />
                  <button type="button" className="pwd-toggle" tabIndex={-1} onClick={() => setPwdVisible((v) => ({ ...v, [key]: !v[key] }))}>
                    <Icon name={pwdVisible[key] ? 'eyeOff' : 'eye'} size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" className="btn blue" style={{ width: '100%' }} disabled={pwdSaving}>
              {pwdSaving ? 'Updating…' : 'Update Password'}
            </button>
          </form>
          <div className="login-notice" style={{ marginTop: 18 }}>
            Calls <code>POST /api/auth/change-password</code> on your backend (see <code>src/api.js</code>); falls back to a
            simulated update in demo mode if the backend isn&rsquo;t reachable yet.
          </div>
        </div>
      )}

      {tab === 'interns' && isMentor && (
        <div className="panel">
          <div className="panel-head"><h3>Interns Assigned to {profile.name}</h3></div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Intern</th><th>Department</th><th>Batch</th><th>Status</th><th>Attendance</th><th>Tasks</th></tr>
              </thead>
              <tbody>
                {assignedInterns.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <div className="intern-cell">
                        <div className="intern-ava">{initials(i.name)}</div>
                        <div><div className="iname">{i.name}</div><div className="isub">{i.id}</div></div>
                      </div>
                    </td>
                    <td>{i.dept}</td>
                    <td>{i.batch}</td>
                    <td><span className={`pill ${i.status}`}>{i.status}</span></td>
                    <td>{attPct(i)}%</td>
                    <td>
                      <span className="mini-bar"><div style={{ width: `${(i.tasksDone / i.tasksTotal) * 100}%`, background: progressColor(i.tasksDone, i.tasksTotal) }} /></span>
                      {i.tasksDone}/{i.tasksTotal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {assignedInterns.length === 0 && <div className="empty-note">No interns are currently assigned to you.</div>}
        </div>
      )}
    </section>
  );
}
