// src/pages/AIAnalytics.jsx
import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAI } from '../context/AIContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import './AIAnalytics.css';

const MOOD_COLOR = {
  happy: '#FFD93D', calm: '#6BCB77', anxious: '#FF6B6B', sad: '#4D96FF',
  stressed: '#FF9F43', motivated: '#A29BFE', tired: '#9B59B6', neutral: '#74B9FF',
};
const MOOD_EMOJI = {
  happy:'😊', calm:'😌', anxious:'😰', sad:'😢', stressed:'😤', motivated:'💪', tired:'😴', neutral:'🙂',
};

// Simple SVG line chart
function TrendLine({ data, color, width = 600, height = 120 }) {
  const points = data.filter(d => d.score !== null);
  if (points.length < 2) return (
    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.4, fontSize: '0.85rem' }}>
      Keep journaling to see your trend line!
    </div>
  );

  const minScore = 1, maxScore = 5;
  const step = width / (data.length - 1);
  const scaleY = (s) => height - ((s - minScore) / (maxScore - minScore)) * (height - 20) - 10;

  // Build SVG path only over non-null points
  let pathD = '';
  data.forEach((d, i) => {
    if (d.score === null) return;
    const x = i * step;
    const y = scaleY(d.score);
    pathD += pathD === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
  });

  // Area fill
  const firstNonNull = data.findIndex(d => d.score !== null);
  const lastNonNull  = data.slice().reverse().findIndex(d => d.score !== null);
  const lastIdx = data.length - 1 - lastNonNull;
  const areaD = `${pathD} L ${lastIdx * step} ${height} L ${firstNonNull * step} ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-line-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#trendGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => d.score !== null && (
        <circle key={i} cx={i * step} cy={scaleY(d.score)} r="4" fill={color} />
      ))}
      {/* X-axis labels — every 3rd */}
      {data.map((d, i) => i % 3 === 0 && (
        <text key={`label-${i}`} x={i * step} y={height - 1} textAnchor="middle"
          fontSize="10" fill="currentColor" opacity="0.4">
          {d.date}
        </text>
      ))}
    </svg>
  );
}

function LoadingSkeleton({ theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {[300, 180, 220].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 18, background: theme.colors.surface, animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function AIAnalytics() {
  const { theme } = useTheme();
  const { analytics, loading, fetchAnalytics } = useAI();

  const primary = theme.colors.primary;
  const accent  = theme.colors.accent;
  const surface = theme.colors.surface;
  const bg      = theme.colors.background;
  const text    = theme.colors.text;
  const textLight = theme.colors.textLight;
  const shadow  = theme.colors.shadow;

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const totalMoodEntries = useMemo(() => {
    if (!analytics?.moodFrequency) return 0;
    return Object.values(analytics.moodFrequency).reduce((s, v) => s + v, 0);
  }, [analytics]);

  const topMood = useMemo(() => {
    if (!analytics?.moodFrequency) return null;
    const entries = Object.entries(analytics.moodFrequency);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [analytics]);

  const maxWeeklyScore = useMemo(() => {
    if (!analytics?.weeklyTrend?.length) return 5;
    return Math.max(...analytics.weeklyTrend.map(w => w.avgScore), 5);
  }, [analytics]);

  const maxPlaylistCount = useMemo(() => {
    if (!analytics?.playlistUsage) return 1;
    return Math.max(...Object.values(analytics.playlistUsage), 1);
  }, [analytics]);

  return (
    <div className="ai-analytics-page" style={{ background: bg, color: text }}>
      <Navbar />
      <Sidebar />

      <div className="ai-analytics-container">
        {/* Header */}
        <motion.div
          className="ai-analytics-header"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ color: text }}>Emotional Analytics</h1>
            <Link
              to="/ai-chat"
              style={{ padding: '0.45rem 1.1rem', borderRadius: 999, background: `linear-gradient(135deg, ${primary}, ${accent})`,
                color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}
            >
              🤖 Talk to Mindi
            </Link>
          </div>
          <p style={{ color: textLight }}>Your emotional trends and wellness insights over the last 30 days.</p>
        </motion.div>

        {loading && !analytics ? (
          <LoadingSkeleton theme={theme} />
        ) : !analytics || analytics.totalEntries === 0 ? (
          <div className="ai-analytics-empty" style={{ color: textLight }}>
            <div className="ai-analytics-empty-icon">📊</div>
            <h3 style={{ color: text }}>No Data Yet</h3>
            <p>Start journaling and using the AI analysis feature to unlock your emotional analytics dashboard.</p>
            <Link to="/journal" style={{ display: 'inline-block', marginTop: '1.25rem', padding: '0.75rem 1.5rem', borderRadius: 999, background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
              📓 Open Journal
            </Link>
          </div>
        ) : (
          <>
            {/* Improvement banner */}
            {analytics.improvementScore && (
              <motion.div
                className="ai-improvement-banner"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                style={{
                  background: analytics.improvementScore.isImproving
                    ? 'linear-gradient(135deg, rgba(107,203,119,0.12), rgba(107,203,119,0.04))'
                    : 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(255,107,107,0.04))',
                  borderColor: analytics.improvementScore.isImproving ? 'rgba(107,203,119,0.25)' : 'rgba(255,107,107,0.25)',
                }}
              >
                <div className="ai-improvement-icon">
                  {analytics.improvementScore.isImproving ? '📈' : '📉'}
                </div>
                <div className="ai-improvement-text">
                  <strong style={{ color: text }}>
                    {analytics.improvementScore.isImproving
                      ? `Mood improved ${Math.abs(analytics.improvementScore.changePercent)}% this week! 🎉`
                      : `Mood dipped ${Math.abs(analytics.improvementScore.changePercent)}% this week`}
                  </strong>
                  <span style={{ color: textLight }}>
                    Avg score this week: {analytics.improvementScore.recentAvg} / 5 ·
                    Last week: {analytics.improvementScore.previousAvg} / 5
                  </span>
                </div>
              </motion.div>
            )}

            {/* Stat cards */}
            <div className="ai-stat-row">
              {[
                { icon: '📓', value: analytics.totalEntries, label: 'Total Analyses', change: null },
                { icon: '🎭', value: topMood ? (MOOD_EMOJI[topMood] + ' ' + topMood) : '—', label: 'Most Common Mood', change: null },
                { icon: '📊', value: totalMoodEntries, label: 'Mood Data Points', change: null },
                {
                  icon: analytics.improvementScore?.isImproving ? '🌱' : '💙',
                  value: `${analytics.improvementScore?.recentAvg || '—'}/5`,
                  label: 'This Week\'s Avg Score',
                  change: analytics.improvementScore?.changePercent
                    ? { val: analytics.improvementScore.changePercent, positive: analytics.improvementScore.isImproving }
                    : null,
                },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="ai-stat-card"
                  style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.06 }}
                >
                  <span className="ai-stat-icon">{stat.icon}</span>
                  <span className="ai-stat-value" style={{ color: primary }}>{stat.value}</span>
                  <span className="ai-stat-label" style={{ color: textLight }}>{stat.label}</span>
                  {stat.change !== null && (
                    <span className={`ai-stat-change ${stat.change.positive ? 'positive' : 'negative'}`}>
                      {stat.change.positive ? '▲' : '▼'} {Math.abs(stat.change.val)}% vs last week
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="ai-charts-grid">
              {/* Daily mood trend */}
              <motion.div
                className="ai-chart-card wide"
                style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="ai-chart-title" style={{ color: text }}>📈 14-Day Mood Trend</div>
                <div className="ai-trend-chart" style={{ color: textLight }}>
                  <TrendLine data={analytics.dailyTrend || []} color={primary} />
                </div>
              </motion.div>

              {/* Mood frequency */}
              <motion.div
                className="ai-chart-card"
                style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
              >
                <div className="ai-chart-title" style={{ color: text }}>🎭 Mood Distribution</div>
                <div className="mood-freq-bars">
                  {Object.entries(analytics.moodFrequency || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([mood, count]) => (
                      <div key={mood} className="mood-freq-row">
                        <span className="mood-freq-label" style={{ color: text }}>
                          {MOOD_EMOJI[mood]} {mood}
                        </span>
                        <div className="mood-freq-track">
                          <motion.div
                            className="mood-freq-fill"
                            style={{ background: MOOD_COLOR[mood] || primary }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / totalMoodEntries) * 100}%` }}
                            transition={{ duration: 0.9, delay: 0.5 }}
                          />
                        </div>
                        <span className="mood-freq-count" style={{ color: textLight }}>{count}</span>
                      </div>
                    ))}
                </div>
              </motion.div>

              {/* Weekly bar chart */}
              <motion.div
                className="ai-chart-card"
                style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="ai-chart-title" style={{ color: text }}>📅 Weekly Wellness Score</div>
                <div className="weekly-bars">
                  {(analytics.weeklyTrend || []).map((w, i) => {
                    const heightPct = (w.avgScore / maxWeeklyScore) * 100;
                    const isRecent = i === analytics.weeklyTrend.length - 1;
                    return (
                      <div key={i} className="weekly-bar-wrap">
                        <span className="weekly-bar-val" style={{ color: isRecent ? primary : textLight }}>
                          {w.avgScore}
                        </span>
                        <motion.div
                          className="weekly-bar"
                          style={{ background: isRecent ? `linear-gradient(180deg, ${primary}, ${accent})` : `${primary}40` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.9, delay: 0.6 + i * 0.08 }}
                        />
                        <span className="weekly-bar-label" style={{ color: textLight }}>{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Playlist usage */}
              {Object.keys(analytics.playlistUsage || {}).length > 0 && (
                <motion.div
                  className="ai-chart-card"
                  style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                >
                  <div className="ai-chart-title" style={{ color: text }}>🎵 Playlist vs Mood Impact</div>
                  <div className="playlist-usage-list">
                    {Object.entries(analytics.playlistUsage)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([name, count], i) => (
                        <div key={i} className="playlist-usage-row">
                          <span className="playlist-usage-name" style={{ color: text }}>{name}</span>
                          <div className="playlist-usage-track">
                            <motion.div
                              className="playlist-usage-fill"
                              style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(count / maxPlaylistCount) * 100}%` }}
                              transition={{ duration: 0.9, delay: 0.7 + i * 0.05 }}
                            />
                          </div>
                          <span className="playlist-usage-count" style={{ color: textLight }}>{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
