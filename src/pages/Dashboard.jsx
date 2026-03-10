import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Dashboard.css";

export default function Dashboard() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5001/api/journal/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setEntries(res.data))
      .catch(err => console.error("Failed to load journals:", err));
  }, []);

  // Mood options for dashboard preview
  const moodOptions = [
    { id: 'happy', emoji: '😊', label: 'Happy', color: '#FFD93D' },
    { id: 'calm', emoji: '😌', label: 'Calm', color: '#6BCB77' },
    { id: 'sad', emoji: '😢', label: 'Sad', color: '#4D96FF' },
    { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#FF6B6B' },
    { id: 'tired', emoji: '😴', label: 'Tired', color: '#9B59B6' },
    { id: 'angry', emoji: '😡', label: 'Angry', color: '#E74C3C' },
    { id: 'excited', emoji: '😍', label: 'Excited', color: '#F39C12' },
  ];

  // Sort entries by newest first
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Handler to open entry in Journal
  const openEntry = (entry) => {
    localStorage.setItem("openJournalEntry", JSON.stringify(entry));
    navigate("/journal");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="dashboard-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <motion.div
        className="dashboard-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="dashboard-header" variants={itemVariants}>
          <h1 style={{ color: theme.colors.text }}>Dashboard</h1>
          <p style={{ color: theme.colors.textLight }}>
            Welcome back! Here's your wellness overview.
          </p>
        </motion.div>

        <div className="dashboard-grid">
          <motion.div
            className="dashboard-card glass"
            variants={itemVariants}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <div className="dashboard-card-icon">📝</div>
            <h2 style={{ color: theme.colors.text }}>Journal Entries</h2>
            <p className="dashboard-stat" style={{ color: theme.colors.primary }}>
              {entries.length}
            </p>
            <p style={{ color: theme.colors.textLight }}>Total entries</p>
          </motion.div>

          <motion.div
            className="dashboard-card glass"
            variants={itemVariants}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <div className="dashboard-card-icon">📈</div>
            <h2 style={{ color: theme.colors.text }}>Mood Tracking</h2>
            <p className="dashboard-stat" style={{ color: theme.colors.primary }}>
              {sortedEntries.length > 0 ? sortedEntries.length : 0}
            </p>
            <p style={{ color: theme.colors.textLight }}>This week</p>
          </motion.div>

          <motion.div
            className="dashboard-card glass"
            variants={itemVariants}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <div className="dashboard-card-icon">🌿</div>
            <h2 style={{ color: theme.colors.text }}>Wellness Streak</h2>
            <p className="dashboard-stat" style={{ color: theme.colors.primary }}>
              {Math.min(entries.length, 7)}
            </p>
            <p style={{ color: theme.colors.textLight }}>Days active</p>
          </motion.div>
        </div>

        {sortedEntries.length > 0 && (
          <motion.div
            className="dashboard-recent glass"
            variants={itemVariants}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <h2 style={{ color: theme.colors.text, marginBottom: "1.5rem" }}>
              Recent Journal Entries
            </h2>
            <div className="recent-entries">
              {sortedEntries.map((entry, index) => (
                <motion.div
                  key={entry._id || index}
                  className="recent-entry"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    borderLeft: `3px solid ${theme.colors.primary}`,
                  }}
                  onClick={() => openEntry(entry)}
                >
                  <div className="recent-entry-header">
                    <span style={{ color: theme.colors.text, fontWeight: 600 }}>
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    {entry.mood && (
                      <span className="recent-mood" style={{ fontSize: "1.5rem" }}>
                        {typeof entry.mood === "string"
                          ? (moodOptions.find(m => m.id === entry.mood)?.emoji || "")
                          : entry.mood.emoji}
                      </span>
                    )}
                  </div>
                  <p
                    className="recent-entry-text"
                    style={{ color: theme.colors.textLight }}
                  >
                    {entry.content.substring(0, 100)}
                    {entry.content.length > 100 ? "..." : ""}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <Footer />
    </div>
  );
}
