import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Auth.css';
import axios from 'axios';

export default function Auth() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const API_BASE_URL = 'http://localhost:5001';

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [loginErrors, setLoginErrors] = useState({});

  // Sign up form state
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [signupErrors, setSignupErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateLogin = () => {
    const errors = {};
    if (!loginForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!loginForm.password) {
      errors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignup = () => {
    const errors = {};
    if (!signupForm.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (signupForm.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }
    if (!signupForm.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(signupForm.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!signupForm.password) {
      errors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!signupForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (signupForm.password !== signupForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: loginForm.email,
        password: loginForm.password,
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', res.data.email);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('token', res.data.token);
      setIsSubmitting(false);
      navigate('/journal');
    } catch (err) {
      setIsSubmitting(false);
      setLoginErrors({ general: 'Login failed. Please check your credentials.' });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
      });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', res.data.email);
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('token', res.data.token);
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/journal');
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setSignupErrors({ general: 'Signup failed. Please try again.' });
    }
  };

  const handleInputChange = (formType, field, value) => {
    if (formType === 'login') {
      setLoginForm({ ...loginForm, [field]: value });
      // Clear error when user starts typing
      if (loginErrors[field]) {
        setLoginErrors({ ...loginErrors, [field]: '' });
      }
    } else {
      setSignupForm({ ...signupForm, [field]: value });
      // Clear error when user starts typing
      if (signupErrors[field]) {
        setSignupErrors({ ...signupErrors, [field]: '' });
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="auth-page">
      <Navbar />
      
      <motion.div
        className="auth-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="auth-card glass"
          variants={itemVariants}
          style={{
            background: theme.colors.surface,
            boxShadow: `0 8px 32px ${theme.colors.shadow}`,
          }}
        >
          {/* Tab Switcher */}
          <div className="auth-tabs">
            <motion.button
              className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                color: activeTab === 'login' ? theme.colors.primary : theme.colors.textLight,
                borderBottom: activeTab === 'login' ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
              }}
            >
              Login
            </motion.button>
            <motion.button
              className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => setActiveTab('signup')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                color: activeTab === 'signup' ? theme.colors.primary : theme.colors.textLight,
                borderBottom: activeTab === 'signup' ? `3px solid ${theme.colors.primary}` : '3px solid transparent',
              }}
            >
              Sign Up
            </motion.button>
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.form
                key="login"
                className="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
              >
                <div className="form-group">
                  <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                    Email Address
                  </label>
                  <motion.input
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => handleInputChange('login', 'email', e.target.value)}
                    className={`form-input ${loginErrors.email ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${loginErrors.email ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: loginErrors.email ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${loginErrors.email ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {loginErrors.email && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {loginErrors.email}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <div className="form-label-row">
                    <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="forgot-link"
                      style={{ color: theme.colors.primary }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <motion.input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => handleInputChange('login', 'password', e.target.value)}
                    className={`form-input ${loginErrors.password ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${loginErrors.password ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: loginErrors.password ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${loginErrors.password ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {loginErrors.password && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {loginErrors.password}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  style={{
                    background: isSubmitting
                      ? theme.colors.textLight + '40'
                      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: 'white',
                    boxShadow: !isSubmitting ? `0 10px 30px ${theme.colors.shadow}` : 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Logging in...
                    </motion.span>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                className="auth-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSignup}
              >
                <div className="form-group">
                  <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                    Full Name
                  </label>
                  <motion.input
                    type="text"
                    placeholder="John Doe"
                    value={signupForm.fullName}
                    onChange={(e) => handleInputChange('signup', 'fullName', e.target.value)}
                    className={`form-input ${signupErrors.fullName ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${signupErrors.fullName ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: signupErrors.fullName ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${signupErrors.fullName ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {signupErrors.fullName && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {signupErrors.fullName}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                    Email Address
                  </label>
                  <motion.input
                    type="email"
                    placeholder="you@example.com"
                    value={signupForm.email}
                    onChange={(e) => handleInputChange('signup', 'email', e.target.value)}
                    className={`form-input ${signupErrors.email ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${signupErrors.email ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: signupErrors.email ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${signupErrors.email ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {signupErrors.email && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {signupErrors.email}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                    Password
                  </label>
                  <motion.input
                    type="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={(e) => handleInputChange('signup', 'password', e.target.value)}
                    className={`form-input ${signupErrors.password ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${signupErrors.password ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: signupErrors.password ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${signupErrors.password ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {signupErrors.password && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {signupErrors.password}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="form-group">
                  <label style={{ color: theme.colors.text, fontWeight: 500 }}>
                    Confirm Password
                  </label>
                  <motion.input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => handleInputChange('signup', 'confirmPassword', e.target.value)}
                    className={`form-input ${signupErrors.confirmPassword ? 'error' : ''}`}
                    style={{
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      border: `2px solid ${signupErrors.confirmPassword ? '#FF6B6B' : theme.colors.primary + '30'}`,
                    }}
                    whileFocus={{
                      borderColor: signupErrors.confirmPassword ? '#FF6B6B' : theme.colors.primary,
                      boxShadow: `0 0 0 3px ${signupErrors.confirmPassword ? '#FF6B6B20' : theme.colors.primary + '20'}`,
                    }}
                  />
                  <AnimatePresence>
                    {signupErrors.confirmPassword && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {signupErrors.confirmPassword}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  style={{
                    background: isSubmitting
                      ? theme.colors.textLight + '40'
                      : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                    color: 'white',
                    boxShadow: !isSubmitting ? `0 10px 30px ${theme.colors.shadow}` : 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Creating account...
                    </motion.span>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="success-message"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  color: 'white',
                }}
              >
                <motion.span
                  className="success-icon"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  ✓
                </motion.span>
                Account created successfully! Redirecting...
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}

