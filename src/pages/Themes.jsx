import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, themes } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import './Themes.css';

export default function Themes() {
  const { currentTheme, changeTheme, theme } = useTheme();

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

  const handleThemeChange = (themeName) => {
    changeTheme(themeName);
  };

  return (
    <div className="themes-page page-with-sidebar">
      <Navbar />
      <Sidebar />
      
      <motion.div
        className="themes-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="themes-header"
          variants={itemVariants}
        >
          <h1 style={{ color: theme.colors.text }}>Choose Your Theme</h1>
          <p style={{ color: theme.colors.textLight }}>
            Select a theme that resonates with your mood and creates a peaceful space for your thoughts
          </p>
        </motion.div>

        <div className="themes-grid">
          {Object.entries(themes).map(([key, themeOption], index) => {
            const isActive = currentTheme === key;
            
            return (
              <motion.div
                key={key}
                className={`theme-card ${isActive ? 'active' : ''}`}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleThemeChange(key)}
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${themeOption.colors.primary}, ${themeOption.colors.accent})`
                    : theme.colors.surface,
                  boxShadow: isActive
                    ? `0 15px 40px ${themeOption.colors.shadow}`
                    : `0 8px 32px ${theme.colors.shadow}`,
                  border: `3px solid ${isActive ? themeOption.colors.accent : theme.colors.primary + '30'}`,
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  className="theme-emoji"
                  animate={isActive ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {themeOption.emoji}
                </motion.div>
                
                <h2
                  style={{
                    color: isActive ? 'white' : theme.colors.text,
                    marginTop: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {themeOption.name}
                </h2>
                
                <p
                  style={{
                    color: isActive ? 'rgba(255, 255, 255, 0.9)' : theme.colors.textLight,
                    fontSize: '0.9rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  {key === 'calmBlue' && 'A serene ocean of tranquility'}
                  {key === 'softLavender' && 'Gentle blooms of peace'}
                  {key === 'forestGreen' && 'Nature\'s calming embrace'}
                  {key === 'darkNight' && 'A peaceful midnight sanctuary'}
                </p>

                {/* Color Preview */}
                <div className="theme-colors-preview">
                  <div
                    className="color-dot"
                    style={{ background: themeOption.colors.primary }}
                  />
                  <div
                    className="color-dot"
                    style={{ background: themeOption.colors.secondary }}
                  />
                  <div
                    className="color-dot"
                    style={{ background: themeOption.colors.accent }}
                  />
                </div>

                {isActive && (
                  <motion.div
                    className="active-indicator"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <span>✓ Active</span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Theme Preview Section */}
        <motion.div
          className="theme-preview-section glass"
          variants={itemVariants}
          style={{
            background: theme.colors.surface,
            boxShadow: `0 8px 32px ${theme.colors.shadow}`,
          }}
        >
          <h2 style={{ color: theme.colors.text, marginBottom: '1.5rem' }}>
            Preview
          </h2>
          <div className="preview-content">
            <div
              className="preview-card"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: 'white',
              }}
            >
              <div className="preview-icon">🌿</div>
              <h3>Sample Card</h3>
              <p>This is how your content will look with the current theme.</p>
            </div>
            <div
              className="preview-text"
              style={{ color: theme.colors.text }}
            >
              <p>
                The {theme.name} theme creates a {theme.name === 'Dark Night' ? 'peaceful' : 'calming'} 
                atmosphere perfect for reflection and journaling. All colors, backgrounds, and 
                elements will smoothly transition when you change themes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Theme Info */}
        <motion.div
          className="theme-info"
          variants={itemVariants}
          style={{ color: theme.colors.textLight }}
        >
          <p>
            💡 Tip: Your theme preference is saved automatically and will be remembered 
            the next time you visit.
          </p>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}