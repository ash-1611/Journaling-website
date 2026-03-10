import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Landing.css';

const FloatingShape = ({ delay, duration, size, left, top }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      className="floating-shape"
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        top: `${top}%`,
        background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`,
        border: `2px solid ${theme.colors.primary}30`,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 20, 0],
        rotate: [0, 180, 360],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: 'easeInOut',
      }}
    />
  );
};

export default function Landing() {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const floatingShapes = [
    { delay: 0, duration: 8, size: '80px', left: 10, top: 20 },
    { delay: 1, duration: 10, size: '60px', left: 85, top: 15 },
    { delay: 2, duration: 12, size: '100px', left: 20, top: 70 },
    { delay: 1.5, duration: 9, size: '70px', left: 75, top: 65 },
    { delay: 0.5, duration: 11, size: '50px', left: 50, top: 40 },
  ];

  return (
    <div className="landing-page">
      <Navbar />
      
      {/* Floating Background Shapes */}
      <div className="floating-shapes-container">
        {floatingShapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="hero-content"
          variants={itemVariants}
        >
          <motion.h1
            className="hero-title"
            style={{ color: theme.colors.text }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            A Safe Space for Your Thoughts
          </motion.h1>
          
          <motion.p
            className="hero-subtitle"
            variants={itemVariants}
            style={{ color: theme.colors.textLight }}
          >
            Track your mood, express your feelings, and nurture your mental wellness
            in a peaceful, distraction-free environment.
          </motion.p>

          <motion.div
            className="hero-buttons"
            variants={itemVariants}
          >
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                color: 'white',
                boxShadow: `0 10px 30px ${theme.colors.shadow}`,
              }}
            >
              <Link to="/journal" style={{ color: 'white', textDecoration: 'none' }}>
                Start Journaling
              </Link>
            </motion.button>
            
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: theme.colors.surface,
                color: theme.colors.primary,
                border: `2px solid ${theme.colors.primary}`,
              }}
            >
              <Link to="/mood-tracker" style={{ color: 'inherit', textDecoration: 'none' }}>
                Track Your Mood
              </Link>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Abstract Illustration */}
        <motion.div
          className="hero-illustration"
          variants={itemVariants}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 400 400" width="400" height="400">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <motion.circle
              cx="200"
              cy="200"
              r="150"
              fill="url(#grad1)"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.path
              d="M 100 200 Q 200 100 300 200 T 200 300"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="3"
              opacity="0.5"
              animate={{
                pathLength: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </svg>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="section-title"
          style={{ color: theme.colors.text }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Your Wellness Journey
        </motion.h2>

        <div className="features-grid">
          {[
            {
              icon: '📝',
              title: 'Daily Journaling',
              description: 'Express your thoughts freely in a safe, private space.',
            },
            {
              icon: '😊',
              title: 'Mood Tracking',
              description: 'Visualize your emotional patterns and progress over time.',
            },
            {
              icon: '🎨',
              title: 'Beautiful Themes',
              description: 'Choose from calming themes that match your mood.',
            },
            {
              icon: '🔒',
              title: 'Private & Secure',
              description: 'Your thoughts are yours alone, stored securely.',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card glass"
              style={{
                background: theme.colors.surface,
                color: theme.colors.text,
                boxShadow: `0 8px 32px ${theme.colors.shadow}`,
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 style={{ color: theme.colors.primary }}>{feature.title}</h3>
              <p style={{ color: theme.colors.textLight }}>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
