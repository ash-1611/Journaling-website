/**
 * MusicPlayer.jsx
 * Spotify-style floating bottom player bar with:
 *   - Track info + cover art
 *   - Prev / Play-Pause / Next controls
 *   - Seek bar with live progress fill
 *   - Volume + mute
 *   - Shuffle + Repeat (none / all / one)
 *   - Slide-up Queue panel
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useMusic, catMeta, fmtTime } from '../context/MusicContext';
import './MusicPlayer.css';

/* ── tiny icon components ─────────────────────────────────────────── */
const IconBtn = ({ onClick, title, active, color, children, ...rest }) => (
  <motion.button
    className={`mp-icon-btn ${active ? 'mp-icon-btn--active' : ''}`}
    style={{ color: active ? color : undefined }}
    title={title}
    onClick={onClick}
    whileHover={{ scale: 1.18 }}
    whileTap={{ scale: 0.88 }}
    {...rest}
  >
    {children}
  </motion.button>
);

/* ── seek/volume range with dynamic fill ──────────────────────────── */
function StyledRange({ value, min = 0, max = 100, step = 0.1, onChange, color, className }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      type="range"
      className={`mp-range ${className || ''}`}
      min={min} max={max} step={step}
      value={value}
      onChange={onChange}
      style={{
        '--fill':  color || 'var(--theme-primary, #6C63FF)',
        '--pct':   `${pct}%`,
        background: `linear-gradient(to right,
          ${color || 'var(--theme-primary)'} 0%,
          ${color || 'var(--theme-primary)'} ${pct}%,
          rgba(128,128,128,0.22) ${pct}%,
          rgba(128,128,128,0.22) 100%
        )`,
      }}
    />
  );
}

