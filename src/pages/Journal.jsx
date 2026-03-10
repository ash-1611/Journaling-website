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
  const imageSrc = sticker.src || (sticker.type ? stickerImageMap[sticker.type] : null);
  if (!imageSrc) return null;
  const width = sticker.size || sticker.width || 80;
  const height = sticker.size || sticker.height || 80;
  return (
    <Rnd
      size={{ width, height }}
      position={{ x: sticker.x, y: sticker.y }}
      bounds="parent"
      enableResizing={isActive}
      onDragStop={(e, d) => onDrag(sticker.id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResize(sticker.id, ref.offsetWidth, ref.offsetHeight, position.x, position.y);
      }}
      style={{
        zIndex: isActive ? 100 : 1,
        outline: isActive ? '2px solid #bbb' : 'none',
        pointerEvents: 'auto',
        position: 'absolute',
      }}
      onMouseDown={e => { e.stopPropagation(); onSelect(sticker.id); }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img
          src={imageSrc}
          alt="sticker"
          style={{ width: '100%', height: '100%', pointerEvents: 'none', userSelect: 'none' }}
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
    mood: true,
    tools: true,
    stickers: true,
  });
  const [entries, setEntries] = useState([]);
  const [userStickers, setUserStickers] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const canvasRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    // Fetch journals from backend with JWT
    const token = localStorage.getItem('token');
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
        // Ensure stickers load after save
        setStickers(res.data.stickers || []);
        axios.get(`${API_BASE_URL}/api/journal/user`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => {
            setEntries(r.data);
            if (r.data.length > 0) {
              const latest = r.data[0];
              setStickers(latest.stickers || []);
            }
          });
      } catch (err) {
        console.error('Failed to save journal:', err);
      }
      setActiveStickerId(null);
      if (!options.auto) {
        setTimeout(() => setIsSaving(false), 500);
      } else {
        setIsSaving(false);
      }
    }, [backgroundTheme, content, currentEntryId, lastSavedAt, selectedMood, stickers, title]);

  const handleAddSticker = (stickerDefinition) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();

    const newSticker = {
      id: Date.now(),
      type: stickerDefinition.id,
      x: rect.width / 2 - 40,
      y: rect.height / 2 - 40,
      size: 80
    };

    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  const handleAddUserSticker = (sticker) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const baseSize = Math.min(rect.width, rect.height) * 0.2;
    const newSticker = {
      ...sticker,
      id: Date.now() + Math.random(),
      x: rect.width / 2 - baseSize / 2,
      y: rect.height / 2 - baseSize / 2,
      width: baseSize,
      height: baseSize,
      userUploaded: true,
    };
    setStickers((prev) => [...prev, newSticker]);
    setActiveStickerId(newSticker.id);
    setHasChanges(true);
  };

  const handleStickerUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("sticker", file);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/stickers/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newSticker = {
        id: Date.now(),
        src: res.data.url,
        x: 200,
        y: 150,
        width: 80,
        height: 80
      };
      setUserStickers(prev => [...prev, newSticker]);
    } catch (err) {
      alert("Sticker upload failed.");
    }
  };

  const handleStickerPositionChange = (stickerId, x, y) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === stickerId
          ? {
              ...s,
              x,
              y,
            }
          : s
      )
    );
    setHasChanges(true);
  };

  const handleStickerResize = (stickerId, width, height, x, y) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === stickerId
          ? {
              ...s,
              width,
              height,
              x,
              y,
            }
          : s
      )
    );
    setHasChanges(true);
  };

  const deleteSticker = (stickerId) => {
    setStickers((prev) => prev.filter((s) => s.id !== stickerId));
    setHasChanges(true);
    if (activeStickerId === stickerId) {
      setActiveStickerId(null);
    }
  };

  const bringStickerForward = (stickerId) => {
    setStickers((prev) => {
      const idx = prev.findIndex((s) => s.id === stickerId);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(idx + 1, 0, item);
      return next;
    });
    setHasChanges(true);
  };

  const sendStickerBackward = (stickerId) => {
    setStickers((prev) => {
      const idx = prev.findIndex((s) => s.id === stickerId);
      if (idx <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.splice(idx - 1, 0, item);
      return next;
    });
    setHasChanges(true);
  };

  const togglePanel = (panelKey) => {
    setOpenPanels((prev) => ({
      ...prev,
      [panelKey]: !prev,
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

  const handleStickerSelect = (type) => {
    if (!type || !stickerImageMap[type]) return; // Prevent invalid sticker types
    const newSticker = {
      id: Date.now(),
      type,
      x: 200,
      y: 150,
      size: 80
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) setActiveStickerId(null);
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

  // Sort entries by newest first
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

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
          {/* LEFT: Journal Canvas */}
          <div className="journal-left">
            <div
              className={`journal-canvas theme-${backgroundTheme}`}
              ref={canvasRef}
              onMouseDown={() => setActiveStickerId(null)}
            >
              <div className="journal-canvas-inner" style={{ position: 'relative' }}>
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
                  onMouseDown={() => setActiveStickerId(null)}
                >
                  {stickers.map(sticker =>
                    (sticker.type || sticker.src) && (stickerImageMap[sticker.type] || sticker.src) ? (
                      <Sticker
                        key={sticker.id}
                        sticker={sticker}
                        isActive={activeStickerId === sticker.id}
                        onSelect={setActiveStickerId}
                        onDelete={id => setStickers(prev => prev.filter(s => s.id !== id))}
                        onResize={(id, width, height, x, y) => setStickers(prev => prev.map(s => s.id === id ? { ...s, size: width, width, height, x, y } : s))}
                        onDrag={(id, x, y) => setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s))}
                      />
                    ) : null
                  )}
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
                {isSaving ? 'Saving...' : 'Save Entry'}
              </motion.button>
            </div>
          </div>

          {/* RIGHT: Tools Panel */}
          <div className="journal-right">
            <div
              className="tools-card"
              style={{
                background: theme.colors.surface,
                boxShadow: `0 10px 35px ${theme.colors.shadow}`,
              }}
            >
              <button
                type="button"
                className="tools-card-header"
                onClick={() => togglePanel('mood')}
              >
                <div>
                  <h3 style={{ color: theme.colors.text }}>Mood Picker</h3>
                  <p className="tools-subtitle">
                    Tap a mood to color your page.
                  </p>
                </div>
                <span className="collapse-icon">
                  {openPanels.mood ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openPanels.mood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mood-picker">
                      {moodOptions.map((mood) => {
                        const isActive = selectedMood?.id === mood.id;
                        return (
                          <button
                            key={mood.id}
                            type="button"
                            className={`mood-option ${
                              isActive ? 'active' : ''
                            }`}
                            onClick={() => {
                              setSelectedMood(
                                isActive ? null : mood
                              );
                              setHasChanges(true);
                            }}
                          >
                            <span className="mood-icon">
                              {mood.emoji}
                            </span>
                            <span className="mood-text">
                              {mood.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="tools-card"
              style={{
                background: theme.colors.surface,
                boxShadow: `0 10px 35px ${theme.colors.shadow}`,
              }}
            >
              <button
                type="button"
                className="tools-card-header"
                onClick={() => togglePanel('tools')}
              >
                <div>
                  <h3 style={{ color: theme.colors.text }}>Journal Tools</h3>
                  <p className="tools-subtitle">
                    Decorate your page with calming elements.
                  </p>
                </div>
                <span className="collapse-icon">
                  {openPanels.tools ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openPanels.tools && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="journal-tools-grid">
                      <button
                        type="button"
                        className="journal-tool-btn"
                        onClick={() => {
                          const randomSticker =
                            stickerOptions[
                              Math.floor(
                                Math.random() * stickerOptions.length
                              )
                            ];
                          handleAddSticker(randomSticker);
                        }}
                      >
                        <span className="tool-icon">✨</span>
                        <span className="tool-label">
                          Add Sticker
                        </span>
                      </button>

                      <label className="journal-tool-btn">
                        <span className="tool-icon">⬆️</span>
                        <span className="tool-label">Upload Sticker</span>
                        <input
                          type="file"
                          accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                          style={{ display: 'none' }}
                          onChange={handleStickerUpload}
                        />
                      </label>

                      <button
                        type="button"
                        className="journal-tool-btn"
                        onClick={() =>
                          setShowEmojiBar((prev) => !prev)
                        }
                      >
                        <span className="tool-icon">😊</span>
                        <span className="tool-label">
                          Add Emoji
                        </span>
                      </button>

                      <button
                        type="button"
                        className="journal-tool-btn"
                        onClick={cycleBackgroundTheme}
                      >
                        <span className="tool-icon">🎨</span>
                        <span className="tool-label">
                          Change Background
                        </span>
                      </button>

                      <button
                        type="button"
                        className="journal-tool-btn"
                        onClick={insertQuote}
                      >
                        <span className="tool-icon">💬</span>
                        <span className="tool-label">
                          Add Quote
                        </span>
                      </button>
                    </div>

                    {uploadError && (
                      <div className="upload-error">{uploadError}</div>
                    )}

                    <AnimatePresence>
                      {showEmojiBar && (
                        <motion.div
                          className="emoji-bar"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          {quickEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="emoji-pill"
                              onClick={() =>
                                insertEmojiIntoEditor(emoji)
                              }
                            >
                              {emoji}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="tools-card"
              style={{
                background: theme.colors.surface,
                boxShadow: `0 10px 35px ${theme.colors.shadow}`,
              }}
            >
              <button
                type="button"
                className="tools-card-header"
                onClick={() => togglePanel('stickers')}
              >
                <div>
                  <h3 style={{ color: theme.colors.text }}>
                    Sticker Library
                  </h3>
                  <p className="tools-subtitle">
                    Tap a sticker, then drag and resize on the page.
                  </p>
                </div>
                <span className="collapse-icon">
                  {openPanels.stickers ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openPanels.stickers && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="sticker-library">
                      <div className="sticker-section">
                        <div className="sticker-section-title">Default Stickers</div>
                        <div className="sticker-list">
                          {stickerOptions.map((sticker) => (
                            <button
                              key={sticker.id}
                              type="button"
                              className="sticker-pill"
                              onClick={() => handleStickerSelect(sticker.id)}
                            >
                              <img
                                src={sticker.src}
                                alt={sticker.label}
                                className="sticker-thumb"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="sticker-section">
                        <div className="sticker-section-title">User Stickers</div>
                        <div className="sticker-list">
                          {userStickers.length === 0 && (
                            <div className="sticker-empty">No uploaded stickers yet.</div>
                          )}
                          {userStickers.map((sticker) => (
                            <button
                              key={sticker.id}
                              type="button"
                              className="sticker-pill user-sticker-pill"
                              onClick={() => handleAddUserSticker(sticker)}
                            >
                              <img
                                src={sticker.src}
                                alt="User Sticker"
                                className="sticker-thumb"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="theme-card-grid">
                      {backgroundThemes.map((themeOption) => (
                        <button
                          key={themeOption.id}
                          type="button"
                          className={`theme-card ${
                            backgroundTheme === themeOption.id
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {
                            setBackgroundTheme(themeOption.id);
                            setHasChanges(true);
                          }}
                        >
                          <span className="theme-card-swatch theme-card-swatch--soft-lavender" data-theme={themeOption.id} />
                          <span className="theme-card-label">
                            {themeOption.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        <button className="new-entry-btn" onClick={handleNewEntry} style={{marginBottom: 16}}>
          + New Entry
        </button>
      </motion.div>

      <Footer />
    </div>
  );
}
