import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import './MoodTracker.css';
import axios from 'axios';
import API_BASE from '../config/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement);

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const MOOD_META = {
  happy:   { emoji: '😊', label: 'Happy',   color: '#FFD93D', value: 8 },
  calm:    { emoji: '😌', label: 'Calm',    color: '#6BCB77', value: 7 },
  sad:     { emoji: '😢', label: 'Sad',     color: '#4D96FF', value: 3 },
  anxious: { emoji: '😰', label: 'Anxious', color: '#FF6B6B', value: 4 },
  tired:   { emoji: '😴', label: 'Tired',   color: '#9B59B6', value: 5 },
  angry:   { emoji: '😡', label: 'Angry',   color: '#E74C3C', value: 2 },
  excited: { emoji: '😍', label: 'Excited', color: '#F39C12', value: 9 },
};

export default function MoodTracker() {
  const { theme } = useTheme();
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodStats,   setMoodStats]   = useState(null);
  const [period,      setPeriod]      = useState('week');
  const [loading,     setLoading]     = useState(true);

  // Log mood form
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNote,     setMoodNote]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [toast,        setToast]        = useState('');

  const fetchData = async () => {
    try {
      const [hist, stats] = await Promise.all([
        axios.get(`${API_BASE}/api/mood/user`,  { headers: authHeaders() }),
        axios.get(`${API_BASE}/api/mood/stats`, { headers: authHeaders() }),
      ]);
      setMoodHistory(hist.data);
      setMoodStats(stats.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/mood/add`, { mood: selectedMood, note: moodNote }, { headers: authHeaders() });
      setToast('Mood logged! 🎉');
      setSelectedMood('');
      setMoodNote('');
      fetchData();
      setTimeout(() => setToast(''), 3000);
    } catch (e) { setToast('Error saving mood.'); setTimeout(() => setToast(''), 3000); }
    setSubmitting(false);
  };

  // Build chart data based on period
  const buildChartData = () => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const labels = [];
    const values = [];
    const colors = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const entry = moodHistory.find(m => { const md = new Date(m.createdAt); return md >= d && md < next; });
      const fmt = period === 'week'
        ? d.toLocaleDateString('en', { weekday: 'short' })
        : period === 'month'
        ? d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
      labels.push(fmt);
      values.push(entry ? (MOOD_META[entry.mood]?.value || 5) : null);
      colors.push(entry ? MOOD_META[entry.mood]?.color || theme.colors.primary : 'transparent');
    }
    return { labels, values, colors };
  };

  const { labels, values } = buildChartData();

  const lineData = {
    labels,
    datasets: [{
      label: 'Mood Score',
      data: values,
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}18`,
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointRadius: values.map(v => v ? 5 : 0),
      pointHoverRadius: 7,
      pointBackgroundColor: values.map((v, i) => {
        const entry = moodHistory.find(m => {
          const d = new Date(); d.setDate(d.getDate() - (values.length - 1 - i)); d.setHours(0,0,0,0);
          const next = new Date(d); next.setDate(d.getDate() + 1);
          const md = new Date(m.createdAt);
          return md >= d && md < next;
        });
        return entry ? MOOD_META[entry.mood]?.color || theme.colors.primary : 'transparent';
      }),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      spanGaps: true,
    }],
  };

  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        padding: 12, cornerRadius: 10,
        callbacks: {
          label: ctx => {
            const v = ctx.raw;
            if (!v) return 'No entry';
            const mood = Object.entries(MOOD_META).find(([,m]) => m.value === v);
            return mood ? `${mood[1].emoji} ${mood[1].label} (${v}/10)` : `${v}/10`;
          }
        }
      },
    },
    scales: {
      y: { beginAtZero: false, min: 0, max: 10, ticks: { color: theme.colors.textLight, stepSize: 2 }, grid: { color: `${theme.colors.primary}15` } },
      x: { ticks: { color: theme.colors.textLight, maxRotation: 45 }, grid: { color: `${theme.colors.primary}10` } },
    },
  };

  // Doughnut: mood frequency
  const moodFreq = Object.keys(MOOD_META).reduce((acc, k) => {
    acc[k] = moodHistory.filter(m => m.mood === k).length;
    return acc;
  }, {});
  const doughnutData = {
    labels: Object.values(MOOD_META).map(m => `${m.emoji} ${m.label}`),
    datasets: [{
      data: Object.keys(MOOD_META).map(k => moodFreq[k]),
      backgroundColor: Object.values(MOOD_META).map(m => m.color),
      borderWidth: 2,
      borderColor: theme.colors.surface,
    }],
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: theme.colors.text, padding: 12, font: { size: 12 } } },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.primary,
        borderWidth: 1,
      },
    },
    cutout: '65%',
  };

  const recentHistory = [...moodHistory].slice(0, 14);

  return (
    <div className="mood-tracker-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar />
      <Sidebar />

      <div className="mood-tracker-container">
        <motion.div className="mood-tracker-header" initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }}>
          <h1 style={{ color: theme.colors.text }}>Mood Tracker</h1>
          <p style={{ color: theme.colors.textLight }}>Track your emotional patterns and spot your trends.</p>
        </motion.div>

        {/* Stats row */}
        {moodStats && (
          <div className="mood-stats-row">
            {[
              { icon:'📈', label:'Weekly Avg',   value: moodStats.weeklyMoodAverage ?? '—',      color:'#4A90E2' },
              { icon:'🔥', label:'Mood Streak',  value:`${moodStats.moodStreak || 0}d`,           color:'#F39C12' },
              { icon:'💬', label:'Total Entries',value: moodStats.totalEntries,                   color:'#7FB069' },
              { icon:'⭐', label:'Top Mood',
                value: MOOD_META[moodStats.mostCommonMood]
                  ? `${MOOD_META[moodStats.mostCommonMood].emoji} ${MOOD_META[moodStats.mostCommonMood].label}`
                  : '—',
                color:'#C8A8E9' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="mood-stat-card glass"
                style={{ background: theme.colors.surface, boxShadow:`0 6px 20px ${theme.colors.shadow}` }}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:i*0.08 } }}
                whileHover={{ y:-4 }}
              >
                <div className="mood-stat-icon" style={{ background:`${s.color}22`, color:s.color }}>{s.icon}</div>
                <div className="mood-stat-value" style={{ color: theme.colors.text }}>{s.value}</div>
                <div className="mood-stat-label" style={{ color: theme.colors.textLight }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Log Mood */}
        <motion.div
          className="mood-log-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.15 } }}
        >
          <h2 style={{ color: theme.colors.text }}>🌤️ Log Your Mood</h2>
          <div className="mood-select-grid">
            {Object.entries(MOOD_META).map(([id, m]) => (
              <motion.button
                key={id}
                className={`mood-select-btn ${selectedMood === id ? 'active' : ''}`}
                style={{
                  borderColor: selectedMood === id ? m.color : `${theme.colors.primary}30`,
                  background:  selectedMood === id ? `${m.color}22` : theme.colors.surface,
                  boxShadow:   selectedMood === id ? `0 0 0 2px ${m.color}` : 'none',
                }}
                whileHover={{ scale:1.06 }} whileTap={{ scale:0.93 }}
                onClick={() => setSelectedMood(id)}
              >
                <span className="ms-emoji">{m.emoji}</span>
                <span className="ms-label" style={{ color: theme.colors.text }}>{m.label}</span>
              </motion.button>
            ))}
          </div>
          <textarea
            className="mood-log-note"
            style={{ background:`${theme.colors.primary}0a`, color:theme.colors.text, borderColor:`${theme.colors.primary}30` }}
            placeholder="How are you feeling? Add a note…"
            value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={3}
          />
          <motion.button
            className="mood-submit-btn"
            style={{ background:`linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, opacity: selectedMood?1:0.5 }}
            disabled={!selectedMood || submitting}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={handleSubmit}
          >
            {submitting ? 'Saving…' : '✅ Log Mood'}
          </motion.button>
        </motion.div>

        {/* Period selector + line chart */}
        <motion.div
          className="mood-chart-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.2 } }}
        >
          <div className="mood-chart-header">
            <h2 style={{ color: theme.colors.text }}>Mood Over Time</h2>
            <div className="period-selector">
              {[['week','7d'],['month','30d'],['quarter','90d']].map(([p,l]) => (
                <motion.button
                  key={p}
                  className={`period-btn ${period===p?'active':''}`}
                  style={{
                    background: period===p ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : 'transparent',
                    color: period===p ? '#fff' : theme.colors.textLight,
                    border: `1.5px solid ${period===p ? 'transparent' : theme.colors.primary+'40'}`,
                  }}
                  whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => setPeriod(p)}
                >{l}</motion.button>
              ))}
            </div>
          </div>
          <div className="chart-wrap" style={{ height: 260 }}>
            {loading ? (
              <p style={{ color: theme.colors.textLight, textAlign:'center', paddingTop:'3rem' }}>Loading…</p>
            ) : moodHistory.length === 0 ? (
              <p style={{ color: theme.colors.textLight, textAlign:'center', paddingTop:'3rem' }}>
                No mood entries yet. Log your first mood above!
              </p>
            ) : (
              <Line data={lineData} options={lineOpts} />
            )}
          </div>
        </motion.div>

        {/* Two-column: doughnut + recent history */}
        <div className="mood-bottom-row">
          <motion.div
            className="mood-doughnut glass"
            style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.25 } }}
          >
            <h2 style={{ color: theme.colors.text }}>Mood Distribution</h2>
            <div className="chart-wrap" style={{ height: 220 }}>
              {moodHistory.length === 0
                ? <p style={{ color: theme.colors.textLight, textAlign:'center', paddingTop:'2rem' }}>No data yet</p>
                : <Doughnut data={doughnutData} options={doughnutOpts} />
              }
            </div>
          </motion.div>

          <motion.div
            className="mood-history glass"
            style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.3 } }}
          >
            <h2 style={{ color: theme.colors.text }}>Recent Log</h2>
            {moodHistory.length === 0 ? (
              <p style={{ color: theme.colors.textLight, fontSize:'0.9rem' }}>No entries yet.</p>
            ) : (
              <div className="history-list">
                {recentHistory.map((m, i) => {
                  const meta = MOOD_META[m.mood] || {};
                  return (
                    <motion.div
                      key={m._id || i}
                      className="history-item"
                      style={{ borderLeft:`3px solid ${meta.color || theme.colors.primary}` }}
                      initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0, transition:{ delay:i*0.04 } }}
                    >
                      <span className="history-emoji">{meta.emoji}</span>
                      <div className="history-info">
                        <span className="history-label" style={{ color: theme.colors.text }}>{meta.label}</span>
                        {m.note && <span className="history-note" style={{ color: theme.colors.textLight }}>{m.note}</span>}
                      </div>
                      <span className="history-date" style={{ color: theme.colors.textLight }}>
                        {new Date(m.createdAt).toLocaleDateString('en', { month:'short', day:'numeric' })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Insights */}
        {moodStats && moodStats.totalEntries > 0 && (
          <motion.div
            className="mood-insights glass"
            style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0, transition:{ delay:0.35 } }}
          >
            <h2 style={{ color: theme.colors.text }}>💡 Insights</h2>
            <div className="insights-grid">
              <div className="insight-card" style={{ borderColor:`${theme.colors.primary}30`, background:`${theme.colors.primary}08` }}>
                <span className="insight-icon">🔥</span>
                <div>
                  <strong style={{ color: theme.colors.text }}>{moodStats.moodStreak || 0}-day streak</strong>
                  <p style={{ color: theme.colors.textLight }}>Keep logging daily to build your streak!</p>
                </div>
              </div>
              <div className="insight-card" style={{ borderColor:`${theme.colors.primary}30`, background:`${theme.colors.primary}08` }}>
                <span className="insight-icon">📊</span>
                <div>
                  <strong style={{ color: theme.colors.text }}>
                    Avg score: {moodStats.weeklyMoodAverage ?? 'N/A'}/10 this week
                  </strong>
                  <p style={{ color: theme.colors.textLight }}>
                    {moodStats.weeklyMoodAverage >= 6 ? 'You\'re doing great! Keep it up.' : 'Try some breathing or exercise today.'}
                  </p>
                </div>
              </div>
              <div className="insight-card" style={{ borderColor:`${theme.colors.primary}30`, background:`${theme.colors.primary}08` }}>
                <span className="insight-icon">⭐</span>
                <div>
                  <strong style={{ color: theme.colors.text }}>
                    Most felt: {MOOD_META[moodStats.mostCommonMood]?.emoji} {MOOD_META[moodStats.mostCommonMood]?.label || '—'}
                  </strong>
                  <p style={{ color: theme.colors.textLight }}>This is your dominant emotional state.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="mood-toast"
            initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
