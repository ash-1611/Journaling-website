/**
 * PlaylistCard.jsx
 * Single playlist card — cover art, meta info, Play Now button, expandable track list.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useMusic, catMeta } from '../context/MusicContext';

export default function PlaylistCard({ playlist, isOpen, onToggle, songs, songsLoading }) {
  const { theme } = useTheme();
  const { currentSong, isPlaying, loadPlaylist, playSongAt, queue } = useMusic();

  const m        = catMeta(playlist.category);
  const color    = m.color;
  const gradient = playlist.coverGradient || m.gradient;
  const emoji    = playlist.emoji || m.emoji;

  // Is this playlist the active one in the queue?
  const isActivePlaylist = isOpen && songs.length > 0 &&
    queue.some(q => songs.some(s => s._id === q._id));
  const cardPlaying = isActivePlaylist && isPlaying;

  const handlePlayNow = () => {
    if (!isOpen) {
      onToggle(playlist._id);   // open card first; parent will fetch songs
      return;
    }
    if (songs.length > 0) {
      loadPlaylist(playlist, songs, 0);
    }
  };

  const handleSongClick = (song, idx) => {
    // If this playlist is already loaded in the queue, just jump to index
    if (isActivePlaylist) {
      playSongAt(idx);
    } else {
      loadPlaylist(playlist, songs, idx);
    }
  };

  return (
    <motion.article
      className={`music-card glass ${isOpen ? 'music-card--open' : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.25 }}
      style={{
        background:  theme.colors.surface,
        boxShadow:   `0 8px 32px ${theme.colors.shadow}`,
        border:      `2px solid ${isOpen ? color + '55' : 'transparent'}`,
      }}
    >
      {/* ── Cover ── */}
      <div className="music-cover-wrap">
        <motion.div
          className="music-cover"
          style={{ background: gradient }}
          animate={cardPlaying ? { scale: [1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 2.5, repeat: cardPlaying ? Infinity : 0, ease: 'easeInOut' }}
          onClick={() => onToggle(playlist._id)}
        >
          <span className="cover-icon">{emoji}</span>

          {/* Animated waveform */}
          <div className="music-wave">
            {[1, 2, 3, 4, 5].map(b => (
              <motion.span
                key={b}
                className="wave-bar"
                animate={cardPlaying
                  ? { height: ['20%', '90%', '40%', '75%', '20%'] }
                  : { height: '20%' }}
                transition={{
                  duration: 0.75,
                  repeat:   cardPlaying ? Infinity : 0,
                  delay:    b * 0.09,
                  ease:     'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Playing indicator overlay */}
          {cardPlaying && (
            <div className="cover-playing-badge">
              <span className="cover-eq">
                {[1,2,3].map(i => (
                  <motion.span
                    key={i} className="cover-eq-bar"
                    animate={{ scaleY: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
              Now Playing
            </div>
          )}
        </motion.div>

        <span className="music-category-badge" style={{ background: `${color}22`, color }}>
          {playlist.category}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="music-content">
        <h2 style={{ color: theme.colors.text }}>{playlist.title}</h2>
        <p style={{ color: theme.colors.textLight }}>{playlist.description}</p>

        <div className="music-meta">
          <span style={{ color: theme.colors.textLight }}>
            🎵 {playlist.numberOfTracks} tracks
          </span>
          <span style={{ color: theme.colors.textLight }}>
            ⏱ {playlist.duration}
          </span>
          <span style={{ color }}>✨ {playlist.moodTag}</span>
        </div>

        {/* Play / Hide button */}
        <div className="music-card-actions">
          <motion.button
            className="music-play-btn"
            style={{
              borderColor: color,
              color:       isOpen ? '#fff' : color,
              background:  isOpen
                ? `linear-gradient(135deg,${color},${color}cc)`
                : 'transparent',
              boxShadow:   isOpen ? `0 6px 20px ${color}45` : 'none',
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayNow}
          >
            <span>{cardPlaying ? '⏸' : isOpen ? '▶' : '🎶'}</span>
            <span>{cardPlaying ? 'Pause' : isOpen ? 'Play All' : 'Play Now'}</span>
          </motion.button>

          {isOpen && songs.length > 0 && (
            <motion.button
              className="music-hide-btn"
              style={{ color: theme.colors.textLight, borderColor: theme.colors.textLight + '40' }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(playlist._id)}
            >
              Hide Tracks
            </motion.button>
          )}
        </div>

        {/* ── Expandable track list ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="music-song-list"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: 'easeInOut' }}
            >
              {songsLoading ? (
                <div className="song-list-loading">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="song-skeleton" style={{ background: `${color}15` }} />
                  ))}
                </div>
              ) : songs.length === 0 ? (
                <p className="song-empty" style={{ color: theme.colors.textLight }}>
                  No tracks found.
                </p>
              ) : (
                songs.map((song, si) => {
                  const isCurrent = currentSong?._id === song._id;
                  const songPlay  = isCurrent && isPlaying;
                  return (
                    <motion.div
                      key={song._id}
                      className={`song-row ${isCurrent ? 'song-row--active' : ''}`}
                      style={{
                        background: isCurrent ? `${color}18` : 'transparent',
                        borderLeft: `3px solid ${isCurrent ? color : 'transparent'}`,
                      }}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: si * 0.035 } }}
                      whileHover={{ background: `${color}12` }}
                      onClick={() => handleSongClick(song, si)}
                    >
                      {/* Index / playing indicator */}
                      <span
                        className="song-index"
                        style={{ color: isCurrent ? color : theme.colors.textLight }}
                      >
                        {songPlay ? (
                          <span className="song-eq">
                            {[1,2,3].map(i => (
                              <motion.span
                                key={i} className="song-eq-bar"
                                style={{ background: color }}
                                animate={{ scaleY: [0.4, 1, 0.4] }}
                                transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.12 }}
                              />
                            ))}
                          </span>
                        ) : (si + 1)}
                      </span>

                      {/* Track info */}
                      <div className="song-info">
                        <span className="song-title" style={{ color: theme.colors.text }}>
                          {song.title}
                        </span>
                        <span className="song-artist" style={{ color: theme.colors.textLight }}>
                          {song.artist}
                        </span>
                      </div>

                      {/* Duration */}
                      <span className="song-duration" style={{ color: theme.colors.textLight }}>
                        {song.duration}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
