import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ArrowLeft, RefreshCw } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [step, setStep] = useState(1); // 1 = Credentials & Captcha, 2 = OTP Verification
  const [email, setEmail] = useState('ankityadav100320@gmail.com');
  const [password, setPassword] = useState('Ankit@45678912');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaState, setCaptchaState] = useState('idle'); // 'idle', 'loading', 'verified'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('456789');
  const [timer, setTimer] = useState(30);
  const [otpSentMsg, setOtpSentMsg] = useState('');

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

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }
    if (captchaState !== 'verified') {
      setError('Please check "I\'m not a robot" to continue.');
      return;
    }
    setError('');
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setOtpSentMsg(`Security verification code sent to ${email}`);
    setOtp(['', '', '', '', '', '']);
    setStep(2);
    setTimer(30);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const fillDemoOtp = () => {
    if (generatedOtp && generatedOtp.length === 6) {
      setOtp(generatedOtp.split(''));
      setError('');
    }
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setTimer(30);
    setGeneratedOtp(randomOtp);
    setOtpSentMsg(`New OTP code sent to ${email}`);
    setOtp(['', '', '', '', '', '']);
    setError('');
  };

  const handleVerifyAndLogin = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    if (enteredOtp !== generatedOtp) {
      setError(`Invalid OTP code. Please enter ${generatedOtp} or click "Auto-Fill OTP".`);
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
      setError(err.response?.data?.message || 'Invalid officer credentials. Please try again.');
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  const fillOfficerDemo = () => {
    setEmail('ankityadav100320@gmail.com');
    setPassword('Ankit@45678912');
    setCaptchaState('idle');
    setError('');
  };

  const fillCitizenDemo = () => {
    setEmail('citizen@jansevax.in');
    setPassword('Citizen@123');
    setCaptchaState('idle');
    setError('');
  };

  const handleCaptchaClick = () => {
    if (captchaState !== 'idle') return;
    setCaptchaState('loading');
    setTimeout(() => {
      setCaptchaState('verified');
      setError('');
    }, 800);
  };

  return (
    <div className="auth-container">
      {/* BACKGROUND GLOWING ORBS */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Main Content Area */}
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
          {step === 1 ? (
            <>
              {/* Header Step 1 */}
              <div className="header">
                <h1>Account Login</h1>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Access Citizen Dashboard or Department Operations Console
                </p>
              </div>

              {successMsg && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
                  {successMsg}
                </div>
              )}

              {/* Quick Login Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button type="button" onClick={fillCitizenDemo} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '10px', color: '#166534', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                  👤 Citizen Demo Auto-Fill
                </button>
                <button type="button" onClick={fillOfficerDemo} style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '8px 14px', borderRadius: '10px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}>
                  🛡️ Officer Demo Auto-Fill
                </button>
              </div>

              {error && <div className="error-msg">{error}</div>}

              {/* Step 1 Form */}
              <form onSubmit={handleSendOtp}>
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

                {/* Captcha */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/90 border border-slate-200/90 mb-4 mt-2 h-[80px] shadow-sm">
                  <div className="flex items-center pl-2">
                    <div
                      onClick={handleCaptchaClick}
                      className={`w-8 h-8 mr-3 bg-white rounded flex items-center justify-center cursor-pointer transition-all shadow-sm ${captchaState === 'idle' ? 'border-2 border-slate-300 hover:border-slate-400' : 'border-0'}`}
                    >
                      {captchaState === 'loading' && (
                        <svg className="w-6 h-6 text-blue-600 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {captchaState === 'verified' && (
                        <svg className="w-7 h-7 text-green-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <label onClick={handleCaptchaClick} className="text-base text-slate-700 font-semibold cursor-pointer select-none">
                      &nbsp;
                      {captchaState === 'idle' && "I'm not a robot"}
                      {captchaState === 'loading' && <span className="text-blue-600">Verifying...</span>}
                      {captchaState === 'verified' && "I'm not a robot"}
                    </label>
                  </div>
                  <div className="flex flex-col items-center pt-1">
                    <svg className="w-8 h-8 mb-1" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#e2e8f0" />
                      <path d="M15.5 9a3.5 3.5 0 00-7 0v2h-1v5h9v-5h-1V9zm-5 0a2.5 2.5 0 015 0v2h-5V9z" fill="#0f172a" />
                    </svg>
                    <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">reCAPTCHA</span>
                  </div>
                </div>

                <button type="submit" className="btn-submit">
                  Send OTP Verification Code →
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Step 2: OTP Verification */}
              <div className="header" style={{ marginBottom: '1.25rem' }}>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3 text-rose-400">
                  <KeyRound size={24} />
                </div>
                <h1 style={{ fontSize: '1.5rem' }}>Enter OTP Code</h1>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                  6-digit security code sent to <br />
                  <strong className="text-rose-400">{email}</strong>
                </p>
              </div>

              {otpSentMsg && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', marginBottom: '14px' }}>
                  ✓ {otpSentMsg}
                </div>
              )}

              {/* Demo OTP Banner */}
              <div
                onClick={fillDemoOtp}
                style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '10px 14px', marginBottom: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                title="Click to auto-fill demo OTP"
              >
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '10px', color: '#4338ca', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>DEMO SECURITY OTP</span>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e1b4b', letterSpacing: '3px' }}>{generatedOtp.split('').join(' ')}</div>
                </div>
                <span style={{ fontSize: '11px', background: '#4f46e5', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                  Auto-Fill OTP
                </span>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleVerifyAndLogin}>
                {/* 6-Digit Input Boxes */}
                <div className="flex justify-between gap-2 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      style={{
                        width: '45px',
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '20px',
                        fontWeight: '800',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: digit ? '2px solid #e11d48' : '1px solid #cbd5e1',
                        color: '#0f172a',
                        outline: 'none',
                        boxShadow: digit ? '0 0 12px rgba(225, 29, 72, 0.25)' : 'none'
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mb-6 px-1">
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't receive code?"}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timer > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: timer > 0 ? '#6b7280' : '#fb7185',
                      fontWeight: '600',
                      fontSize: '12px',
                      cursor: timer > 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={13} /> Resend OTP
                  </button>
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Verifying OTP & Logging In...' : 'Verify OTP & Complete Login'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#9ca3af',
                    padding: '10px',
                    borderRadius: '12px',
                    marginTop: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowLeft size={15} /> Back to Credentials
                </button>
              </form>
            </>
          )}

          {/* Citizen Registration Link */}
          <p className="footer-text">
            Are you a Citizen? <Link to="/register">Create Citizen Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
