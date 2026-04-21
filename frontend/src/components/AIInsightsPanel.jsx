// src/components/AIInsightsPanel.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../context/AIContext';
import { useTheme } from '../context/ThemeContext';
import AIHealthBadge from './AIHealthBadge';
import './AIInsightsPanel.css';

const MOOD_EMOJI = {
  happy: '😊', calm: '😌', anxious: '😰', sad: '😢',
  stressed: '😤', motivated: '💪', tired: '😴', neutral: '🙂',
};

const MOOD_COLOR = {
  happy: '#FFD93D', calm: '#6BCB77', anxious: '#FF6B6B', sad: '#4D96FF',
  stressed: '#FF9F43', motivated: '#A29BFE', tired: '#9B59B6', neutral: '#74B9FF',
};

function cardVariant(delay = 0) {
  return {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: 'easeOut' } },
  };
}

export default function AIInsightsPanel({ journalText, journalEntryId }) {
  const { theme } = useTheme();
  const { insight, loading, error, analyzeJournal, clearInsight } = useAI();

  const primary = theme.colors.primary;
  const accent  = theme.colors.accent;
  const surface = theme.colors.surface;
  const text    = theme.colors.text;
  const textLight = theme.colors.textLight;
  const shadow  = theme.colors.shadow;

  const moodColor = insight ? (MOOD_COLOR[insight.mood] || primary) : primary;

  const handleAnalyze = async () => {
    const stripped = journalText.replace(/<[^>]*>/g, '').trim();
    if (stripped.length < 10) {
      alert('Please write at least a few sentences before analyzing.');
      return;
    }
    await analyzeJournal(stripped, journalEntryId);
  };

  return (
    <div className="ai-panel">
      {/* ── AI Health Status ───────────────────────────── */}
      <div style={{ marginBottom: '1rem' }}>
        <AIHealthBadge />
      </div>

      {/* ── Analyze Button ─────────────────────────────── */}
      {!insight && (
        <motion.button
          className="ai-analyze-btn"
          onClick={handleAnalyze}
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: `linear-gradient(135deg, ${primary}, ${accent})`,
            boxShadow: `0 8px 24px ${shadow}`,
          }}
        >
          {loading ? (
            <>
              <span className="ai-spinner" />
              Analyzing your entry…
            </>
          ) : (
            <>✨ Analyze with AI</>
          )}
        </motion.button>
      )}

      {/* ── Error ──────────────────────────────────────── */}
      {error && <div className="ai-error">⚠️ {error}</div>}

      {/* ── Insights Cards ────────────────────────────── */}
      <AnimatePresence>
        {insight && (
          <>
            {/* Mood Detection */}
            <motion.div
              className="ai-card"
              style={{ background: surface, boxShadow: `0 8px 28px ${shadow}` }}
              variants={cardVariant(0)}
              initial="hidden" animate="visible" exit="hidden"
            >
              <div className="ai-card-header">
                <span className="ai-card-icon">🧠</span>
                <span className="ai-card-title" style={{ color: textLight }}>Mood Detected</span>
                <button
                  onClick={clearInsight}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.45, fontSize: '1rem', color: text }}
                  title="Clear analysis"
                >✕</button>
              </div>
              <div className="ai-mood-row">
                <span className="ai-mood-emoji">{MOOD_EMOJI[insight.mood] || '🙂'}</span>
                <div className="ai-mood-info">
                  <div className="ai-mood-label" style={{ color: moodColor }}>{insight.mood}</div>
                  <div className="ai-mood-explanation" style={{ color: textLight }}>{insight.explanation}</div>
                  <div className="ai-confidence-bar">
                    <div className="ai-confidence-track">
                      <div
                        className="ai-confidence-fill"
                        style={{ width: `${Math.round(insight.confidence * 100)}%`, background: moodColor }}
                      />
                    </div>
                    <span className="ai-confidence-pct" style={{ color: moodColor }}>
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Affirmations */}
            {insight.affirmations?.length > 0 && (
              <motion.div
                className="ai-card"
                style={{ background: surface, boxShadow: `0 8px 28px ${shadow}` }}
                variants={cardVariant(0.08)}
                initial="hidden" animate="visible" exit="hidden"
              >
                <div className="ai-card-header">
                  <span className="ai-card-icon">💜</span>
                  <span className="ai-card-title" style={{ color: textLight }}>Affirmations for You</span>
                </div>
                <div className="ai-affirmations-list">
                  {insight.affirmations.map((a, i) => (
                    <div
                      key={i}
                      className="ai-affirmation-item"
                      style={{ color: text, background: `${moodColor}12`, borderLeft: `3px solid ${moodColor}` }}
                    >
                      <span className="ai-affirmation-star">✦</span>
                      "{a}"
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Suggestions */}
            {insight.suggestions?.length > 0 && (
              <motion.div
                className="ai-card"
                style={{ background: surface, boxShadow: `0 8px 28px ${shadow}` }}
                variants={cardVariant(0.16)}
                initial="hidden" animate="visible" exit="hidden"
              >
                <div className="ai-card-header">
                  <span className="ai-card-icon">🌿</span>
                  <span className="ai-card-title" style={{ color: textLight }}>Suggested Activities</span>
                </div>
                <div className="ai-suggestions-list">
                  {insight.suggestions.map((s, i) => (
                    <div key={i} className="ai-suggestion-item" style={{ color: text }}>
                      <span
                        className="ai-suggestion-num"
                        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                      >
                        {i + 1}
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommended Playlist */}
            {insight.recommendedPlaylist && (
              <motion.div
                className="ai-card"
                style={{ background: surface, boxShadow: `0 8px 28px ${shadow}` }}
                variants={cardVariant(0.24)}
                initial="hidden" animate="visible" exit="hidden"
              >
                <div className="ai-card-header">
                  <span className="ai-card-icon">🎵</span>
                  <span className="ai-card-title" style={{ color: textLight }}>Recommended Playlist</span>
                </div>
                <div className="ai-playlist-rec">
                  <div className="ai-playlist-art" style={{ background: `linear-gradient(135deg, ${primary}30, ${accent}30)` }}>
                    🎶
                  </div>
                  <div className="ai-playlist-info">
                    <div className="ai-playlist-name" style={{ color: text }}>{insight.recommendedPlaylist}</div>
                    <div className="ai-playlist-sub" style={{ color: textLight }}>
                      Curated for your {insight.mood} mood
                    </div>
                  </div>
                  <Link
                    to="/music"
                    className="ai-playlist-link"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                  >
                    ▶ Listen
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Chat CTA */}
            <motion.div
              variants={cardVariant(0.32)}
              initial="hidden" animate="visible" exit="hidden"
            >
              <Link
                to="/ai-chat"
                className="ai-chat-cta"
                style={{ color: text, background: `${primary}0a` }}
              >
                <div className="ai-chat-cta-icon" style={{ background: `${primary}20` }}>🤖</div>
                <div className="ai-chat-cta-text">
                  <strong style={{ color: text }}>Talk to Mindi</strong>
                  <span style={{ color: textLight }}>Your AI wellness companion is here to listen</span>
                </div>
                <span className="ai-chat-arrow" style={{ color: primary }}>→</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
