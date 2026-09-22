import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      // Direct login redirect for instant smooth entry
      const target = user?.role === 'ADMIN' ? '/admin' : user?.role === 'DEPARTMENT_OFFICER' ? '/department' : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      
      {/* BACKGROUND GLOWING ORBS */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* Main Content Area: Centered Marketing Text + Glass Card */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-8 text-center p-6 mx-auto h-full overflow-y-auto" style={{ maxHeight: '100vh' }}>
        
        {/* Branding & Marketing Text Centered Above Form */}
        <div className="mb-2 mt-6 flex flex-col items-center max-w-3xl shrink-0">
           <Link to="/" className="flex flex-col items-center group mb-3 hover:opacity-95 transition-opacity" style={{textDecoration: 'none'}}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-600 p-[2.5px] flex items-center justify-center shadow-2xl shadow-rose-500/50 group-hover:scale-110 transition-transform mb-3 duration-300">
              <div className="w-full h-full bg-slate-950 backdrop-blur-md rounded-[21px] flex items-center justify-center">
                <svg className="w-10 h-10 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
            </div>
            <span className="text-slate-900 text-6xl sm:text-7xl font-black tracking-wider font-['Plus_Jakarta_Sans'] uppercase drop-shadow-[0_2px_10px_rgba(225,29,72,0.15)]">
              JansevaX
            </span>
          </Link>
        </div>

        {/* MAIN GLASS CONTAINER */}
        <div className="glass-card mb-8 shrink-0">
          
          {/* Header */}
          <div className="header">
            <h1>Citizen Registration</h1>
          </div>

          {error && <div className="error-msg">{error}</div>}

          {/* Register Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Name Field */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com" 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  name="password"
                  required 
                  value={formData.password}
                  onChange={handleChange}
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

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  name="confirmPassword"
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  className="toggle-pwd" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Button */}
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login Link */}
          <p className="footer-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
