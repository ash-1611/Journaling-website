import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rnd } from 'react-rnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import leafSticker from '../assets/stickers/leaf.png';
import flowerSticker from '../assets/stickers/flower.png';
import moonSticker from '../assets/stickers/moon.png';
import starSticker from '../assets/stickers/star.png';
import cloudSticker from '../assets/stickers/cloud.png';
import sparkleSticker from '../assets/stickers/sparkle.png';
import heartSticker from '../assets/stickers/heart.png';
import './Journal.css';
import axios from 'axios';
import 'react-resizable/css/styles.css'; // Add this for default resizable styles
import AIInsightsPanel from '../components/AIInsightsPanel';

const API_BASE_URL = 'http://localhost:5001';

const moodOptions = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: '#FFD93D' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: '#6BCB77' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#4D96FF' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#FF6B6B' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#9B59B6' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: '#E74C3C' },
  { id: 'excited', emoji: '😍', label: 'Excited', color: '#F39C12' },
];

const backgroundThemes = [
  { id: 'soft-lavender', label: 'Soft Lavender' },
  { id: 'light-paper', label: 'Light Paper' },
  { id: 'ocean-calm', label: 'Ocean Calm' },
  { id: 'dark-reflection', label: 'Dark Reflection' },
];

const stickerOptions = [
  { id: 'leaf', label: 'Leaf', src: leafSticker },
  { id: 'flower', label: 'Flower', src: flowerSticker },
  { id: 'moon', label: 'Moon', src: moonSticker },
  { id: 'star', label: 'Star', src: starSticker },
  { id: 'cloud', label: 'Cloud', src: cloudSticker },
  { id: 'sparkle', label: 'Sparkle', src: sparkleSticker },
  { id: 'heart', label: 'Heart', src: heartSticker },
];

const stickerImageMap = {
  leaf: leafSticker,
  flower: flowerSticker,
  moon: moonSticker,
  star: starSticker,
  cloud: cloudSticker,
  sparkle: sparkleSticker,
  heart: heartSticker,
};

const quickEmojis = ['😊', '😌', '😢', '😰', '😴', '😡', '😍', '✨'];

const gentleQuotes = [
  '“You are allowed to be both a masterpiece and a work in progress.”',
  '“One small step each day is still progress.”',
  '“Your feelings are valid, your story matters.”',
  '“Breathe in calm, breathe out tension.”',
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
];

// Sticker component for Canva-style editing
function Sticker({ sticker, isActive, onSelect, onDelete, onResize, onDrag }) {
  // Default stickers → use the webpack-bundled import (never prepend API_BASE_URL).
  // Uploaded stickers → sticker.src is a full absolute URL; only prepend if it isn't.
  let imageSrc;
  if (sticker.type && stickerImageMap[sticker.type]) {
    imageSrc = stickerImageMap[sticker.type];
  } else if (sticker.src) {
    imageSrc = sticker.src.startsWith('http')
      ? sticker.src
      : `${API_BASE_URL}${sticker.src}`;
  } else {
    // Nothing to render — skip silently
    return null;
  }

  const width  = sticker.width  || sticker.size || 80;
  const height = sticker.height || sticker.size || 80;
  return (
    <Rnd
      size={{ width, height }}
      position={{ x: sticker.x ?? 50, y: sticker.y ?? 50 }}
      bounds="parent"
      enableResizing={isActive}
      onDragStop={(e, d) => onDrag(sticker.id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResize(sticker.id, ref.offsetWidth, ref.offsetHeight, position.x, position.y);
      }}
      style={{
        zIndex: isActive ? 100 : 1,
        outline: isActive ? '2px dashed #a78bfa' : 'none',
        borderRadius: 4,
        /* Re-enable pointer events — parent sticker-layer is pointer-events:none */
        pointerEvents: 'auto',
        position: 'absolute',
        cursor: 'grab',
      }}
      className="sticker-rnd"
      onMouseDown={e => { e.stopPropagation(); onSelect(sticker.id); }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img
          src={imageSrc}
          alt="sticker"
          style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none', display: 'block' }}
          draggable={false}
        />
        {isActive && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(sticker.id); }}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 22,
              height: 22,
              borderRadius: '50%',
              border: 'none',
              background: 'white',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 200,
            }}
            aria-label="Delete sticker"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="2" x2="10" y2="10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              <line x1="10" y1="2" x2="2" y2="10" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </Rnd>
  );
}

