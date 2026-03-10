import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: theme.colors.surface,
        color: theme.colors.text,
        borderTop: `1px solid ${theme.colors.shadow}`,
      }}
    >
      <div className="footer-content">
        <p>© 2024 Mindful - A Safe Space for Your Thoughts</p>
        <p className="footer-subtitle">Take care of your mental wellness, one day at a time.</p>
      </div>
    </motion.footer>
  );
}

