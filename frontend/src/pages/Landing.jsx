import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Landing.css';

const FloatingShape = ({ delay, duration, size, left, top, shape }) => {
  const { theme } = useTheme();
  return (
    <motion.div
      className={`floating-shape ${shape}`}
      style={{
        width: size, height: size,
        left: `${left}%`, top: `${top}%`,
        background: `linear-gradient(135deg, ${theme.colors.primary}18, ${theme.colors.accent}18)`,
        border: `1.5px solid ${theme.colors.primary}25`,
      }}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, 180, 360], scale: [1, 1.1, 1] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
};

const features = [
  { icon: '📝', title: 'Smart Journal', description: 'Write, express and decorate entries with stickers. Multi-entry support with a Canva-style editor.', link: '/journal', color: '#6C63FF', tag: 'Creative' },
  { icon: '📊', title: 'Mood Tracker', description: 'Log your emotions daily and visualize patterns with beautiful charts. Understand yourself better.', link: '/mood-tracker', color: '#FF6584', tag: 'Insights' },
  { icon: '💪', title: 'Exercise', description: 'Personalized workout recommendations based on your mood. Track streaks and celebrate progress.', link: '/exercise', color: '#FF8C42', tag: 'Active' },
  { icon: '🧘', title: 'Yoga', description: 'Guided yoga poses with step-by-step instructions, animated timers and a daily completion tracker.', link: '/yoga', color: '#38C9A0', tag: 'Mindful' },
  { icon: '🎵', title: 'Music', description: 'Curated playlists for every state of mind — focus, sleep, anxiety relief, morning energy and more.', link: '/music', color: '#4ECDC4', tag: 'Relax' },
  { icon: '🤖', title: 'AI Companion', description: 'Meet Mindi — your empathetic AI wellness assistant. Get mood analysis, affirmations and emotional support.', link: '/ai-chat', color: '#A78BFA', tag: 'AI-Powered' },
  { icon: '✨', title: 'AI Insights', description: 'AI analyzes your journal entries to detect mood, suggest activities, and predict tomorrow\'s emotional state.', link: '/ai-analytics', color: '#FF6B9D', tag: 'Smart' },
  { icon: '📈', title: 'Analytics Dashboard', description: 'See your wellness at a glance — streak counts, mood history, emotional trends and AI-powered predictions.', link: '/dashboard', color: '#6BCB77', tag: 'Data' },
];

const appStats = [
  { number: '8+', label: 'Wellness Features' },
  { number: '9+', label: 'Guided Exercises' },
  { number: '8+', label: 'Yoga Poses' },
  { number: '6+', label: 'Music Playlists' },
];

const howItWorks = [
  { step: '01', icon: '🔐', title: 'Create Your Account', desc: 'Sign up in seconds. Your data is private and fully secure.' },
  { step: '02', icon: '😊', title: 'Log Your Mood', desc: 'Start with a quick mood check-in to personalise your experience.' },
  { step: '03', icon: '✨', title: 'Get AI Insights', desc: 'Let Mindi analyze your journal entries and give you personalized affirmations and suggestions.' },
  { step: '04', icon: '📈', title: 'Track Progress', desc: 'Watch your wellness streak grow and celebrate every daily win with AI-powered analytics.' },
];

const testimonials = [
  { avatar: '🌸', name: 'Priya S.', text: '"The mood tracker helped me spot patterns I never noticed. I feel so much more in control of my mental health now."' },
  { avatar: '🌟', name: 'Arjun M.', text: '"I love the journal sticker editor — it makes writing fun! The yoga timer is a game-changer for my morning routine."' },
  { avatar: '🌿', name: 'Nisha R.', text: '"The music playlists are perfectly curated. I use the Focus playlist every day during work. Absolute lifesaver!"' },
];

const floatingShapes = [
  { delay: 0, duration: 8, size: '80px', left: 8, top: 18, shape: 'circle' },
  { delay: 1.2, duration: 11, size: '55px', left: 88, top: 12, shape: 'square' },
  { delay: 2.5, duration: 13, size: '100px', left: 15, top: 72, shape: 'circle' },
  { delay: 0.8, duration: 9, size: '65px', left: 78, top: 68, shape: 'square' },
  { delay: 3, duration: 10, size: '45px', left: 52, top: 38, shape: 'circle' },
  { delay: 1.8, duration: 12, size: '70px', left: 93, top: 45, shape: 'circle' },
];

