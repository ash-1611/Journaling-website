import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import "./Sidebar.css";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "📊" },
  { path: "/journal", label: "Journal", icon: "📝" },
  { path: "/music", label: "Songs", icon: "🎵" },
  { path: "/yoga", label: "Yoga", icon: "🧘" },
  { path: "/exercise", label: "Exercises", icon: "💪" },
  { path: "/mood-tracker", label: "Mood Tracker", icon: "📈" },
  { path: "/ai-chat", label: "Mindi AI", icon: "🤖" },
  { path: "/ai-analytics", label: "AI Analytics", icon: "🧠" },
  { path: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  const storedName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'U';
  const userInitial = storedName.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Don't show sidebar on landing or auth pages
  const hideSidebarPaths = ["/", "/auth"];
  if (hideSidebarPaths.includes(location.pathname)) {
    return null;
  }

  const shouldShowSidebar = isMobileOpen || isDesktop;

  return (
    <>
      {/* Mobile Menu Button */}
      {!isDesktop && (
        <motion.button
          className="sidebar-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: theme.colors.surface,
            color: theme.colors.text,
            border: `2px solid ${theme.colors.primary}30`,
          }}
        >
          {isMobileOpen ? "✕" : "☰"}
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {shouldShowSidebar && (
          <motion.aside
            className="sidebar glass"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <div className="sidebar-header">
              <div className="sidebar-header-inner">
                <Link to="/" style={{ textDecoration: "none" }}>
                  <motion.div
                    className="sidebar-logo"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="logo-icon">🌿</span>
                    <span
                      className="logo-text"
                      style={{ color: theme.colors.text }}
                    >
                      Mindful
                    </span>
                  </motion.div>
                </Link>
                <motion.div
                  className="sidebar-avatar"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/settings')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="sidebar-avatar-circle">
                    <span className="sidebar-avatar-icon">{userInitial}</span>
                    <span className="sidebar-avatar-tooltip">Settings</span>
                  </div>
                </motion.div>
              </div>
            </div>

            <nav className="sidebar-nav">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      className={`sidebar-item ${isActive ? "active" : ""}`}
                      onClick={() => setIsMobileOpen(false)}
                      style={{
                        color: isActive ? theme.colors.primary : theme.colors.text,
                        background: isActive
                          ? `${theme.colors.primary}15`
                          : "transparent",
                      }}
                    >
                      <motion.span
                        className="sidebar-icon"
                        animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="sidebar-label">{item.label}</span>
                      {isActive && (
                        <motion.div
                          className="sidebar-indicator"
                          layoutId="sidebar-indicator"
                          style={{ background: theme.colors.primary }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="sidebar-footer">
              <Link
                to="/themes"
                className="sidebar-theme-link"
                style={{ color: theme.colors.textLight }}
              >
                <span>🎨</span>
                <span>Change Theme</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

