// src/context/AIContext.jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001';

const AIContext = createContext(null);

const initialState = {
  insight: null,          // Latest journal analysis result
  analytics: null,        // Emotional analytics data
  prediction: null,       // Mood prediction
  dailySummary: null,     // Daily summary
  smartPlaylist: null,    // AI-generated playlist
  chatMessages: [],       // Chatbot conversation
  healthStatus: null,     // AI system health status
  loading: false,
  chatLoading: false,
  error: null,
};

function aiReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':    return { ...state, loading: action.payload, error: null };
    case 'SET_CHAT_LOADING': return { ...state, chatLoading: action.payload };
    case 'SET_ERROR':      return { ...state, error: action.payload, loading: false };
    case 'SET_INSIGHT':    return { ...state, insight: action.payload, loading: false };
    case 'SET_ANALYTICS':  return { ...state, analytics: action.payload, loading: false };
    case 'SET_PREDICTION': return { ...state, prediction: action.payload, loading: false };
    case 'SET_DAILY_SUMMARY': return { ...state, dailySummary: action.payload, loading: false };
    case 'SET_SMART_PLAYLIST': return { ...state, smartPlaylist: action.payload, loading: false };
    case 'SET_HEALTH_STATUS': return { ...state, healthStatus: action.payload };
    case 'ADD_CHAT_MSG':   return { ...state, chatMessages: [...state.chatMessages, action.payload], chatLoading: false };
    case 'RESET_CHAT':     return { ...state, chatMessages: [] };
    case 'CLEAR_INSIGHT':  return { ...state, insight: null };
    default: return state;
  }
}

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function AIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  // ── Health check on mount ────────────────────────────────────────────────
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/ai/health`);
        dispatch({ type: 'SET_HEALTH_STATUS', payload: data });
      } catch (err) {
        console.warn('AI health check failed:', err.message);
      }
    };
    checkHealth();
  }, []);

  // ── Analyze journal entry ────────────────────────────────────────────────
  const analyzeJournal = useCallback(async (journalText, journalEntryId = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/ai/analyze-journal`,
        { journalText, journalEntryId },
        { headers: getAuthHeader() }
      );
      dispatch({ type: 'SET_INSIGHT', payload: data });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'AI analysis failed.';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return null;
    }
  }, []);

  // ── Generate smart playlist ──────────────────────────────────────────────
  const generateSmartPlaylist = useCallback(async (params) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/ai/smart-playlist`,
        params,
        { headers: getAuthHeader() }
      );
      dispatch({ type: 'SET_SMART_PLAYLIST', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Playlist generation failed.' });
      return null;
    }
  }, []);

  // ── Daily summary ────────────────────────────────────────────────────────
  const fetchDailySummary = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await axios.get(`${API_BASE}/api/ai/daily-summary`, { headers: getAuthHeader() });
      dispatch({ type: 'SET_DAILY_SUMMARY', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load daily summary.' });
      return null;
    }
  }, []);

  // ── Mood prediction ──────────────────────────────────────────────────────
  const fetchMoodPrediction = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await axios.get(`${API_BASE}/api/ai/mood-prediction`, { headers: getAuthHeader() });
      dispatch({ type: 'SET_PREDICTION', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Mood prediction failed.' });
      return null;
    }
  }, []);

  // ── Emotional analytics ──────────────────────────────────────────────────
  const fetchAnalytics = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await axios.get(`${API_BASE}/api/ai/analytics`, { headers: getAuthHeader() });
      dispatch({ type: 'SET_ANALYTICS', payload: data });
      return data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Analytics fetch failed.' });
      return null;
    }
  }, []);

  // ── Chat with therapist ──────────────────────────────────────────────────
  const sendChatMessage = useCallback(async (userMessage) => {
    const userMsg = { role: 'user', content: userMessage };
    dispatch({ type: 'ADD_CHAT_MSG', payload: userMsg });
    dispatch({ type: 'SET_CHAT_LOADING', payload: true });

    // Build message history including current message
    const allMessages = [...state.chatMessages, userMsg];

    try {
      const { data } = await axios.post(
        `${API_BASE}/api/ai/chat`,
        { messages: allMessages },
        { headers: getAuthHeader() }
      );
      dispatch({ type: 'ADD_CHAT_MSG', payload: { role: 'assistant', content: data.reply } });
      return data.reply;
    } catch (err) {
      const errMsg = "I'm having a moment of quiet. Please try again. 💙";
      dispatch({ type: 'ADD_CHAT_MSG', payload: { role: 'assistant', content: errMsg } });
      dispatch({ type: 'SET_CHAT_LOADING', payload: false });
      return null;
    }
  }, [state.chatMessages]);

  // ── Health check ────────────────────────────────────────────────────────
  const checkHealth = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/ai/health`);
      dispatch({ type: 'SET_HEALTH_STATUS', payload: data });
      return data;
    } catch (err) {
      console.error('Health check failed:', err.message);
      return null;
    }
  }, []);

  const resetChat = useCallback(() => dispatch({ type: 'RESET_CHAT' }), []);
  const clearInsight = useCallback(() => dispatch({ type: 'CLEAR_INSIGHT' }), []);

  return (
    <AIContext.Provider value={{
      ...state,
      analyzeJournal,
      generateSmartPlaylist,
      fetchDailySummary,
      fetchMoodPrediction,
      fetchAnalytics,
      sendChatMessage,
      checkHealth,
      resetChat,
      clearInsight,
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
}
