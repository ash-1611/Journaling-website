// src/pages/AIChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAI } from '../context/AIContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './AIChat.css';

const QUICK_PROMPTS = [
  "I feel overwhelmed today.",
  "I'm having trouble sleeping.",
  "I feel anxious about the future.",
  "Help me with a breathing exercise.",
  "I need some motivation.",
  "I feel sad and don't know why.",
  "Guide me through a meditation.",
];

const TIPS = [
  "💙 Mindi is here to listen, not judge. Share freely.",
  "🌿 Try to be specific about your feelings for better support.",
  "✨ Remember: seeking support is a sign of strength.",
  "🧘 Mindi can guide you through breathing exercises anytime.",
];

export default function AIChat() {
  const { theme } = useTheme();
  const {
    chatMessages, chatLoading, sendChatMessage, resetChat,
    prediction, fetchMoodPrediction, smartPlaylist, generateSmartPlaylist,
  } = useAI();

  const [input, setInput] = useState('');
  const [playlistForm, setPlaylistForm] = useState({ mood: 'calm', genre: 'ambient', energyLevel: 'low', timeOfDay: 'evening' });
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'playlist' | 'prediction'
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  const primary  = theme.colors.primary;
  const accent   = theme.colors.accent;
  const surface  = theme.colors.surface;
  const bg       = theme.colors.background;
  const text     = theme.colors.text;
  const textLight = theme.colors.textLight;
  const shadow   = theme.colors.shadow;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Fetch mood prediction on mount
  useEffect(() => {
    fetchMoodPrediction();
  }, [fetchMoodPrediction]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || chatLoading) return;
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    await sendChatMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const handleGeneratePlaylist = async () => {
    await generateSmartPlaylist(playlistForm);
  };

  const MOOD_EMOJI = { happy:'😊', calm:'😌', anxious:'😰', sad:'😢', stressed:'😤', motivated:'💪', tired:'😴', neutral:'🙂' };

  return (
    <div className="ai-chat-page" style={{ background: bg, color: text }}>
      <Navbar />
      <Sidebar />

      <div className="ai-chat-layout">
        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <div className="ai-sidebar-panel">
          {/* Mindi branding */}
          <div className="ai-sidebar-brand" style={{ background: surface, boxShadow: `0 4px 20px ${shadow}` }}>
            <div className="ai-sidebar-avatar" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>🤖</div>
            <div>
              <div className="ai-sidebar-brand-name" style={{ color: text }}>Mindi</div>
              <div className="ai-sidebar-brand-sub" style={{ color: textLight }}>AI Wellness Companion</div>
            </div>
          </div>

          {/* Mood prediction card */}
          {prediction && (
            <div style={{ background: surface, borderRadius: 16, padding: '1.1rem 1.3rem', boxShadow: `0 4px 20px ${shadow}` }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: textLight, marginBottom: '0.7rem' }}>
                Tomorrow's Mood Forecast
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{MOOD_EMOJI[prediction.predictedMood] || '🙂'}</span>
                <div>
                  <div style={{ fontWeight: 700, color: primary, textTransform: 'capitalize' }}>{prediction.predictedMood}</div>
                  <div style={{ fontSize: '0.78rem', color: textLight }}>{Math.round(prediction.confidence * 100)}% confidence</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: textLight, marginTop: '0.7rem', lineHeight: 1.55 }}>
                {prediction.recommendation}
              </div>
            </div>
          )}

          {/* Quick prompts */}
          <div>
            <div className="ai-sidebar-section-title" style={{ color: textLight }}>Quick Prompts</div>
            <div className="ai-quick-prompts" style={{ marginTop: '0.5rem' }}>
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  className="ai-quick-prompt-btn"
                  onClick={() => handleQuickPrompt(p)}
                  style={{
                    background: `${primary}10`,
                    color: text,
                    borderColor: `${primary}20`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Wellness tip */}
          <div className="ai-sidebar-tip" style={{ background: `${accent}12`, color: textLight }}>
            {TIPS[tipIdx]}
          </div>

          {/* Smart Playlist link */}
          <button
            onClick={() => setActiveTab(activeTab === 'playlist' ? 'chat' : 'playlist')}
            style={{
              padding: '0.75rem 1rem', borderRadius: 14, border: `1.5px solid ${primary}30`,
              background: activeTab === 'playlist' ? `${primary}18` : 'transparent',
              color: primary, fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'Poppins, sans-serif', textAlign: 'left',
              transition: 'all 0.18s ease',
            }}
          >
            🎵 Generate Smart Playlist
          </button>

          <Link
            to="/journal"
            style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: 14, border: `1.5px solid ${accent}30`,
              background: 'transparent', color: accent, fontWeight: 600, fontSize: '0.85rem',
              textDecoration: 'none', textAlign: 'left', transition: 'all 0.18s ease',
            }}
          >
            📓 Back to Journal
          </Link>
        </div>

        {/* ── Main chat / tool area ─────────────────────────────────── */}
        <div className="ai-chat-main" style={{ background: surface, boxShadow: `0 8px 40px ${shadow}` }}>

          {/* Header */}
          <div className="ai-chat-header" style={{ background: `${primary}08` }}>
            <div className="ai-chat-header-avatar" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff' }}>
              🤖
            </div>
            <div>
              <div className="ai-chat-header-title" style={{ color: text }}>Mindi</div>
              <div className="ai-chat-header-status" style={{ color: textLight }}>
                <span className="ai-status-dot" />
                Online · Empathetic support mode
              </div>
            </div>
            <button
              className="ai-chat-clear-btn"
              onClick={resetChat}
              style={{ color: textLight, borderColor: `${primary}20` }}
            >
              Clear chat
            </button>
          </div>

          {/* Smart Playlist Panel */}
          <AnimatePresence>
            {activeTab === 'playlist' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ borderBottom: `1px solid rgba(255,255,255,0.08)`, overflow: 'hidden' }}
              >
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ fontWeight: 700, color: text, fontSize: '0.95rem' }}>🎵 AI Smart Playlist Generator</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {[
                      { label: 'Mood', key: 'mood', options: ['happy','calm','anxious','sad','stressed','motivated','tired'] },
                      { label: 'Genre', key: 'genre', options: ['ambient','classical','lo-fi','nature','jazz','acoustic'] },
                      { label: 'Energy', key: 'energyLevel', options: ['low','medium','high'] },
                      { label: 'Time of Day', key: 'timeOfDay', options: ['morning','afternoon','evening','night'] },
                    ].map(({ label, key, options }) => (
                      <div key={key}>
                        <label style={{ fontSize: '0.75rem', color: textLight, fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                        <select
                          value={playlistForm[key]}
                          onChange={e => setPlaylistForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{ width: '100%', padding: '0.55rem 0.8rem', borderRadius: 10, border: `1px solid ${primary}30`,
                            background: bg, color: text, fontSize: '0.85rem', fontFamily: 'Poppins, sans-serif', outline: 'none' }}
                        >
                          {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleGeneratePlaylist}
                    style={{ padding: '0.75rem', borderRadius: 12, border: 'none', color: '#fff',
                      background: `linear-gradient(135deg, ${primary}, ${accent})`, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'Poppins, sans-serif', fontSize: '0.9rem' }}
                  >
                    ✨ Generate Playlist
                  </button>
                  {smartPlaylist && (
                    <div style={{ background: `${primary}10`, borderRadius: 14, padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: primary, marginBottom: '0.5rem' }}>🎶 {smartPlaylist.playlistName}</div>
                      {smartPlaylist.songs?.map((s, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', color: textLight, padding: '0.3rem 0', borderBottom: `1px solid ${primary}15`, display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: primary, fontWeight: 600 }}>{i + 1}.</span>{s}
                        </div>
                      ))}
                      <Link to="/music" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.45rem 1rem', borderRadius: 999, background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600 }}>
                        ▶ Go to Music
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div className="ai-chat-messages">
            {chatMessages.length === 0 ? (
              <div className="ai-chat-welcome" style={{ color: textLight }}>
                <div className="ai-chat-welcome-icon">🤖</div>
                <h3 style={{ color: text }}>Hi, I'm Mindi</h3>
                <p>Your compassionate AI wellness companion. I'm here to listen, support, and guide you through whatever you're feeling. How are you doing today?</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-message ${msg.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {msg.role === 'assistant' && (
                    <div className="ai-msg-avatar" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff' }}>🤖</div>
                  )}
                  <div
                    className="ai-msg-bubble"
                    style={msg.role === 'user'
                      ? { background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff' }
                      : { background: `${primary}12`, color: text, border: `1px solid ${primary}20` }
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="ai-msg-avatar" style={{ background: `${accent}30`, color: accent }}>👤</div>
                  )}
                </motion.div>
              ))
            )}

            {/* Typing indicator */}
            {chatLoading && (
              <motion.div
                className="ai-typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="ai-msg-avatar" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff' }}>🤖</div>
                <div className="ai-typing-dots" style={{ background: `${primary}12`, color: primary }}>
                  <span /><span /><span />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="ai-chat-input-area" style={{ background: `${primary}05` }}>
            <div className="ai-chat-input-row">
              <textarea
                ref={textareaRef}
                className="ai-chat-textarea"
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Share how you're feeling… (Enter to send)"
                rows={1}
                style={{ background: bg, color: text, borderColor: `${primary}25` }}
              />
              <button
                className="ai-chat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || chatLoading}
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                ➤
              </button>
            </div>
            <div className="ai-chat-disclaimer" style={{ color: textLight }}>
              Mindi provides emotional support only · Not a substitute for professional mental health care
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