/* ── Queue Panel ──────────────────────────────────────────────────── */
function QueuePanel({ theme, color }) {
  const { queue, currentIndex, playSongAt, isPlaying, queueMeta } = useMusic();
  return (
    <motion.div
      className="mp-queue-panel glass"
      style={{ background: theme.colors.surface, boxShadow: `0 -8px 40px rgba(0,0,0,0.18)` }}
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      <div className="mp-queue-header" style={{ borderBottom: `1px solid ${color}25` }}>
        <span style={{ color: theme.colors.text, fontWeight: 700, fontSize: '1rem' }}>
          🎵 Queue
        </span>
        {queueMeta && (
          <span style={{ color: theme.colors.textLight, fontSize: '0.8rem' }}>
            {queueMeta.title}
          </span>
        )}
      </div>

      <div className="mp-queue-list">
        {queue.map((song, i) => {
          const active = i === currentIndex;
          const playing = active && isPlaying;
          return (
            <motion.div
              key={song._id}
              className={`mp-queue-row ${active ? 'mp-queue-row--active' : ''}`}
              style={{
                background: active ? `${color}18` : 'transparent',
                borderLeft: `3px solid ${active ? color : 'transparent'}`,
              }}
              whileHover={{ background: `${color}12` }}
              onClick={() => playSongAt(i)}
            >
              <span className="mp-queue-idx" style={{ color: active ? color : theme.colors.textLight }}>
                {playing ? (
                  <span className="song-eq">
                    {[1,2,3].map(j => (
                      <motion.span
                        key={j} className="song-eq-bar"
                        style={{ background: color }}
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                      />
                    ))}
                  </span>
                ) : (i + 1)}
              </span>
              <div className="mp-queue-info">
                <span style={{ color: active ? color : theme.colors.text, fontWeight: active ? 700 : 500, fontSize: '0.88rem' }}>
                  {song.title}
                </span>
                <span style={{ color: theme.colors.textLight, fontSize: '0.75rem' }}>
                  {song.artist}
                </span>
              </div>
              <span style={{ color: theme.colors.textLight, fontSize: '0.75rem' }}>
                {song.duration}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Main Player ──────────────────────────────────────────────────── */
export default function MusicPlayer() {
  const { theme } = useTheme();
  const {
    currentSong, queueMeta,
    isPlaying, currentTime, duration, progress,
    volume, isMuted, isShuffled, repeatMode, showQueue,
    togglePlay, playNext, playPrev, seek,
    setVolume, toggleMute, toggleShuffle, cycleRepeat, toggleQueue, stop,
  } = useMusic();

  if (!currentSong) return null;

  const pMeta = catMeta(queueMeta?.category);
  const color = pMeta.color;
  const grad  = queueMeta?.coverGradient || pMeta.gradient;
  const emoji = queueMeta?.emoji || pMeta.emoji;

  const repeatIcon = repeatMode === 'one' ? '🔂' : repeatMode === 'all' ? '🔁' : '↩️';

  return (
    <>
      {/* Queue Panel — slides up above player */}
      <AnimatePresence>
        {showQueue && (
          <QueuePanel theme={theme} color={color} />
        )}
      </AnimatePresence>

      {/* ── Player bar ── */}
      <motion.div
        className="mp-bar glass"
        style={{
          background:  theme.colors.surface,
          boxShadow:   `0 -2px 40px rgba(0,0,0,0.14), 0 -1px 0 ${color}30`,
          borderTop:   `2px solid ${color}35`,
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* ── Left: track info ── */}
        <div className="mp-left">
          <motion.div
            className="mp-cover"
            style={{ background: grad }}
            animate={isPlaying ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 2.4, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
          >
            <span className="mp-cover-emoji">{emoji}</span>
            {isPlaying && (
              <div className="mp-cover-wave">
                {[1,2,3].map(i => (
                  <motion.span
                    key={i} className="mp-cover-bar"
                    animate={{ scaleY: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.13 }}
                  />
                ))}
              </div>
            )}
          </motion.div>

          <div className="mp-track-info">
            <span className="mp-track-title" style={{ color: theme.colors.text }}>
              {currentSong.title}
            </span>
            <span className="mp-track-artist" style={{ color: theme.colors.textLight }}>
              {currentSong.artist}
              {queueMeta && (
                <span className="mp-track-playlist" style={{ color }}>
                  {' · '}{queueMeta.title}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ── Centre: seek + transport ── */}
        <div className="mp-centre">
          {/* Transport controls */}
          <div className="mp-transport">
            <IconBtn
              onClick={toggleShuffle}
              title="Shuffle"
              active={isShuffled}
              color={color}
            >
              🔀
            </IconBtn>

            <IconBtn onClick={playPrev} title="Previous">
              ⏮
            </IconBtn>

            <motion.button
              className="mp-play-btn"
              style={{
                background: `linear-gradient(135deg,${color},${color}cc)`,
                boxShadow:  `0 4px 20px ${color}55`,
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </motion.button>

            <IconBtn onClick={playNext} title="Next">
              ⏭
            </IconBtn>

            <IconBtn
              onClick={cycleRepeat}
              title={`Repeat: ${repeatMode}`}
              active={repeatMode !== 'none'}
              color={color}
            >
              {repeatIcon}
            </IconBtn>
          </div>

          {/* Progress bar */}
          <div className="mp-progress-row">
            <span className="mp-time" style={{ color: theme.colors.textLight }}>
              {fmtTime(currentTime)}
            </span>
            <StyledRange
              className="mp-seek"
              value={progress}
              onChange={e => seek(parseFloat(e.target.value))}
              color={color}
            />
            <span className="mp-time" style={{ color: theme.colors.textLight }}>
              {fmtTime(duration)}
            </span>
          </div>
        </div>

        {/* ── Right: volume + queue ── */}
        <div className="mp-right">
          <IconBtn
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            style={{ color: theme.colors.textLight }}
          >
            {isMuted || volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊'}
          </IconBtn>

          <StyledRange
            className="mp-volume"
            value={isMuted ? 0 : volume}
            min={0} max={1} step={0.02}
            onChange={e => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) toggleMute();
            }}
            color={color}
          />

          <IconBtn
            onClick={toggleQueue}
            title="Queue"
            active={showQueue}
            color={color}
            style={{ fontSize: '1rem' }}
          >
            ☰
          </IconBtn>

          <IconBtn
            onClick={stop}
            title="Close player"
            style={{ color: theme.colors.textLight, opacity: 0.55 }}
          >
            ✕
          </IconBtn>
        </div>
      </motion.div>
    </>
  );
}
