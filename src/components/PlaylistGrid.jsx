/**
 * PlaylistGrid.jsx
 * Fetches all playlists, shows category tabs, renders PlaylistCard grid.
 * Manages which card is open + lazy-loads songs per card.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { CAT_META } from '../context/MusicContext';
import PlaylistCard from './PlaylistCard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const CATEGORIES = ['All', ...Object.keys(CAT_META)];

export default function PlaylistGrid() {
  const { theme } = useTheme();

  const [playlists,   setPlaylists]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [activeTab,   setActiveTab]   = useState('All');
  const [openId,      setOpenId]      = useState(null);
  const [songsMap,    setSongsMap]    = useState({});    // { [playlistId]: Song[] }
  const [loadingId,   setLoadingId]   = useState(null);  // which playlist is fetching songs

  /* ── Fetch all playlists (cards only, no songs) ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/playlists`);
        if (!res.ok) throw new Error('Could not load playlists');
        setPlaylists(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Lazy-load songs when a card is toggled open ── */
  const handleToggle = async (id) => {
    // Collapse if already open
    if (openId === id) { setOpenId(null); return; }

    setOpenId(id);

    // Songs already cached
    if (songsMap[id]) return;

    setLoadingId(id);
    try {
      const res  = await fetch(`${API}/api/playlists/${id}`);
      const data = await res.json();
      setSongsMap(prev => ({ ...prev, [id]: data.songs || [] }));
    } catch {
      setSongsMap(prev => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = activeTab === 'All'
    ? playlists
    : playlists.filter(p => p.category === activeTab);

  return (
    <div className="playlist-grid-root">
      {/* ── Category tabs ── */}
      <div className="music-tabs">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat}
            className={`music-tab ${activeTab === cat ? 'active' : ''}`}
            style={{
              background: activeTab === cat
                ? `linear-gradient(135deg,${theme.colors.primary},${theme.colors.accent})`
                : 'transparent',
              color:  activeTab === cat ? '#fff' : theme.colors.textLight,
              border: `1.5px solid ${activeTab === cat ? 'transparent' : theme.colors.primary + '35'}`,
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* ── Skeleton loading ── */}
      {loading && (
        <div className="music-loading">
          {[1,2,3,4,5,6].map(i => (
            <div
              key={i}
              className="music-skeleton"
              style={{ background: theme.colors.surface }}
            />
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="music-error" style={{ color: theme.colors.textLight }}>
          ⚠️ {error} — please check the backend is running.
        </div>
      )}

      {/* ── Grid ── */}
      {!loading && !error && (
        <motion.section className="music-grid" layout>
          <AnimatePresence mode="popLayout">
            {filtered.map((playlist, idx) => (
              <PlaylistCard
                key={playlist._id}
                playlist={playlist}
                isOpen={openId === playlist._id}
                onToggle={handleToggle}
                songs={songsMap[playlist._id] || []}
                songsLoading={loadingId === playlist._id}
              />
            ))}
          </AnimatePresence>
        </motion.section>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="music-empty" style={{ color: theme.colors.textLight }}>
          No playlists in this category yet.
        </div>
      )}
    </div>
  );
}
