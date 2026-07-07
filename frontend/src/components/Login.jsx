import { useState } from 'react';
import { login } from '../api.js';
import Icon from '../icons.jsx';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('Staff Member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your Staff/HR ID and password to continue.');
      return;
    }
    setError('');
    setLoading(true);
    const { user, live } = await login(email.trim(), password, role);
    setLoading(false);
    onLogin(user, live);
  }

  return (
    <div className="login-screen">
      <div className="login-wrap">
        <div className="login-visual">
          <div>
            <div className="brand-mark">
              <div className="logo-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
              IMS
            </div>
            <h1>Internship Academy<br /><span>Staff &amp; HR Portal</span></h1>
            <p>Manage intern attendance, leave records and certificate eligibility — built for staff and HR only.</p>
            <div className="login-tags">
              <span>Leave Management</span>
              <span>Certificate Eligibility</span>
              <span>Attendance Tracking</span>
              <span>Analytics</span>
            </div>
          </div>
          <div className="login-foot">Restricted access &middot; Staff / HR credentials required</div>
        </div>

        <div className="login-form">
          <h2>Staff Sign In</h2>
          <p className="sub">This portal is only for authorized staff members and HR managers.</p>

          <div className="role-toggle">
            <button type="button" className={role === 'Staff Member' ? 'active' : ''} onClick={() => setRole('Staff Member')}>Staff</button>
            <button type="button" className={role === 'HR Manager' ? 'active' : ''} onClick={() => setRole('HR Manager')}>HR Manager</button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Staff / HR ID or Email</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. anuj.sharma@imsacademy.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            </div>
            <div className="row-between">
              <label className="checkbox-row"><input type="checkbox" defaultChecked style={{ width: 'auto' }} /> Keep me signed in</label>
              <a href="#!">Forgot password?</a>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="login-notice">
            Access is limited to registered Staff and HR Manager accounts. Interns/students should use the separate Student Portal.
            This form calls <code>POST /api/auth/login</code> on your backend (see <code>src/api.js</code>) and falls back to a demo
            session if that endpoint isn't reachable yet.
          </div>
        </div>
      </div>
    </div>
  );
}
