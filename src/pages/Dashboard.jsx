import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAI } from "../context/AIContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";
import API_BASE from "../config/api";

const MOOD_META = {
  happy:   { emoji: "😊", label: "Happy",   color: "#FFD93D" },
  calm:    { emoji: "😌", label: "Calm",    color: "#6BCB77" },
  sad:     { emoji: "😢", label: "Sad",     color: "#4D96FF" },
  anxious: { emoji: "😰", label: "Anxious", color: "#FF6B6B" },
  tired:   { emoji: "😴", label: "Tired",   color: "#9B59B6" },
  angry:   { emoji: "😡", label: "Angry",   color: "#E74C3C" },
  excited: { emoji: "😍", label: "Excited", color: "#F39C12" },
};
const MOOD_VALUE = { happy:8, excited:9, calm:7, tired:5, sad:3, anxious:4, angry:2 };
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};
const stripHtml = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
};

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { fetchDailySummary, fetchMoodPrediction, dailySummary, prediction } = useAI();

  const [profile,     setProfile]     = useState(null);
  const [entries,     setEntries]     = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodStats,   setMoodStats]   = useState(null);
  const [exStats,     setExStats]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [todayMood,   setTodayMood]   = useState(null);
  const [loggedToday, setLoggedToday] = useState(false);
  const [moodNote,    setMoodNote]    = useState("");
  const [savingMood,  setSavingMood]  = useState(false);
  const [moodSuccess, setMoodSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }
    Promise.allSettled([
      axios.get(`${API_BASE}/api/profile/me`,     { headers: authHeaders() }),
      axios.get(`${API_BASE}/api/journal/user`,   { headers: authHeaders() }),
      axios.get(`${API_BASE}/api/mood/user`,      { headers: authHeaders() }),
      axios.get(`${API_BASE}/api/mood/stats`,     { headers: authHeaders() }),
      axios.get(`${API_BASE}/api/exercise/stats`, { headers: authHeaders() }),
    ]).then(([prof, jrnl, moodHist, moodSt, exSt]) => {
      if (prof.status      === "fulfilled") setProfile(prof.value.data);
      if (jrnl.status      === "fulfilled") setEntries(jrnl.value.data);
      if (moodHist.status  === "fulfilled") {
        const hist = moodHist.value.data;
        setMoodHistory(hist);
        const today = new Date(); today.setHours(0,0,0,0);
        const todayEntry = hist.find(m => new Date(m.createdAt) >= today);
        if (todayEntry) { setLoggedToday(true); setTodayMood(todayEntry.mood); }
      }
      if (moodSt.status    === "fulfilled") setMoodStats(moodSt.value.data);
      if (exSt.status      === "fulfilled") setExStats(exSt.value.data);
      setLoading(false);
    });
    // Fetch AI summary and prediction silently
    fetchDailySummary();
    fetchMoodPrediction();
  }, [navigate, fetchDailySummary, fetchMoodPrediction]);

  const handleLogMood = async () => {
    if (!todayMood) return;
    setSavingMood(true);
    try {
      await axios.post(`${API_BASE}/api/mood/add`, { mood: todayMood, note: moodNote }, { headers: authHeaders() });
      setLoggedToday(true);
      setMoodSuccess(true);
      const [h, s] = await Promise.all([
        axios.get(`${API_BASE}/api/mood/user`,  { headers: authHeaders() }),
        axios.get(`${API_BASE}/api/mood/stats`, { headers: authHeaders() }),
      ]);
      setMoodHistory(h.data);
      setMoodStats(s.data);
      setTimeout(() => setMoodSuccess(false), 3000);
    } catch (e) { console.error(e); }
    setSavingMood(false);
  };

  const openEntry = (entry) => {
    localStorage.setItem("openJournalEntry", JSON.stringify(entry));
    navigate("/journal");
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const entry = moodHistory.find(m => { const md = new Date(m.createdAt); return md >= d && md < next; });
    return {
      label: d.toLocaleDateString("en", { weekday: "short" }),
      value: entry ? (MOOD_VALUE[entry.mood] || 5) : null,
      mood:  entry?.mood || null,
    };
  });

  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) return (
    <div className="dashboard-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar /><Sidebar />
      <div className="dash-loading">
        <motion.div className="dash-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p style={{ color: theme.colors.textLight, marginTop: "1rem" }}>Loading your wellness data…</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="dashboard-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar />
      <Sidebar />

      <div className="dashboard-container">

        {/* ── Header ── */}
        <motion.div className="dash-header" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <div>
            <h1 style={{ color: theme.colors.text }}>
              {greeting()}, {profile?.name?.split(" ")[0] || "friend"} 👋
            </h1>
            <p style={{ color: theme.colors.textLight }}>Here's your wellness overview for today.</p>
          </div>
          <motion.button
            className="dash-journal-btn"
            style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/journal")}
          >
            ✏️ New Entry
          </motion.button>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="dash-stats-row">
          {[
            { icon:"📝", label:"Journal Entries",  value: entries.length,                       color:"#4A90E2" },
            { icon:"🔥", label:"Mood Streak",       value:`${moodStats?.moodStreak || 0}d`,       color:"#F39C12" },
            { icon:"🏃", label:"Exercises Done",    value: exStats?.totalExercisesCompleted || 0, color:"#7FB069" },
            { icon:"📊", label:"Weekly Mood Avg",   value: moodStats?.weeklyMoodAverage ?? "—",   color:"#C8A8E9" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="dash-stat-card glass"
              style={{ background: theme.colors.surface, boxShadow: `0 8px 28px ${theme.colors.shadow}` }}
              variants={fadeUp} custom={i + 1} initial="hidden" animate="visible"
              whileHover={{ y: -6 }}
            >
              <div className="dash-stat-icon" style={{ background:`${s.color}22`, color:s.color }}>{s.icon}</div>
              <div className="dash-stat-value" style={{ color: theme.colors.text }}>{s.value}</div>
              <div className="dash-stat-label" style={{ color: theme.colors.textLight }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Mood Check-in + 7-Day Sparkline ── */}
        <div className="dash-middle-row">
          <motion.div
            className="dash-mood-checkin glass"
            style={{ background: theme.colors.surface, boxShadow: `0 8px 28px ${theme.colors.shadow}` }}
            variants={fadeUp} custom={5} initial="hidden" animate="visible"
          >
            <h2 style={{ color: theme.colors.text }}>
              {loggedToday ? "✅ Today's Mood" : "🌤️ How are you feeling?"}
            </h2>
            {moodSuccess && (
              <motion.div className="mood-success-banner" initial={{ opacity:0,y:-8 }} animate={{ opacity:1,y:0 }}>
                Mood logged! Keep it up 🎉
              </motion.div>
            )}
            <div className="mood-emoji-row">
              {Object.entries(MOOD_META).map(([id, m]) => (
                <motion.button
                  key={id}
                  className={`mood-emoji-btn ${todayMood === id ? "selected" : ""}`}
                  style={{
                    borderColor: todayMood === id ? m.color : "transparent",
                    background:  todayMood === id ? `${m.color}22` : "transparent",
                  }}
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => !loggedToday && setTodayMood(id)}
                  disabled={loggedToday} title={m.label}
                >
                  <span className="mood-emoji-large">{m.emoji}</span>
                  <span className="mood-emoji-label" style={{ color: theme.colors.textLight }}>{m.label}</span>
                </motion.button>
              ))}
            </div>
            {!loggedToday && (
              <>
                <textarea
                  className="mood-note-input"
                  style={{ background:`${theme.colors.primary}0d`, color:theme.colors.text, borderColor:`${theme.colors.primary}40` }}
                  placeholder="Add a note (optional)…"
                  value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={2}
                />
                <motion.button
                  className="mood-log-btn"
                  style={{ background:`linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, opacity: todayMood?1:0.5 }}
                  disabled={!todayMood || savingMood}
                  whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                  onClick={handleLogMood}
                >
                  {savingMood ? "Saving…" : "Log Mood"}
                </motion.button>
              </>
            )}
            {loggedToday && todayMood && (
              <p style={{ color:theme.colors.textLight, textAlign:"center", marginTop:"0.5rem", fontSize:"0.9rem" }}>
                You're feeling{" "}
                <strong style={{ color: MOOD_META[todayMood]?.color }}>{MOOD_META[todayMood]?.label}</strong>{" "}
                today
              </p>
            )}
          </motion.div>

          <motion.div
            className="dash-sparkline glass"
            style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
            variants={fadeUp} custom={6} initial="hidden" animate="visible"
          >
            <h2 style={{ color: theme.colors.text }}>📈 7-Day Mood Trend</h2>
            <div className="sparkline-bars">
              {last7.map((d, i) => (
                <div key={i} className="spark-col">
                  <div className="spark-bar-wrap">
                    <motion.div
                      className="spark-bar"
                      style={{
                        background: d.mood
                          ? `linear-gradient(180deg, ${MOOD_META[d.mood]?.color || theme.colors.primary}, ${MOOD_META[d.mood]?.color || theme.colors.accent}88)`
                          : `${theme.colors.primary}22`,
                        height: d.value ? `${(d.value/10)*100}%` : "6px",
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: d.value ? `${(d.value/10)*100}%` : "6px" }}
                      transition={{ duration: 0.5, delay: i * 0.07 }}
                      title={d.mood ? `${MOOD_META[d.mood]?.emoji} ${d.value}/10` : "No entry"}
                    />
                  </div>
                  <span className="spark-label" style={{ color: theme.colors.textLight }}>{d.label}</span>
                  {d.mood && <span className="spark-emoji">{MOOD_META[d.mood]?.emoji}</span>}
                </div>
              ))}
            </div>
            {moodStats && (
              <div className="sparkline-meta">
                <span style={{ color: theme.colors.textLight }}>
                  Top mood:{" "}
                  <strong style={{ color: theme.colors.primary }}>
                    {MOOD_META[moodStats.mostCommonMood]?.emoji}{" "}
                    {MOOD_META[moodStats.mostCommonMood]?.label || "—"}
                  </strong>
                </span>
                <span style={{ color: theme.colors.textLight }}>
                  Total:{" "}
                  <strong style={{ color: theme.colors.primary }}>{moodStats.totalEntries}</strong>
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible">
          <h2 className="dash-section-title" style={{ color: theme.colors.text }}>Quick Actions</h2>
          <div className="dash-quick-actions">
            {[
              { icon:"🧘", label:"Exercise",    path:"/exercise",     color:"#7FB069" },
              { icon:"💨", label:"Breathe",     path:"/exercise",     color:"#4A90E2" },
              { icon:"🎵", label:"Music",       path:"/music",        color:"#C8A8E9" },
              { icon:"🌿", label:"Yoga",        path:"/yoga",         color:"#7FB069" },
              { icon:"📖", label:"Journal",     path:"/journal",      color:"#F39C12" },
              { icon:"📊", label:"Mood Chart",  path:"/mood-tracker", color:"#FF6B6B" },
            ].map((a, i) => (
              <motion.button
                key={a.label}
                className="dash-action-btn glass"
                style={{ background: theme.colors.surface, boxShadow:`0 4px 16px ${theme.colors.shadow}` }}
                whileHover={{ y:-6, scale:1.04 }} whileTap={{ scale:0.95 }}
                onClick={() => navigate(a.path)}
                initial={{ opacity:0, scale:0.85 }}
                animate={{ opacity:1, scale:1, transition:{ delay:0.3+i*0.06 } }}
              >
                <span className="qa-icon" style={{ background:`${a.color}22`, color:a.color }}>{a.icon}</span>
                <span style={{ color:theme.colors.text, fontSize:"0.85rem", fontWeight:600 }}>{a.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── AI Wellness Section ── */}
        <motion.div variants={fadeUp} custom={8} initial="hidden" animate="visible">
          <h2 className="dash-section-title" style={{ color: theme.colors.text }}>🤖 AI Wellness Insights</h2>
          <div className="dash-ai-row">
            {/* Daily Summary */}
            <motion.div
              className="dash-ai-card glass"
              style={{ background: theme.colors.surface, boxShadow: `0 8px 28px ${theme.colors.shadow}` }}
              whileHover={{ y: -4 }}
            >
              <div className="dash-ai-card-header">
                <span className="dash-ai-icon" style={{ background: `${theme.colors.primary}20`, color: theme.colors.primary }}>📋</span>
                <span style={{ color: theme.colors.text, fontWeight: 700, fontSize: '0.95rem' }}>Daily Summary</span>
              </div>
              {dailySummary ? (
                <>
                  <p style={{ color: theme.colors.textLight, fontSize: '0.87rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
                    {dailySummary.summary}
                  </p>
                  {dailySummary.positiveHighlights?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {dailySummary.positiveHighlights.slice(0, 2).map((h, i) => (
                        <li key={i} style={{ fontSize: '0.82rem', color: theme.colors.textLight, display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: theme.colors.primary }}>✦</span>{h}
                        </li>
                      ))}
                    </ul>
                  )}
                  {dailySummary.tomorrowActivity && (
                    <div style={{ padding: '0.6rem 0.9rem', borderRadius: 10, background: `${theme.colors.accent}14`, fontSize: '0.82rem', color: theme.colors.textLight, borderLeft: `3px solid ${theme.colors.accent}` }}>
                      <strong style={{ color: theme.colors.accent }}>Tomorrow: </strong>{dailySummary.tomorrowActivity}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ color: theme.colors.textLight, fontSize: '0.85rem', opacity: 0.6 }}>
                  Journal an entry and analyze it with AI to get your daily summary.
                </p>
              )}
              <Link to="/journal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.primary, textDecoration: 'none' }}>
                Open Journal →
              </Link>
            </motion.div>

            {/* Mood Prediction */}
            <motion.div
              className="dash-ai-card glass"
              style={{ background: theme.colors.surface, boxShadow: `0 8px 28px ${theme.colors.shadow}` }}
              whileHover={{ y: -4 }}
            >
              <div className="dash-ai-card-header">
                <span className="dash-ai-icon" style={{ background: `${theme.colors.accent}20`, color: theme.colors.accent }}>🔮</span>
                <span style={{ color: theme.colors.text, fontWeight: 700, fontSize: '0.95rem' }}>Tomorrow's Forecast</span>
              </div>
              {prediction ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2.4rem' }}>
                      {({ happy:'😊', calm:'😌', anxious:'😰', sad:'😢', stressed:'😤', motivated:'💪', tired:'😴', neutral:'🙂' })[prediction.predictedMood] || '🙂'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: theme.colors.primary, textTransform: 'capitalize', fontSize: '1.1rem' }}>
                        {prediction.predictedMood}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: theme.colors.textLight }}>
                        {Math.round(prediction.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: theme.colors.textLight, lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {prediction.recommendation}
                  </p>
                </>
              ) : (
                <p style={{ color: theme.colors.textLight, fontSize: '0.85rem', opacity: 0.6 }}>
                  Keep journaling daily to unlock mood predictions.
                </p>
              )}
              <Link to="/ai-analytics" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.82rem', fontWeight: 600, color: theme.colors.accent, textDecoration: 'none' }}>
                View Analytics →
              </Link>
            </motion.div>

            {/* Talk to Mindi CTA */}
            <motion.div
              className="dash-ai-card dash-ai-mindi glass"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}18, ${theme.colors.accent}10)`,
                boxShadow: `0 8px 28px ${theme.colors.shadow}`,
                border: `1.5px dashed ${theme.colors.primary}30`,
              }}
              whileHover={{ y: -4 }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
              <div style={{ fontWeight: 700, color: theme.colors.text, fontSize: '1rem', marginBottom: '0.4rem' }}>
                Talk to Mindi
              </div>
              <p style={{ color: theme.colors.textLight, fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Your AI wellness companion is here to listen, support, and guide you.
              </p>
              <motion.button
                onClick={() => navigate('/ai-chat')}
                style={{ padding: '0.65rem 1.4rem', borderRadius: 999, border: 'none', background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`, color: '#fff', fontWeight: 600, fontSize: '0.87rem', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              >
                Start Chatting →
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Recent Journal Entries ── */}
        {sortedEntries.length > 0 && (
          <motion.div
            className="dash-recent glass"
            style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
            variants={fadeUp} custom={8} initial="hidden" animate="visible"
          >
            <div className="dash-section-header">
              <h2 style={{ color: theme.colors.text }}>📝 Recent Journal Entries</h2>
              <motion.button className="dash-view-all" style={{ color: theme.colors.primary }} whileHover={{ x:4 }} onClick={() => navigate("/journal")}>
                View all →
              </motion.button>
            </div>
            <div className="recent-entries">
              {sortedEntries.slice(0,4).map((entry, i) => (
                <motion.div
                  key={entry._id || i}
                  className="recent-entry"
                  style={{ borderLeft:`3px solid ${MOOD_META[entry.mood]?.color || theme.colors.primary}` }}
                  whileHover={{ x:4 }}
                  onClick={() => openEntry(entry)}
                  initial={{ opacity:0, x:-16 }}
                  animate={{ opacity:1, x:0, transition:{ delay:0.4+i*0.07 } }}
                >
                  <div className="recent-entry-header">
                    <div>
                      <span className="recent-entry-title" style={{ color: theme.colors.text }}>
                        {entry.title || "Untitled Entry"}
                      </span>
                      <span className="recent-entry-date" style={{ color: theme.colors.textLight }}>
                        {new Date(entry.date).toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" })}
                      </span>
                    </div>
                    {entry.mood && (
                      <span className="recent-mood" title={MOOD_META[entry.mood]?.label}>
                        {MOOD_META[entry.mood]?.emoji}
                      </span>
                    )}
                  </div>
                  <p className="recent-entry-text" style={{ color: theme.colors.textLight }}>
                    {stripHtml(entry.content).substring(0,110)}{stripHtml(entry.content).length > 110 ? "…" : ""}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Wellness Tips ── */}
        <motion.div variants={fadeUp} custom={9} initial="hidden" animate="visible">
          <h2 className="dash-section-title" style={{ color: theme.colors.text }}>💡 Daily Wellness Tips</h2>
          <div className="dash-tips-row">
            {[
              { tip:"Take 5 deep breaths to reset your nervous system.",   icon:"💨", color:"#4A90E2" },
              { tip:"Write 3 things you're grateful for today.",           icon:"🙏", color:"#F39C12" },
              { tip:"A 10-minute walk can significantly boost your mood.", icon:"🚶", color:"#7FB069" },
            ].map((t, i) => (
              <motion.div
                key={i} className="dash-tip glass"
                style={{ background: theme.colors.surface, borderTop:`3px solid ${t.color}` }}
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0, transition:{ delay:0.5+i*0.1 } }}
                whileHover={{ y:-4 }}
              >
                <span className="tip-icon" style={{ background:`${t.color}22`, color:t.color }}>{t.icon}</span>
                <p style={{ color: theme.colors.textLight }}>{t.tip}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
      <Footer />
    </div>
  );
}
