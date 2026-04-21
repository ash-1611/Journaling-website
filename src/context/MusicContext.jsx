/**
 * MusicContext.jsx
 * Global audio player state — single <audio> element lives here so music
 * persists across navigation and is accessible from any component.
 */
import React, {
  createContext, useContext, useReducer,
  useRef, useEffect, useCallback,
} from 'react';
import API_BASE from '../config/api';

/* ── helpers ─────────────────────────────────────────────────────────── */
export const streamUrl = (songId) =>
  `${API_BASE}/api/playlists/songs/${songId}/stream`;

export const fmtTime = (s) => {
  if (!s || isNaN(s)) return '0:00';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

/* ── category visual meta ───────────────────────────────────────────── */
export const CAT_META = {
  Focus:            { color: '#4A90E2', gradient: 'linear-gradient(135deg,#4A90E2,#7BB8F8)', emoji: '🎯' },
  Relax:            { color: '#C8A8E9', gradient: 'linear-gradient(135deg,#C8A8E9,#EDD8FF)', emoji: '☁️' },
  Sleep:            { color: '#6C5CE7', gradient: 'linear-gradient(135deg,#6C5CE7,#2D3436)', emoji: '🌙' },
  'Anxiety Relief': { color: '#7FB069', gradient: 'linear-gradient(135deg,#7FB069,#B8E6A0)', emoji: '🌿' },
  Energy:           { color: '#F39C12', gradient: 'linear-gradient(135deg,#F39C12,#FDD58C)', emoji: '🌅' },
  Meditation:       { color: '#FF6B6B', gradient: 'linear-gradient(135deg,#FF6B6B,#FFB4A2)', emoji: '🪷' },
};
export const catMeta = (cat) =>
  CAT_META[cat] || { color: '#6C63FF', gradient: 'linear-gradient(135deg,#6C63FF,#48C9B0)', emoji: '🎵' };

/* ── state shape ─────────────────────────────────────────────────────── */
const initialState = {
  queue:        [],          // array of song objects for the active playlist
  queueMeta:    null,        // { title, category, emoji, coverGradient } of active playlist
  currentIndex: -1,          // index inside queue
  isPlaying:    false,
  currentTime:  0,
  duration:     0,
  progress:     0,           // 0-100
  volume:       0.8,
  isMuted:      false,
  isShuffled:   false,
  repeatMode:   'none',      // 'none' | 'one' | 'all'
  showQueue:    false,
};

/* ── reducer ─────────────────────────────────────────────────────────── */
function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_QUEUE':
      return {
        ...state,
        queue:        action.queue,
        queueMeta:    action.meta,
        currentIndex: action.startIndex ?? 0,
        isPlaying:    true,
        currentTime:  0,
        progress:     0,
        duration:     0,
      };
    case 'SET_INDEX':
      return { ...state, currentIndex: action.index, currentTime: 0, progress: 0, duration: 0 };
    case 'SET_PLAYING':   return { ...state, isPlaying: action.value };
    case 'SET_TIME':      return { ...state, currentTime: action.time, progress: action.progress };
    case 'SET_DURATION':  return { ...state, duration: action.duration };
    case 'SET_VOLUME':    return { ...state, volume: action.volume };
    case 'SET_MUTED':     return { ...state, isMuted: action.value };
    case 'TOGGLE_SHUFFLE':return { ...state, isShuffled: !state.isShuffled };
    case 'CYCLE_REPEAT': {
      const map = { none: 'all', all: 'one', one: 'none' };
      return { ...state, repeatMode: map[state.repeatMode] };
    }
    case 'TOGGLE_QUEUE':  return { ...state, showQueue: !state.showQueue };
    case 'CLOSE_QUEUE':   return { ...state, showQueue: false };
    case 'ENDED': {
      if (state.repeatMode === 'one') return { ...state };            // audio element loops itself
      if (state.repeatMode === 'all' || state.currentIndex < state.queue.length - 1) {
        const next = (state.currentIndex + 1) % state.queue.length;
        return { ...state, currentIndex: next, currentTime: 0, progress: 0, duration: 0 };
      }
      return { ...state, isPlaying: false, currentTime: 0, progress: 0 };
    }
    case 'STOP':
      return { ...initialState };
    default:
      return state;
  }
}

