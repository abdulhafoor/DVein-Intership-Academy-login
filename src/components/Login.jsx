import { useState } from 'react';
import { login, requestPasswordReset } from '../api.js';
import Icon from '../icons.jsx';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('Mentor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetSending, setResetSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your Mentor/HR ID and password to continue.');
      return;
    }
    setError('');
    setLoading(true);
    const { user, live } = await login(email.trim(), password, role);
    setLoading(false);
    onLogin(user, live);
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSending(true);
    const { data } = await requestPasswordReset(resetEmail.trim());
    setResetSending(false);
    setResetMsg(data?.message || 'If an account exists for this email, a reset link has been sent.');
  }

  function closeForgot() {
    setShowForgot(false);
    setResetEmail('');
    setResetMsg('');
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
            <h1>Internship Academy<br /><span>Mentor &amp; HR Portal</span></h1>
            <p>Manage intern attendance, leave records and certificate eligibility — built for mentors and HR only.</p>
<<<<<<< HEAD
=======
            <div className="login-tags">
              <span>Leave Management</span>
              <span>Certificate Eligibility</span>
              <span>Attendance Tracking</span>
              <span>Analytics</span>
            </div>
>>>>>>> 2bed59f0a2e1a836182c496e47b4c8ad49cacfe9
          </div>
          <div className="login-foot">Restricted access &middot; Mentor / HR credentials required</div>
        </div>

        <div className="login-form">
          <h2>Sign In</h2>
          <p className="sub">This portal is only for authorized mentors and HR managers.</p>

          <div className="role-toggle">
            <button type="button" className={role === 'Mentor' ? 'active' : ''} onClick={() => setRole('Mentor')}>Mentor</button>
            <button type="button" className={role === 'HR Manager' ? 'active' : ''} onClick={() => setRole('HR Manager')}>HR Manager</button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Mentor / HR ID or Email</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. anuj.sharma@imsacademy.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <div className="pwd-field">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                <button type="button" className="pwd-toggle" onClick={() => setShowPassword((s) => !s)} tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
                </button>
              </div>
            </div>
            <div className="row-between">
              <label className="checkbox-row"><input type="checkbox" defaultChecked style={{ width: 'auto' }} /> Keep me signed in</label>
              <a href="#!" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>Forgot password?</a>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="login-notice">
            Access is limited to registered Mentor and HR Manager accounts. Interns/students should use the separate Student Portal.
            This form calls <code>POST /api/auth/login</code> on your backend (see <code>src/api.js</code>) and falls back to a demo
            session if that endpoint isn't reachable yet.
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Reset your password</h3>
            <p className="msub">Enter your account email and we&rsquo;ll send you a password reset link.</p>

            {resetMsg ? (
              <>
                <div className="status-msg success">{resetMsg}</div>
                <div className="modal-actions">
                  <button className="confirm" onClick={closeForgot}>Done</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="field">
                  <label>Email</label>
                  <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@imsacademy.com" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel" onClick={closeForgot}>Cancel</button>
                  <button type="submit" className="confirm" disabled={resetSending}>
                    {resetSending ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