// ── Reusable collapsible sidebar section ─────────────
function SidebarSection({ title, isOpen, onToggle, surface, shadow, children }) {
  return (
    <div
      className="sidebar-section"
      style={{ background: surface, boxShadow: shadow }}
    >
      <button type="button" className="sidebar-section-header" onClick={onToggle}>
        <span className="sidebar-section-title">{title}</span>
        <span className="sidebar-section-icon">{isOpen ? '−' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="sidebar-section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="sidebar-section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Journal() {
  const { theme } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(null);
  const [backgroundTheme, setBackgroundTheme] = useState('soft-lavender');
  const [stickers, setStickers] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [openPanels, setOpenPanels] = useState({
    mood: false,
    tools: false,
    stickers: false,
  });
  const [entries, setEntries] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);

  const canvasRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Fetch journals from backend with JWT
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found. User may not be logged in.');
      return;
    }
    axios.get(`${API_BASE_URL}/api/journal/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        setEntries(res.data);
        // If user navigated from Dashboard, load that entry
        const openEntry = localStorage.getItem("openJournalEntry");
        if (openEntry) {
          const entry = JSON.parse(openEntry);
          setTitle(entry.title || "");
          setContent(entry.content || "");
          setStickers(entry.stickers || []);
          setSelectedMood(entry.mood ? moodOptions.find(m => m.id === entry.mood) : null);
          setBackgroundTheme(entry.backgroundTheme || 'soft-lavender');
          setCurrentEntryId(entry._id || null);
          setLastSavedAt(entry.updatedAt || entry.date || null);
          setActiveStickerId(null);
          localStorage.removeItem("openJournalEntry");
        } else if (res.data.length > 0) {
          const latest = res.data[0];
          setTitle(latest.title || '');
          setContent(latest.content || '');
          setStickers(latest.stickers || []);
          setCurrentEntryId(latest._id || null);
          setLastSavedAt(latest.updatedAt || latest.date || null);
        }
      })
      .catch(err => {
        console.error('Failed to load journals:', err);
      });
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/stickers/list`)
      .then(res => {
        const list = res.data.map(s => {
          const src = s.src && s.src.startsWith('http') ? s.src : `${API_BASE_URL}${s.src}`;
          return { id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, src };
        });
        setUserStickers(list);
      })
      .catch((err) => { console.error('Failed to load user stickers', err); });
  }, []);

  const saveEntry = useCallback(
    async (options = { auto: false }) => {
      // Frontend validation
      if (!title.trim() || !content.trim()) {
        alert("Please enter a title and content before saving.");
        return;
      }
      setIsSaving(true);
      const now = new Date().toISOString();
      const token = localStorage.getItem('token');
      const entry = {
        title: title.trim() || 'Untitled Entry',
        content,
        mood: selectedMood ? selectedMood.id : null,
        stickers,
        backgroundTheme,
        date: now,
      };
      try {
        let res;
        if (currentEntryId) {
          res = await axios.put(
            `${API_BASE_URL}/api/journal/update/${currentEntryId}`,
            entry,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          res = await axios.post(
            `${API_BASE_URL}/api/journal/create`,
            entry,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        setCurrentEntryId(res.data._id);
        setLastSavedAt(res.data.updatedAt || res.data.date || now);
        setHasChanges(false);
        // Refresh entries list in sidebar without touching canvas stickers
        axios.get(`${API_BASE_URL}/api/journal/user`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => setEntries(r.data))
          .catch(() => {});
      } catch (err) {
        console.error('Failed to save journal:', err);
      }
      setActiveStickerId(null);
      if (!options.auto) {
        setTimeout(() => setIsSaving(false), 500);
      } else {
        setIsSaving(false);
      }
    }, [backgroundTheme, content, currentEntryId, selectedMood, stickers, title]);

  const handleAddSticker = (stickerDefinition) => {
    const typeId = typeof stickerDefinition === 'string' ? stickerDefinition : stickerDefinition.id;
    if (!typeId || !stickerImageMap[typeId]) return;

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rect = canvasRef.current?.getBoundingClientRect();
    const SIZE = 80;
    // Place in the middle of the canvas; fall back if ref not ready
    const cx = (rect && rect.width  > SIZE) ? Math.round(rect.width  / 2 - SIZE / 2) : 80;
    const cy = (rect && rect.height > SIZE) ? Math.round(rect.height / 2 - SIZE / 2) : 120;

    setStickers(prev => [...prev, { id: uniqueId, type: typeId, x: cx, y: cy, width: SIZE, height: SIZE }]);
    setActiveStickerId(uniqueId);
    setHasChanges(true);
  };

  // handleStickerSelect is an alias used by the sticker library panel
  const handleStickerSelect = handleAddSticker;

  const handleAddUserSticker = (sticker) => {
    // Normalise src — always a full absolute URL
    const src = sticker.src && sticker.src.startsWith('http')
      ? sticker.src
      : `${API_BASE_URL}${sticker.src}`;
    if (!src) return;

    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rect = canvasRef.current?.getBoundingClientRect();
    const SIZE = 80;
    const cx = (rect && rect.width  > SIZE) ? Math.round(rect.width  / 2 - SIZE / 2) : 80;
    const cy = (rect && rect.height > SIZE) ? Math.round(rect.height / 2 - SIZE / 2) : 120;

    setStickers(prev => [...prev, { id: uniqueId, src, x: cx, y: cy, width: SIZE, height: SIZE }]);
    setActiveStickerId(uniqueId);
    setHasChanges(true);
  };

  const handleStickerUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // Reset input so the same file can be re-selected later
    event.target.value = '';

    const formData = new FormData();
    formData.append("sticker", file);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/stickers/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const fullUrl = res.data.url.startsWith('http')
        ? res.data.url
        : `${API_BASE_URL}${res.data.url}`;
      const newUserSticker = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        src: fullUrl,
      };
      setUserStickers(prev => [...prev, newUserSticker]);
      handleAddUserSticker(newUserSticker);
    } catch (err) {
      console.error('Sticker upload failed', err);
      setUploadError('Sticker upload failed. Please try again.');
      setTimeout(() => setUploadError(''), 4000);
    }
  };

  const togglePanel = (panelKey) => {
    setOpenPanels((prev) => ({
      ...prev,
      [panelKey]: !prev[panelKey],
    }));
  };

  const cycleBackgroundTheme = () => {
    const currentIndex = backgroundThemes.findIndex(
      (t) => t.id === backgroundTheme
    );
    const next =
      backgroundThemes[(currentIndex + 1) % backgroundThemes.length].id;
    setBackgroundTheme(next);
    setHasChanges(true);
  };

  const insertEmojiIntoEditor = (emoji) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) || {
      index: editor.getLength(),
      length: 0,
    };
    editor.insertText(range.index, `${emoji} `);
    editor.setSelection(range.index + emoji.length + 1);
    setHasChanges(true);
  };

  const insertQuote = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const quote =
      gentleQuotes[Math.floor(Math.random() * gentleQuotes.length)];
    const range = editor.getSelection(true) || {
      index: editor.getLength(),
      length: 0,
    };
    editor.insertText(range.index, `\n${quote}\n`, 'italic', true);
    editor.setSelection(range.index + quote.length + 2);
    setHasChanges(true);
  };

  const handleContentChange = (value) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const currentMoodLabel = selectedMood
    ? `${selectedMood.emoji} ${selectedMood.label}`
    : 'No mood selected';

  // Add New Entry button handler
  const handleNewEntry = () => {
    setTitle("");
    setContent("");
    setStickers([]);
    setSelectedMood(null);
    setBackgroundTheme('soft-lavender');
    setCurrentEntryId(null);
    setLastSavedAt(null);
    setActiveStickerId(null);
  };

  // Load entry by ID (for Dashboard integration)
  const loadEntry = (entry) => {
    setTitle(entry.title || "");
    setContent(entry.content || "");
    setStickers(entry.stickers || []);
    setSelectedMood(entry.mood ? moodOptions.find(m => m.id === entry.mood) : null);
    setBackgroundTheme(entry.backgroundTheme || 'soft-lavender');
    setCurrentEntryId(entry._id || null);
    setLastSavedAt(entry.updatedAt || entry.date || null);
    setActiveStickerId(null);
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_BASE_URL}/api/journal/delete/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(prev => prev.filter(e => e._id !== entryId));
      // If we deleted the currently open entry, open the next one or blank
      if (currentEntryId === entryId) {
        const remaining = entries.filter(e => e._id !== entryId);
        if (remaining.length > 0) {
          loadEntry(remaining[0]);
        } else {
          handleNewEntry();
        }
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete entry. Please try again.');
    }
  };

  // Sort entries by newest first
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Strip HTML tags for plain-text preview
  const stripHtml = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    return div.textContent || div.innerText || '';
  };

  return (
    <div className="journal-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <motion.div
        className="journal-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="journal-header"
          variants={itemVariants}
        >
          <h1 style={{ color: theme.colors.text }}>Journal Workspace</h1>
          <p style={{ color: theme.colors.textLight }}>
            Create a calm space to reflect, decorate, and express yourself.
          </p>
        </motion.div>

        <motion.div
          className="journal-layout"
          variants={itemVariants}
        >
          {/* ENTRIES SIDEBAR */}
          <div className="journal-entries" style={{ background: theme.colors.surface, boxShadow: `0 8px 32px ${theme.colors.shadow}` }}>
            <div className="entries-sidebar-header">
              <span style={{ color: theme.colors.text, fontWeight: 600, fontSize: '0.95rem' }}>My Entries</span>
              <button
                type="button"
                className="new-entry-btn"
                onClick={handleNewEntry}
                style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
              >
                + New
              </button>
            </div>
            <div className="entries-sidebar-list">
              {sortedEntries.length === 0 && (
                <div className="entries-sidebar-empty">No entries yet. Start writing!</div>
              )}
              {sortedEntries.map((entry) => {
                const moodObj = moodOptions.find(m => m.id === entry.mood);
                const isActive = currentEntryId === entry._id;
                return (
                  <div
                    key={entry._id}
                    className={`entry-sidebar-card${isActive ? ' active' : ''}`}
                    style={{
                      borderLeft: `3px solid ${isActive ? theme.colors.primary : 'transparent'}`,
                      background: isActive ? `${theme.colors.primary}18` : 'transparent',
                    }}
                  >
                    <button
                      type="button"
                      className="entry-sidebar-card-body"
                      onClick={() => loadEntry(entry)}
                    >
                      <div className="entry-sidebar-title" style={{ color: theme.colors.text }}>
                        {entry.title || 'Untitled'}
                        {moodObj && <span className="entry-sidebar-mood">{moodObj.emoji}</span>}
                      </div>
                      <div className="entry-sidebar-date" style={{ color: theme.colors.textLight }}>
                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="entry-sidebar-preview" style={{ color: theme.colors.textLight }}>
                        {stripHtml(entry.content).slice(0, 60)}{stripHtml(entry.content).length > 60 ? '…' : ''}
                      </div>
                    </button>
                    <button
                      type="button"
                      className="entry-sidebar-delete"
                      title="Delete entry"
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry._id); }}
                      style={{ color: theme.colors.textLight }}
                    >
                      🗑
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER: Journal Canvas */}
          <div className="journal-editor">
            <div className={`journal-canvas theme-${backgroundTheme}`}>
              <div
                className="journal-canvas-inner"
                ref={canvasRef}
                style={{ position: 'relative' }}
                onMouseDown={() => setActiveStickerId(null)}
              >
                <div className="journal-canvas-header">
  <input
    type="text"
    className="journal-title-input"
    placeholder="Title your entry..."
    value={title}
    onChange={handleTitleChange}
    style={{
      color: theme.colors.text
    }}
  />

  <div className="journal-meta">
    <span className="mood-pill">
      {currentMoodLabel}
    </span>

    {lastSavedAt && (
      <span className="autosave-pill">
        Last saved{" "}
        {new Date(lastSavedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })}
      </span>
    )}
  </div>