/* ── context ─────────────────────────────────────────────────────────── */
const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef(null);

  const currentSong = state.queue[state.currentIndex] ?? null;

  /* ── wire audio element ─────────────────────────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime  = () => dispatch({
      type:     'SET_TIME',
      time:     audio.currentTime,
      progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
    });
    const onMeta  = () => dispatch({ type: 'SET_DURATION', duration: audio.duration });
    const onEnded = () => dispatch({ type: 'ENDED' });
    const onPause = () => dispatch({ type: 'SET_PLAYING', value: false });
    const onPlay  = () => dispatch({ type: 'SET_PLAYING', value: true });

    audio.addEventListener('timeupdate',     onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('play',           onPlay);

    return () => {
      audio.removeEventListener('timeupdate',     onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('play',           onPlay);
    };
  }, []);

  /* ── load new track whenever currentIndex / queue changes ──────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.loop = state.repeatMode === 'one';
    audio.src  = streamUrl(currentSong._id);
    audio.volume = state.isMuted ? 0 : state.volume;
    audio.load();

    if (state.isPlaying) {
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentIndex, state.queue]);

  /* ── play/pause, volume, mute side-effects ─────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [state.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = state.isMuted ? 0 : state.volume;
  }, [state.volume, state.isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = state.repeatMode === 'one';
  }, [state.repeatMode]);

  /* ── auto-advance when ENDED action fires ───────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (state.isPlaying) {
      audio.src = streamUrl(currentSong._id);
      audio.load();
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentIndex]);

  /* ── public API ─────────────────────────────────────────────────── */
  const loadPlaylist = useCallback((playlist, songs, startIndex = 0) => {
    dispatch({
      type:       'LOAD_QUEUE',
      queue:      songs,
      meta:       {
        title:         playlist.title,
        category:      playlist.category,
        emoji:         playlist.emoji || catMeta(playlist.category).emoji,
        coverGradient: playlist.coverGradient || catMeta(playlist.category).gradient,
      },
      startIndex,
    });
  }, []);

  const playSongAt = useCallback((index) => {
    dispatch({ type: 'SET_INDEX', index });
    dispatch({ type: 'SET_PLAYING', value: true });
  }, []);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'SET_PLAYING', value: !state.isPlaying });
  }, [state.isPlaying]);

  const playNext = useCallback(() => {
    if (!state.queue.length) return;
    const next = state.isShuffled
      ? Math.floor(Math.random() * state.queue.length)
      : (state.currentIndex + 1) % state.queue.length;
    dispatch({ type: 'SET_INDEX', index: next });
    dispatch({ type: 'SET_PLAYING', value: true });
  }, [state.queue, state.currentIndex, state.isShuffled]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    // If > 3 s into track, restart; otherwise go to previous
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = state.currentIndex > 0
      ? state.currentIndex - 1
      : state.queue.length - 1;
    dispatch({ type: 'SET_INDEX', index: prev });
    dispatch({ type: 'SET_PLAYING', value: true });
  }, [state.currentIndex, state.queue]);

  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    audio.currentTime = (pct / 100) * audio.duration;
    dispatch({ type: 'SET_TIME', time: audio.currentTime, progress: pct });
  }, []);

  const setVolume = useCallback((v) => dispatch({ type: 'SET_VOLUME', volume: v }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'SET_MUTED', value: !state.isMuted }), [state.isMuted]);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
  const cycleRepeat = useCallback(() => dispatch({ type: 'CYCLE_REPEAT' }), []);
  const toggleQueue = useCallback(() => dispatch({ type: 'TOGGLE_QUEUE' }), []);
  const stop = useCallback(() => {
    audioRef.current?.pause();
    dispatch({ type: 'STOP' });
  }, []);

  return (
    <MusicContext.Provider value={{
      ...state,
      currentSong,
      audioRef,
      loadPlaylist,
      playSongAt,
      togglePlay,
      playNext,
      playPrev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      toggleQueue,
      stop,
    }}>
      {/* Single hidden audio element for the entire app */}
      <audio ref={audioRef} preload="auto" />
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used inside <MusicProvider>');
  return ctx;
}
