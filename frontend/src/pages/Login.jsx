import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [successMsg, setSuccessMsg] = useState(location.state?.msg || '');

  useEffect(() => {
    if (location.state?.prefillEmail) {
      setEmail(location.state.prefillEmail);
    }
    if (location.state?.msg) {
      setSuccessMsg(location.state.msg);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      let targetRoute = user.role === 'ADMIN' ? '/admin' : user.role === 'DEPARTMENT_OFFICER' ? '/department' : '/dashboard';
      const stateRedirect = location.state?.redirectTo;
      if (stateRedirect && (
        (user.role === 'DEPARTMENT_OFFICER' && stateRedirect !== '/dashboard') ||
        (user.role === 'CITIZEN' && stateRedirect !== '/department' && stateRedirect !== '/admin') ||
        (user.role === 'ADMIN')
      )) {
        targetRoute = stateRedirect;
      }
      navigate(targetRoute, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-container">
      {/* BACKGROUND GLOWING ORBS */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Main Content Area: Centered Branding + Glass Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-8 text-center p-6 mx-auto">
        {/* Branding Centered Above Form */}
        <div className="mb-2 mt-4 flex flex-col items-center max-w-3xl">
          <Link to="/" className="flex flex-col items-center group mb-2 hover:opacity-95 transition-opacity" style={{ textDecoration: 'none' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 p-[2px] flex items-center justify-center shadow-xl shadow-rose-500/50 group-hover:scale-105 transition-transform mb-2 duration-300">
              <div className="w-full h-full bg-slate-950 backdrop-blur-md rounded-[14px] flex items-center justify-center">
                <svg className="w-8 h-8 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
            </div>
            <span className="text-slate-900 text-5xl sm:text-6xl font-black tracking-wider font-['Plus_Jakarta_Sans'] uppercase drop-shadow-[0_2px_10px_rgba(225,29,72,0.15)]">
              JansevaX
            </span>
          </Link>
        </div>

        {/* MAIN GLASS CONTAINER */}
        <div className="glass-card mb-8">
          <div className="header">
            <h1>Account Login</h1>
          </div>

          {successMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
              {successMsg}
            </div>
          )}

          {/* Quick Officer Demo Link */}
          <div className="demo-links" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <button type="button" onClick={() => fillDemoAccount('ankityadav100320@gmail.com', 'Ankit@45678912')} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '8px 16px', borderRadius: '10px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
              🛡️ Officer Demo Login
            </button>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {/* Direct Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="form-header">
                <label htmlFor="password">Password</label>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
