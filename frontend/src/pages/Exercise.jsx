import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import './Exercise.css';
import API_BASE from '../config/api';

const CATEGORY_META = {
  stretching: { label: 'Stretching',         emoji: '🧘', color: '#7FB069' },
  breathing:  { label: 'Breathing Exercises', emoji: '💨', color: '#4A90E2' },
  morning:    { label: 'Morning Movement',    emoji: '🌅', color: '#F39C12' },
};

const DIFFICULTY_COLOR = { easy: '#6BCB77', medium: '#FFD93D', hard: '#FF6B6B' };

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const buildProgressMap = (arr) =>
  Object.fromEntries(arr.map(p => [p.exerciseId?._id || p.exerciseId, p]));

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color, theme }) {
  return (
    <motion.div
      className="stat-card glass"
      style={{ background: theme.colors.surface, boxShadow: `0 8px 28px ${theme.colors.shadow}` }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="stat-icon" style={{ background: `${color}22`, color }}>{icon}</div>
      <div className="stat-value" style={{ color: theme.colors.text }}>{value}</div>
      <div className="stat-label" style={{ color: theme.colors.textLight }}>{label}</div>
    </motion.div>
  );
}

// ── Recommendation banner ─────────────────────────────────────────────────────
function RecommendationBanner({ rec, theme }) {
  if (!rec) return null;
  const meta = CATEGORY_META[rec.recommendedCategory] || {};
  return (
    <motion.div
      className="rec-banner glass"
      style={{ background: theme.colors.surface, borderLeft: `4px solid ${meta.color || '#818cf8'}` }}
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
    >
      <span className="rec-icon">{meta.emoji}</span>
      <div>
        <p className="rec-title" style={{ color: theme.colors.text }}>
          {rec.mood
            ? <><strong>{rec.mood.charAt(0).toUpperCase() + rec.mood.slice(1)}</strong> mood detected — try some <strong>{meta.label}</strong> today.</>
            : <>Here are some <strong>{meta.label}</strong> exercises to get you started.</>}
        </p>
        {rec.exercises?.length > 0 && (
          <p className="rec-sub" style={{ color: theme.colors.textLight }}>
            {rec.exercises.map(e => e.title).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Exercise detail modal ─────────────────────────────────────────────────────
function ExerciseDetailModal({ exercise, progress, onClose, onStart, onComplete, theme }) {
  const meta   = CATEGORY_META[exercise.category] || {};
  const pct    = progress?.progress    ?? 0;
  const done   = progress?.completed   ?? false;
  const streak = progress?.streakCount ?? 0;

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        style={{ background: theme.colors.surface }}
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ background: `${meta.color}18` }}>
          <span className="modal-emoji">{meta.emoji}</span>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: theme.colors.text }}>{exercise.title}</h2>
            <div className="modal-meta-row">
              <span className="badge" style={{ background: `${meta.color}33`, color: meta.color }}>{meta.label}</span>
              <span className="badge" style={{ background: `${DIFFICULTY_COLOR[exercise.difficulty]}33`, color: DIFFICULTY_COLOR[exercise.difficulty] }}>{exercise.difficulty}</span>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.06)', color: theme.colors.textLight }}>⏱ {exercise.duration} min</span>
              {streak > 0 && <span className="badge" style={{ background: '#ff922b22', color: '#ff922b' }}>🔥 {streak}-day streak</span>}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-description" style={{ color: theme.colors.textLight }}>{exercise.description}</p>

          {/* Progress */}
          <div className="modal-progress-wrap">
            <div className="modal-progress-label" style={{ color: theme.colors.textLight }}>
              Progress — <strong style={{ color: theme.colors.text }}>{pct}%</strong>
              {done && <span className="completed-badge">✓ Completed</span>}
            </div>
            <div className="modal-progress-bar">
              <motion.div
                className="modal-progress-fill"
                style={{ background: `linear-gradient(90deg, ${meta.color}, ${theme.colors.accent})` }}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Steps */}
          {exercise.steps?.length > 0 && (
            <div className="modal-section">
              <h4 style={{ color: theme.colors.text }}>How to do it</h4>
              <ol className="steps-list">
                {exercise.steps.map((step, i) => (
                  <li key={i} style={{ color: theme.colors.textLight }}>
                    <span className="step-num" style={{ background: `${meta.color}22`, color: meta.color }}>{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Benefits */}
          {exercise.benefits?.length > 0 && (
            <div className="modal-section">
              <h4 style={{ color: theme.colors.text }}>Benefits</h4>
              <div className="benefits-list">
                {exercise.benefits.map((b, i) => (
                  <span key={i} className="benefit-chip" style={{ background: `${meta.color}18`, color: meta.color }}>✦ {b}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-footer">
          {!done ? (
            <>
              <button
                className="btn-secondary"
                style={{ color: theme.colors.text, borderColor: theme.colors.textLight }}
                onClick={() => onStart(exercise._id)}
              >Start Session</button>
              <motion.button
                className="btn-primary"
                style={{ background: `linear-gradient(135deg, ${meta.color}, ${theme.colors.accent})` }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => onComplete(exercise._id)}
              >Mark Complete 🎉</motion.button>
            </>
          ) : (
            <div className="done-msg" style={{ color: meta.color }}>
              🎉 Great work! Come back tomorrow to keep your streak alive.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Exercise card row ─────────────────────────────────────────────────────────
function ExerciseCard({ exercise, progress, onOpen, catColor, theme }) {
  const pct  = progress?.progress  ?? 0;
  const done = progress?.completed ?? false;

  return (
    <motion.div
      className={`exercise-item${done ? ' exercise-item--done' : ''}`}
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.35 }}
      onClick={() => onOpen(exercise)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(exercise)}
    >
      <div className="exercise-item-header">
        <div>
          <h3 style={{ color: theme.colors.text }}>{exercise.title}</h3>
          <span className="exercise-meta-row">
            <span style={{ color: theme.colors.textLight, fontSize: '0.82rem' }}>⏱ {exercise.duration} min</span>
            <span className="diff-badge" style={{ background: `${DIFFICULTY_COLOR[exercise.difficulty]}22`, color: DIFFICULTY_COLOR[exercise.difficulty] }}>
              {exercise.difficulty}
            </span>
          </span>
        </div>
        <div className="exercise-item-actions">
          {done
            ? <span className="done-tick">✓</span>
            : <span className="open-hint" style={{ color: catColor }}>View →</span>}
        </div>
      </div>

      <div className="exercise-progress-bar">
        <motion.div
          className="exercise-progress-fill"
          style={{ background: `linear-gradient(90deg, ${catColor}, #818cf8)` }}
          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="exercise-progress-meta" style={{ color: theme.colors.textLight }}>
        {done ? '✓ Completed today' : `${pct}% complete`}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Exercise() {
  const { theme } = useTheme();

  const [exercises,      setExercises]  = useState([]);
  const [progressMap,    setProgress]   = useState({});
  const [stats,          setStats]      = useState(null);
  const [recommendation, setRec]        = useState(null);
  const [activeCategory, setCategory]   = useState('stretching');
  const [selected,       setSelected]   = useState(null);
  const [loading,        setLoading]    = useState(true);
  const [toastMsg,       setToast]      = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const refreshProgress = useCallback(async () => {
    const [progRes, statsRes] = await Promise.all([
      axios.get(`${API_BASE}/api/exercise-progress/user`, { headers: authHeaders() }),
      axios.get(`${API_BASE}/api/exercise/stats`,          { headers: authHeaders() }),
    ]);
    setProgress(buildProgressMap(progRes.data));
    setStats(statsRes.data);
  }, []);

  useEffect(() => {
    (async () => {
      const results = await Promise.allSettled([
        axios.get(`${API_BASE}/api/exercise`),
        axios.get(`${API_BASE}/api/exercise-progress/user`, { headers: authHeaders() }),
        axios.get(`${API_BASE}/api/exercise/stats`,          { headers: authHeaders() }),
        axios.get(`${API_BASE}/api/exercise/recommendation`, { headers: authHeaders() }),
      ]);
      if (results[0].status === 'fulfilled') setExercises(results[0].value.data);
      if (results[1].status === 'fulfilled') setProgress(buildProgressMap(results[1].value.data));
      if (results[2].status === 'fulfilled') setStats(results[2].value.data);
      if (results[3].status === 'fulfilled') setRec(results[3].value.data);
      setLoading(false);
    })();
  }, []);

  const handleStart = async (exerciseId) => {
    try {
      await axios.post(`${API_BASE}/api/exercise-progress/start`,  { exerciseId }, { headers: authHeaders() });
      await axios.post(`${API_BASE}/api/exercise-progress/update`, { exerciseId, progress: 10 }, { headers: authHeaders() });
      await refreshProgress();
      showToast('Session started! Keep going 💪');
    } catch (err) { console.error(err); }
  };

  const handleComplete = async (exerciseId) => {
    try {
      await axios.post(`${API_BASE}/api/exercise-progress/complete`, { exerciseId }, { headers: authHeaders() });
      await refreshProgress();
      showToast('Exercise completed! 🎉 Streak updated.');
    } catch (err) { console.error(err); }
  };

  // group by category
  const categorised = Object.fromEntries(
    Object.keys(CATEGORY_META).map(cat => [cat, exercises.filter(e => e.category === cat)])
  );
  const activeExercises = categorised[activeCategory] || [];

  return (
    <div className="exercise-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      {/* Toast notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div className="exercise-toast"
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="exercise-container">
        <header className="exercise-header">
          <h1 style={{ color: theme.colors.text }}>Gentle Movement</h1>
          <p style={{ color: theme.colors.textLight }}>
            Light, mental-health-friendly exercises to reconnect with your body.
          </p>
        </header>

        {/* Stats row */}
        {stats && (
          <div className="stats-row">
            <StatCard icon="✅" label="Completed"    value={stats.totalExercisesCompleted}  color="#6BCB77" theme={theme} />
            <StatCard icon="📅" label="This week"    value={stats.weeklyProgress}           color="#4A90E2" theme={theme} />
            <StatCard icon="🔥" label="Best streak"  value={`${stats.currentStreak} days`}  color="#FF6B6B" theme={theme} />
            <StatCard icon="⭐" label="Top category" value={stats.favoriteCategory ? (CATEGORY_META[stats.favoriteCategory]?.label || stats.favoriteCategory) : '—'} color="#F39C12" theme={theme} />
          </div>
        )}

        {/* Mood recommendation */}
        <RecommendationBanner rec={recommendation} theme={theme} />

        <div className="exercise-layout">
          {/* Category tabs */}
          <aside className="exercise-sidebar glass" style={{ background: theme.colors.surface }}>
            {Object.entries(CATEGORY_META).map(([id, meta]) => {
              const active    = activeCategory === id;
              const total     = categorised[id]?.length || 0;
              const completed = (categorised[id] || []).filter(e => progressMap[e._id]?.completed).length;
              return (
                <motion.button key={id} type="button"
                  className={`exercise-tab${active ? ' active' : ''}`}
                  onClick={() => setCategory(id)}
                  whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                  style={{
                    color: active ? '#fff' : theme.colors.text,
                    background: active ? `linear-gradient(135deg, ${meta.color}, ${theme.colors.accent})` : 'transparent',
                  }}
                >
                  <span className="tab-emoji">{meta.emoji}</span>
                  <span className="tab-label">{meta.label}</span>
                  <span className="tab-progress-pill" style={{
                    background: active ? 'rgba(255,255,255,0.25)' : `${meta.color}22`,
                    color: active ? '#fff' : meta.color,
                  }}>{completed}/{total}</span>
                </motion.button>
              );
            })}
          </aside>

          {/* Exercise cards */}
          <section className="exercise-content">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" className="loading-state"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="spinner" />
                  <p style={{ color: theme.colors.textLight }}>Loading exercises…</p>
                </motion.div>
              ) : (
                <motion.div key={activeCategory} className="exercise-card glass"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
                  style={{ background: theme.colors.surface, boxShadow: `0 8px 32px ${theme.colors.shadow}` }}
                >
                  <div className="exercise-card-header">
                    <span className="card-emoji">{CATEGORY_META[activeCategory]?.emoji}</span>
                    <div>
                      <h2 style={{ color: theme.colors.text }}>{CATEGORY_META[activeCategory]?.label}</h2>
                      <p style={{ color: theme.colors.textLight }}>
                        {activeCategory === 'stretching' && 'Release tightness and gently wake up your body.'}
                        {activeCategory === 'breathing'  && 'Soothe your nervous system with slow, mindful breaths.'}
                        {activeCategory === 'morning'    && 'Light movement to start the day with clarity and energy.'}
                      </p>
                    </div>
                  </div>

                  <div className="exercise-items">
                    {activeExercises.length === 0
                      ? <p style={{ color: theme.colors.textLight, textAlign: 'center', padding: '2rem 0' }}>No exercises found.</p>
                      : activeExercises.map(ex => (
                          <ExerciseCard key={ex._id} exercise={ex}
                            progress={progressMap[ex._id]}
                            onOpen={setSelected}
                            catColor={CATEGORY_META[ex.category]?.color || '#818cf8'}
                            theme={theme}
                          />
                        ))
                    }
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <ExerciseDetailModal
            exercise={selected}
            progress={progressMap[selected._id]}
            onClose={() => setSelected(null)}
            onStart={handleStart}
            onComplete={handleComplete}
            theme={theme}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
