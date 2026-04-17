import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';
import axios from 'axios';

const FEATURES = [
  { icon: '📝', label: 'Smart Journal',    desc: 'Write & decorate with stickers' },
  { icon: '📊', label: 'Mood Tracker',     desc: 'Visualise your emotional patterns' },
  { icon: '🎵', label: 'Curated Music',    desc: 'Playlists for every state of mind' },
  { icon: '🧘', label: 'Yoga & Exercise',  desc: 'Guided sessions with timers' },
];

export default function Auth() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab,    setActiveTab]    = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);

  const API_BASE_URL = 'http://localhost:5001';

  const [loginForm,   setLoginForm]   = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});

  const [signupForm,   setSignupForm]   = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [signupErrors, setSignupErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateLogin = () => {
    const errors = {};
    if (!loginForm.email)                     errors.email    = 'Email is required';
    else if (!validateEmail(loginForm.email)) errors.email    = 'Please enter a valid email';
    if (!loginForm.password)                  errors.password = 'Password is required';
    else if (loginForm.password.length < 6)   errors.password = 'Password must be at least 6 characters';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupForm.fullName.trim())                      errors.fullName        = 'Full name is required';
    if (!signupForm.email)                                errors.email           = 'Email is required';
    else if (!validateEmail(signupForm.email))            errors.email           = 'Please enter a valid email';
    if (!signupForm.password)                             errors.password        = 'Password is required';
    else if (signupForm.password.length < 6)              errors.password        = 'Password must be at least 6 characters';
    if (signupForm.password !== signupForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginForm.email, password: loginForm.password,
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', res.data.email);
      localStorage.setItem('userName',  res.data.name);
      localStorage.setItem('token',     res.data.token);
      if (res.data._id) localStorage.setItem('userId', res.data._id);
      navigate('/dashboard');
    } catch {
      setLoginErrors({ general: 'Invalid email or password. Please try again.' });
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: signupForm.fullName, email: signupForm.email, password: signupForm.password,
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', res.data.email);
      localStorage.setItem('userName',  res.data.name);
      localStorage.setItem('token',     res.data.token);
      if (res.data._id) localStorage.setItem('userId', res.data._id);
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch {
      setSignupErrors({ general: 'Signup failed. That email may already be in use.' });
    }
    setIsSubmitting(false);
  };

  const handleChange = (formType, field, value) => {
    if (formType === 'login') {
      setLoginForm(f => ({ ...f, [field]: value }));
      if (loginErrors[field])  setLoginErrors(e => ({ ...e, [field]: '' }));
    } else {
      setSignupForm(f => ({ ...f, [field]: value }));
      if (signupErrors[field]) setSignupErrors(e => ({ ...e, [field]: '' }));
    }
  };

  const inputStyle = (err) => ({
    background:   `${theme.colors.primary}0a`,
    color:        theme.colors.text,
    border:       `2px solid ${err ? '#FF6B6B' : theme.colors.primary + '35'}`,
  });

  return (
    <div className="auth-page" style={{ background: theme.colors.background }}>
      <div className="auth-split">

        {/* ── Left panel (branding + feature list) ── */}
        <motion.div
          className="auth-left"
          style={{ background: `linear-gradient(145deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Floating blobs */}
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />

          <div className="auth-left-content">
            <Link to="/" className="auth-brand">
              <span className="auth-brand-icon">🌿</span>
              <span className="auth-brand-name">Mindful</span>
            </Link>

            <motion.h2
              className="auth-left-headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Your complete mental wellness companion
            </motion.h2>

            <div className="auth-features-list">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  className="auth-feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <span className="auth-feature-icon">{f.icon}</span>
                  <div>
                    <span className="auth-feature-label">{f.label}</span>
                    <span className="auth-feature-desc">{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              className="auth-left-quote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              "Taking care of your mental health is an act of self-love."
            </motion.p>
          </div>
        </motion.div>

        {/* ── Right panel (form) ── */}
        <motion.div
          className="auth-right"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="auth-card glass" style={{ background: theme.colors.surface, boxShadow: `0 20px 60px ${theme.colors.shadow}` }}>

            {/* Tabs */}
            <div className="auth-tabs">
              {['login', 'signup'].map(tab => (
                <motion.button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  style={{
                    color:       activeTab === tab ? theme.colors.primary : theme.colors.textLight,
                    borderBottom:`3px solid ${activeTab === tab ? theme.colors.primary : 'transparent'}`,
                  }}
                >
                  {tab === 'login' ? 'Login' : 'Sign Up'}
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── LOGIN FORM ── */}
              {activeTab === 'login' && (
                <motion.form
                  key="login"
                  className="auth-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.28 }}
                  onSubmit={handleLogin}
                >
                  <div className="auth-form-header">
                    <h2 style={{ color: theme.colors.text }}>Welcome back 👋</h2>
                    <p style={{ color: theme.colors.textLight }}>Sign in to continue your wellness journey.</p>
                  </div>

                  {loginErrors.general && (
                    <div className="auth-error-banner">{loginErrors.general}</div>
                  )}

                  <div className="form-group">
                    <label style={{ color: theme.colors.textLight }}>Email Address</label>
                    <input
                      type="email" placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={e => handleChange('login', 'email', e.target.value)}
                      className={`form-input ${loginErrors.email ? 'error' : ''}`}
                      style={inputStyle(loginErrors.email)}
                    />
                    {loginErrors.email && <span className="error-message">{loginErrors.email}</span>}
                  </div>

                  <div className="form-group">
                    <div className="form-label-row">
                      <label style={{ color: theme.colors.textLight }}>Password</label>
                    </div>
                    <input
                      type="password" placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={e => handleChange('login', 'password', e.target.value)}
                      className={`form-input ${loginErrors.password ? 'error' : ''}`}
                      style={inputStyle(loginErrors.password)}
                    />
                    {loginErrors.password && <span className="error-message">{loginErrors.password}</span>}
                  </div>

                  <motion.button
                    type="submit" className="auth-button"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    style={{
                      background: isSubmitting ? `${theme.colors.primary}60` : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      boxShadow: !isSubmitting ? `0 10px 30px ${theme.colors.primary}40` : 'none',
                    }}
                  >
                    {isSubmitting ? '⏳ Logging in…' : '🚀 Login'}
                  </motion.button>

                  <p className="auth-switch-text" style={{ color: theme.colors.textLight }}>
                    Don't have an account?{' '}
                    <button type="button" className="auth-switch-btn" style={{ color: theme.colors.primary }} onClick={() => setActiveTab('signup')}>
                      Sign up free
                    </button>
                  </p>
                </motion.form>
              )}

              {/* ── SIGNUP FORM ── */}
              {activeTab === 'signup' && (
                <motion.form
                  key="signup"
                  className="auth-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28 }}
                  onSubmit={handleSignup}
                >
                  <div className="auth-form-header">
                    <h2 style={{ color: theme.colors.text }}>Create your account ✨</h2>
                    <p style={{ color: theme.colors.textLight }}>Free forever. Start your wellness journey today.</p>
                  </div>

                  {signupErrors.general && (
                    <div className="auth-error-banner">{signupErrors.general}</div>
                  )}

                  <div className="form-group">
                    <label style={{ color: theme.colors.textLight }}>Full Name</label>
                    <input
                      type="text" placeholder="Your name"
                      value={signupForm.fullName}
                      onChange={e => handleChange('signup', 'fullName', e.target.value)}
                      className={`form-input ${signupErrors.fullName ? 'error' : ''}`}
                      style={inputStyle(signupErrors.fullName)}
                    />
                    {signupErrors.fullName && <span className="error-message">{signupErrors.fullName}</span>}
                  </div>

                  <div className="form-group">
                    <label style={{ color: theme.colors.textLight }}>Email Address</label>
                    <input
                      type="email" placeholder="you@example.com"
                      value={signupForm.email}
                      onChange={e => handleChange('signup', 'email', e.target.value)}
                      className={`form-input ${signupErrors.email ? 'error' : ''}`}
                      style={inputStyle(signupErrors.email)}
                    />
                    {signupErrors.email && <span className="error-message">{signupErrors.email}</span>}
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label style={{ color: theme.colors.textLight }}>Password</label>
                      <input
                        type="password" placeholder="Min 6 characters"
                        value={signupForm.password}
                        onChange={e => handleChange('signup', 'password', e.target.value)}
                        className={`form-input ${signupErrors.password ? 'error' : ''}`}
                        style={inputStyle(signupErrors.password)}
                      />
                      {signupErrors.password && <span className="error-message">{signupErrors.password}</span>}
                    </div>

                    <div className="form-group">
                      <label style={{ color: theme.colors.textLight }}>Confirm Password</label>
                      <input
                        type="password" placeholder="Repeat password"
                        value={signupForm.confirmPassword}
                        onChange={e => handleChange('signup', 'confirmPassword', e.target.value)}
                        className={`form-input ${signupErrors.confirmPassword ? 'error' : ''}`}
                        style={inputStyle(signupErrors.confirmPassword)}
                      />
                      {signupErrors.confirmPassword && <span className="error-message">{signupErrors.confirmPassword}</span>}
                    </div>
                  </div>

                  <motion.button
                    type="submit" className="auth-button"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    style={{
                      background: isSubmitting ? `${theme.colors.primary}60` : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                      boxShadow: !isSubmitting ? `0 10px 30px ${theme.colors.primary}40` : 'none',
                    }}
                  >
                    {isSubmitting ? '⏳ Creating account…' : '✨ Create Account'}
                  </motion.button>

                  <p className="auth-switch-text" style={{ color: theme.colors.textLight }}>
                    Already have an account?{' '}
                    <button type="button" className="auth-switch-btn" style={{ color: theme.colors.primary }} onClick={() => setActiveTab('login')}>
                      Log in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Success overlay */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  className="success-overlay"
                  style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="success-check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
                  >✓</motion.div>
                  <h3>Account created!</h3>
                  <p>Redirecting to your dashboard…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

