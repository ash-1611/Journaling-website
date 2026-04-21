import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import './Footer.css';

const footerLinks = [
  {
    heading: 'Features',
    links: [
      { label: 'Journal',      to: '/journal'      },
      { label: 'Mood Tracker', to: '/mood-tracker'  },
      { label: 'Music',        to: '/music'         },
      { label: 'Yoga',         to: '/yoga'          },
      { label: 'Exercise',     to: '/exercise'      },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Settings',  to: '/settings'  },
      { label: 'Themes',    to: '/themes'    },
      { label: 'Login',     to: '/auth'      },
    ],
  },
];

export default function Footer() {
  const { theme } = useTheme();

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        background:  theme.colors.surface,
        borderTop:   `1px solid ${theme.colors.primary}20`,
      }}
    >
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo" style={{ color: theme.colors.primary }}>
            <span className="footer-logo-icon">🌿</span>
            <span className="footer-logo-text" style={{
              background: `linear-gradient(135deg,${theme.colors.primary},${theme.colors.accent})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Mindful</span>
          </Link>
          <p className="footer-tagline" style={{ color: theme.colors.textLight }}>
            A safe space for your thoughts, mood, and mental wellness — one day at a time.
          </p>
          <div className="footer-badges">
            <span className="footer-badge" style={{ background:`${theme.colors.primary}18`, color:theme.colors.primary }}>🔒 Private</span>
            <span className="footer-badge" style={{ background:`${theme.colors.accent}18`,  color:theme.colors.accent  }}>💚 Free Forever</span>
          </div>
        </div>

        {/* Link columns */}
        {footerLinks.map((col) => (
          <div key={col.heading} className="footer-col">
            <h4 className="footer-col-heading" style={{ color: theme.colors.text }}>{col.heading}</h4>
            <ul>
              {col.links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="footer-link"
                    style={{ color: theme.colors.textLight }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Wellness tip */}
        <div className="footer-col footer-tip-col">
          <h4 className="footer-col-heading" style={{ color: theme.colors.text }}>Daily Reminder</h4>
          <p className="footer-tip" style={{ color: theme.colors.textLight }}>
            "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or anxious. 
            Having feelings doesn't make you a negative person. It makes you human."
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom" style={{ borderTop:`1px solid ${theme.colors.primary}15` }}>
        <span style={{ color: theme.colors.textLight, fontSize:'0.82rem' }}>
          © {new Date().getFullYear()} Mindful — Built with 💚 for mental wellness
        </span>
        <span style={{ color: theme.colors.textLight, fontSize:'0.82rem', opacity:0.6 }}>
          Take care of your mind, it's the only one you have.
        </span>
      </div>
    </motion.footer>
  );
}