</div>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Let your thoughts flow here..."
                />
                <div
                  className="sticker-layer"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 50,
                    pointerEvents: 'none',
                  }}
                >
                  {stickers.map(sticker => {
                    const isValid = (sticker.type && stickerImageMap[sticker.type]) || sticker.src;
                    if (!isValid) return null;
                    return (
                      <Sticker
                        key={sticker.id}
                        sticker={sticker}
                        isActive={activeStickerId === sticker.id}
                        onSelect={setActiveStickerId}
                        onDelete={id => { setStickers(prev => prev.filter(s => s.id !== id)); if (activeStickerId === id) setActiveStickerId(null); }}
                        onResize={(id, width, height, x, y) => setStickers(prev => prev.map(s => s.id === id ? { ...s, width, height, x, y } : s))}
                        onDrag={(id, x, y) => setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s))}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="journal-bottom-bar">
              <div className="mode-toggle">
                <button
                  type="button"
                  className={`mode-toggle-btn ${
                    !isPreview ? 'active' : ''
                  }`}
                  onClick={() => setIsPreview(false)}
                >
                  Edit Mode
                </button>
                <button
                  type="button"
                  className={`mode-toggle-btn ${
                    isPreview ? 'active' : ''
                  }`}
                  onClick={() => setIsPreview(true)}
                >
                  Preview Mode
                </button>
              </div>

              <motion.button
                type="button"
                className="primary-save-btn"
                onClick={() => saveEntry({ auto: false })}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`,
                  boxShadow: `0 10px 25px ${theme.colors.shadow}`,
                }}
              >
                {isSaving ? 'Saving…' : hasChanges ? '● Save Entry' : 'Save Entry'}
              </motion.button>

              <motion.button
                type="button"
                className="primary-save-btn"
                onClick={() => setShowAIPanel(v => !v)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  background: showAIPanel
                    ? `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`
                    : `${theme.colors.primary}22`,
                  color: showAIPanel ? '#fff' : theme.colors.primary,
                  boxShadow: 'none',
                  border: `1.5px solid ${theme.colors.primary}40`,
                }}
              >
                {showAIPanel ? '✕ Hide AI' : '✨ AI Insights'}
              </motion.button>
            </div>

            {/* ── AI Insights Panel ─────────────────────────────── */}
            {showAIPanel && (
              <AIInsightsPanel
                journalText={content}
                journalEntryId={currentEntryId}
              />
            )}
          </div>

          {/* RIGHT: Tools Panel */}
          <div className="journal-sidebar">

            {/* ── Mood Picker ── */}
            <SidebarSection
              title="Mood Picker"
              isOpen={openPanels.mood}
              onToggle={() => togglePanel('mood')}
              surface={theme.colors.surface}
              shadow={`0 4px 24px ${theme.colors.shadow}`}
            >
              <div className="mood-picker">
                {moodOptions.map((mood) => {
                  const isActive = selectedMood?.id === mood.id;
                  return (
                    <button
                      key={mood.id}
                      type="button"
                      className={`mood-option${isActive ? ' active' : ''}`}
                      style={isActive ? { borderColor: mood.color, boxShadow: `0 4px 14px ${mood.color}55` } : {}}
                      onClick={() => { setSelectedMood(isActive ? null : mood); setHasChanges(true); }}
                    >
                      <span className="mood-icon">{mood.emoji}</span>
                      <span className="mood-text" style={{ color: theme.colors.text }}>{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </SidebarSection>

            {/* ── Journal Tools ── */}
            <SidebarSection
              title="Journal Tools"
              isOpen={openPanels.tools}
              onToggle={() => togglePanel('tools')}
              surface={theme.colors.surface}
              shadow={`0 4px 24px ${theme.colors.shadow}`}
            >
              <div className="journal-tools-grid">
                <button type="button" className="journal-tool-btn"
                  onClick={() => { const r = stickerOptions[Math.floor(Math.random() * stickerOptions.length)]; handleAddSticker(r); }}>
                  <span className="tool-icon">✨</span>
                  <span className="tool-label">Add Sticker</span>
                </button>

                <label className="journal-tool-btn">
                  <span className="tool-icon">⬆️</span>
                  <span className="tool-label">Upload</span>
                  <input type="file" accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                    style={{ display: 'none' }} onChange={handleStickerUpload} />
                </label>

                <button type="button" className="journal-tool-btn"
                  onClick={() => setShowEmojiBar(p => !p)}>
                  <span className="tool-icon">😊</span>
                  <span className="tool-label">Emoji</span>
                </button>

                <button type="button" className="journal-tool-btn"
                  onClick={cycleBackgroundTheme}>
                  <span className="tool-icon">🎨</span>
                  <span className="tool-label">Theme</span>
                </button>

                <button type="button" className="journal-tool-btn"
                  onClick={insertQuote}>
                  <span className="tool-icon">💬</span>
                  <span className="tool-label">Quote</span>
                </button>
              </div>

              {uploadError && <div className="upload-error">{uploadError}</div>}

              <AnimatePresence>
                {showEmojiBar && (
                  <motion.div className="emoji-bar"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                    {quickEmojis.map(emoji => (
                      <button key={emoji} type="button" className="emoji-pill"
                        onClick={() => insertEmojiIntoEditor(emoji)}>{emoji}</button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </SidebarSection>

            {/* ── Sticker Library ── */}
            <SidebarSection
              title="Sticker Library"
              isOpen={openPanels.stickers}
              onToggle={() => togglePanel('stickers')}
              surface={theme.colors.surface}
              shadow={`0 4px 24px ${theme.colors.shadow}`}
            >
              {/* Default stickers */}
              <p className="sticker-section-title">Default Stickers</p>
              <div className="sticker-grid">
                {stickerOptions.map(sticker => (
                  <button key={sticker.id} type="button" className="sticker-item"
                    title={sticker.label} onClick={() => handleStickerSelect(sticker.id)}>
                    <img src={sticker.src} alt={sticker.label} className="sticker-thumb" />
                  </button>
                ))}
              </div>

              {/* User stickers */}
              <p className="sticker-section-title" style={{ marginTop: '14px' }}>Your Stickers</p>
              {userStickers.length === 0
                ? <p className="sticker-empty">No uploads yet.</p>
                : (
                  <div className="sticker-grid">
                    {userStickers.map(sticker => (
                      <button key={sticker.id} type="button" className="sticker-item user-sticker-item"
                        onClick={() => handleAddUserSticker(sticker)}>
                        <img src={sticker.src} alt="sticker" className="sticker-thumb" />
                      </button>
                    ))}
                  </div>
                )
              }

              {/* Background themes */}
              <p className="sticker-section-title" style={{ marginTop: '14px' }}>Canvas Theme</p>
              <div className="theme-grid">
                {backgroundThemes.map(themeOption => (
                  <button
                    key={themeOption.id}
                    type="button"
                    className={`theme-card${backgroundTheme === themeOption.id ? ' active' : ''}`}
                    onClick={() => { setBackgroundTheme(themeOption.id); setHasChanges(true); }}
                  >
                    <span className="theme-card-swatch" data-theme={themeOption.id} />
                    <span className="theme-card-label">{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </SidebarSection>

          </div>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}
