import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAuthenticated = Boolean(localStorage.getItem('isAuthenticated'));
  const storedName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'You';
  const initial =
    storedName && storedName.trim().length > 0 ? storedName.trim().charAt(0).toUpperCase() : 'U';
  const email = localStorage.getItem('userEmail') || 'user@example.com';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.nav-profile')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsMenuOpen(false);
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/journal', label: 'Journal' },
    { path: '/mood-tracker', label: 'Mood Tracker' },
    { path: '/music', label: 'Music' },
    { path: '/yoga', label: 'Yoga' },
    { path: '/exercise', label: 'Exercise' },
    { path: '/themes', label: 'Themes' },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: theme.colors.surface,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div className="navbar-container">
        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" style={{ color: theme.colors.primary, textDecoration: 'none' }}>
            <span className="logo-icon">🌿</span>
            <span className="logo-text">Mindful</span>
          </Link>
        </motion.div>

        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                style={{
                  color: location.pathname === item.path ? theme.colors.primary : theme.colors.text,
                }}
              >
                {item.label}
                {location.pathname === item.path && (
                  <motion.div
                    className="nav-indicator"
                    layoutId="navbar-indicator"
                    style={{ background: theme.colors.primary }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
          {!isAuthenticated && (
            <li>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/auth"
                  className={`nav-link auth-link ${location.pathname === '/auth' ? 'active' : ''}`}
                  style={{
                    background:
                      location.pathname === '/auth'
                        ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                        : 'transparent',
                    color: location.pathname === '/auth' ? 'white' : theme.colors.primary,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '25px',
                    border: `2px solid ${theme.colors.primary}`,
                  }}
                >
                  Login
                </Link>
              </motion.div>
            </li>
          )}
          {isAuthenticated && (
            <li>
              <div className="nav-profile">
                <button
                  type="button"
                  className="nav-avatar"
                  aria-label="Profile"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen((prev) => !prev);
                  }}
                >
                  <span className="nav-avatar-initial">{initial}</span>
                  <span className="nav-avatar-tooltip">Profile</span>
                </button>
                {isMenuOpen && (
                  <div
                    className="nav-profile-menu"
                    style={{
                      background: theme.colors.surface,
                      boxShadow: `0 10px 30px ${theme.colors.shadow}`,
                      borderColor: theme.colors.primary + '30',
                    }}
                  >
                    <div className="nav-profile-header">
                      <div className="nav-profile-avatar-small">
                        {initial}
                      </div>
                      <div className="nav-profile-text">
                        <span className="nav-profile-name">{storedName}</span>
                        <span className="nav-profile-email">{email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="nav-profile-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/dashboard');
                      }}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="nav-profile-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/settings');
                      }}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      className="nav-profile-item nav-profile-logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </li>
          )}
        </ul>
      </div>
    </motion.nav>
  );
}