export default function Landing() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page" style={{ background: theme.colors.background }}>
      <Navbar />

      <div className="floating-shapes-container">
        {floatingShapes.map((s, i) => <FloatingShape key={i} {...s} />)}
      </div>

      {/* ── HERO ── */}
      <section className="hero-section">
        <motion.div className="hero-content"
          initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.span className="hero-badge"
            style={{ background: `${theme.colors.primary}18`, color: theme.colors.primary }}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            🌿 Your Mental Wellness Companion
          </motion.span>

          <motion.h1 className="hero-title" style={{ color: theme.colors.text }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            A Safe Space for
            <span className="hero-title-gradient" style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}> Your Thoughts</span>
          </motion.h1>

          <motion.p className="hero-subtitle" style={{ color: theme.colors.textLight }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          >
            Track moods, journal your feelings, practice yoga, exercise and listen to curated music — 
            all in one beautiful, distraction-free app.
          </motion.p>

          <motion.div className="hero-buttons"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          >
            <motion.button className="btn-primary"
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}
              style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 12px 35px ${theme.colors.primary}45` }}
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
            >
              {isLoggedIn ? '🚀 Go to Dashboard' : '✨ Get Started Free'}
            </motion.button>
            <motion.button className="btn-secondary"
              whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}
              style={{ background: theme.colors.surface, color: theme.colors.primary, border: `2px solid ${theme.colors.primary}50`, boxShadow: `0 8px 24px ${theme.colors.shadow}` }}
              onClick={() => navigate('/mood-tracker')}
            >
              📊 Track Your Mood
            </motion.button>
          </motion.div>

          <motion.div className="hero-stats"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          >
            {appStats.map((s, i) => (
              <div key={i} className="hero-stat">
                <span className="hero-stat-number" style={{ color: theme.colors.primary }}>{s.number}</span>
                <span className="hero-stat-label" style={{ color: theme.colors.textLight }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* SVG hero illustration */}
        <motion.div
          className="hero-illustration"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 460 460" width="460" height="460" aria-hidden="true">
            <defs>
              <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor={theme.colors.primary}   stopOpacity="0.25" />
                <stop offset="100%" stopColor={theme.colors.secondary} stopOpacity="0.18" />
              </linearGradient>
              <linearGradient id="heroGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor={theme.colors.accent}  stopOpacity="0.35" />
                <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="heroGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor={theme.colors.secondary} stopOpacity="0.4" />
                <stop offset="100%" stopColor={theme.colors.accent}    stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer pulsing ring */}
            <motion.circle
              cx="230" cy="230" r="185"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="1.5"
              strokeDasharray="12 8"
              opacity="0.25"
              animate={{ rotate: [0, 360] }}
              style={{ transformOrigin: '230px 230px' }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            />

            {/* Main background blob */}
            <motion.circle
              cx="230" cy="230" r="155"
              fill="url(#heroGrad1)"
              animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.9, 0.6] }}
              style={{ transformOrigin: '230px 230px' }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Secondary blob */}
            <motion.ellipse
              cx="260" cy="210" rx="120" ry="100"
              fill="url(#heroGrad2)"
              animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
              style={{ transformOrigin: '260px 210px' }}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Journal card */}
            <motion.rect
              x="105" y="130" width="170" height="200" rx="18"
              fill={theme.colors.surface}
              opacity="0.92"
              filter="url(#glow)"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Card header strip */}
            <motion.rect
              x="105" y="130" width="170" height="44" rx="18"
              fill={theme.colors.primary}
              opacity="0.85"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Card title lines */}
            {[165, 185, 200, 215, 230].map((y, i) => (
              <motion.rect
                key={y}
                x={125} y={y} width={i % 2 === 0 ? 130 : 90} height="7" rx="4"
                fill={theme.colors.primary}
                opacity="0.18"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            {/* Emoji on card */}
            <motion.text
              x="172" y="162" fontSize="20" textAnchor="middle"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            >📝</motion.text>

            {/* Music card (small, floating top-right) */}
            <motion.rect
              x="275" y="115" width="110" height="82" rx="14"
              fill={theme.colors.surface}
              opacity="0.9"
              animate={{ y: [0, -10, 0], rotate: [2, 4, 2] }}
              style={{ transformOrigin: '330px 156px' }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.text
              x="330" y="145" fontSize="22" textAnchor="middle"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >🎵</motion.text>
            {/* Music bars */}
            {[0,1,2,3].map(i => (
              <motion.rect
                key={i}
                x={308 + i * 14} y={162} width="7" rx="4"
                fill={theme.colors.primary}
                opacity="0.7"
                animate={{ height: [8, 18, 8], y: [168, 158, 168] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
              />
            ))}

            {/* Mood card (small, bottom-left) */}
            <motion.rect
              x="75" y="310" width="118" height="76" rx="14"
              fill={theme.colors.surface}
              opacity="0.9"
              animate={{ y: [0, -8, 0], rotate: [-2, -4, -2] }}
              style={{ transformOrigin: '134px 348px' }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            />
            <motion.text
              x="134" y="342" fontSize="22" textAnchor="middle"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            >😊</motion.text>
            {/* Mood bar */}
            <motion.rect
              x="95" y="358" width="78" height="7" rx="4"
              fill={theme.colors.primary} opacity="0.2"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            />
            <motion.rect
              x="95" y="358" rx="4" height="7"
              fill={theme.colors.primary} opacity="0.7"
              animate={{ width: [30, 60, 30], y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            />

            {/* Yoga card (bottom-right) */}
            <motion.rect
              x="290" y="300" width="100" height="88" rx="14"
              fill={theme.colors.surface}
              opacity="0.9"
              animate={{ y: [0, -9, 0], rotate: [3, 5, 3] }}
              style={{ transformOrigin: '340px 344px' }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
            <motion.text
              x="340" y="340" fontSize="24" textAnchor="middle"
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >🧘</motion.text>

            {/* Connecting path (wave) */}
            <motion.path
              d="M 130 230 Q 200 160 270 230 T 380 200"
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.35"
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Floating sparkle dots */}
            {[
              { cx: 80,  cy: 155, r: 6,  delay: 0   },
              { cx: 390, cy: 260, r: 5,  delay: 0.7 },
              { cx: 200, cy: 80,  r: 4,  delay: 1.4 },
              { cx: 370, cy: 390, r: 5,  delay: 0.3 },
              { cx: 60,  cy: 370, r: 4,  delay: 1.8 },
            ].map((d, i) => (
              <motion.circle
                key={i}
                cx={d.cx} cy={d.cy} r={d.r}
                fill={theme.colors.primary}
                opacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
                style={{ transformOrigin: `${d.cx}px ${d.cy}px` }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
              />
            ))}
          </svg>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <motion.div className="section-header"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-badge" style={{ background: `${theme.colors.primary}18`, color: theme.colors.primary }}>
            Everything You Need
          </span>
          <h2 className="section-title" style={{ color: theme.colors.text }}>Your Complete Wellness Toolkit</h2>
          <p className="section-subtitle" style={{ color: theme.colors.textLight }}>
            Six powerful features working together to support your mental wellbeing every single day.
          </p>
        </motion.div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} className="feature-card glass"
              style={{ background: theme.colors.surface, boxShadow: `0 8px 32px ${theme.colors.shadow}` }}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -10, boxShadow: `0 24px 60px ${theme.colors.shadow}` }}
            >
              <div className="feature-card-top">
                <div className="feature-icon-wrap" style={{ background: `${f.color}18` }}>
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <span className="feature-tag" style={{ background: `${f.color}20`, color: f.color }}>{f.tag}</span>
              </div>
              <h3 className="feature-title" style={{ color: theme.colors.text }}>{f.title}</h3>
              <p className="feature-desc" style={{ color: theme.colors.textLight }}>{f.description}</p>
              <Link to={f.link} className="feature-link" style={{ color: f.color }}>Explore →</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="how-section-inner" style={{ background: `linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.accent}08)` }}>
          <motion.div className="section-header"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
          >
            <span className="section-badge" style={{ background: `${theme.colors.accent}20`, color: theme.colors.accent }}>
              Simple Steps
            </span>
            <h2 className="section-title" style={{ color: theme.colors.text }}>How Mindful Works</h2>
          </motion.div>

          <div className="how-grid">
            {howItWorks.map((s, i) => (
              <motion.div key={i} className="how-card"
                style={{ background: theme.colors.surface, boxShadow: `0 8px 30px ${theme.colors.shadow}` }}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="how-step-number" style={{ color: `${theme.colors.primary}25` }}>{s.step}</div>
                <div className="how-icon">{s.icon}</div>
                <h3 style={{ color: theme.colors.text }}>{s.title}</h3>
                <p style={{ color: theme.colors.textLight }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <motion.div className="section-header"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <span className="section-badge" style={{ background: `${theme.colors.primary}18`, color: theme.colors.primary }}>
            Loved by Users
          </span>
          <h2 className="section-title" style={{ color: theme.colors.text }}>What People Are Saying</h2>
        </motion.div>

        <div className="testimonials-carousel">
          <AnimatePresence mode="wait">
            <motion.div key={activeTestimonial} className="testimonial-card"
              style={{ background: theme.colors.surface, boxShadow: `0 16px 50px ${theme.colors.shadow}` }}
              initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.4 }}
            >
              <div className="testimonial-avatar">{testimonials[activeTestimonial].avatar}</div>
              <p className="testimonial-text" style={{ color: theme.colors.text }}>{testimonials[activeTestimonial].text}</p>
              <span className="testimonial-name" style={{ color: theme.colors.primary }}>— {testimonials[activeTestimonial].name}</span>
            </motion.div>
          </AnimatePresence>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button key={i}
                className={`t-dot ${i === activeTestimonial ? 'active' : ''}`}
                style={{ background: i === activeTestimonial ? theme.colors.primary : `${theme.colors.primary}30` }}
                onClick={() => setActiveTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <motion.div className="cta-inner"
          style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, boxShadow: `0 20px 60px ${theme.colors.primary}40` }}
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="cta-text">
            <h2>Start Your Wellness Journey Today</h2>
            <p>Free forever. No credit card needed. Start feeling better in minutes.</p>
          </div>
          <div className="cta-buttons">
            <motion.button className="cta-btn-white"
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
              style={{ color: theme.colors.primary }}
              onClick={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
            >
              {isLoggedIn ? 'Open Dashboard' : 'Sign Up Free'}
            </motion.button>
            <motion.button className="cta-btn-outline"
              whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/journal')}
            >
              Try Journaling
            </motion.button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
