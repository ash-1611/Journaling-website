import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import PlaylistGrid from "../components/PlaylistGrid";
import MusicPlayer from "../components/MusicPlayer";
import "./Music.css";

export default function Music() {
  const { theme } = useTheme();

  return (
    <div className="music-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar />
      <Sidebar />

      <div className="music-container">
        <header className="music-header">
          <motion.h1
            initial={{ opacity: 0, y: -22 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: theme.colors.text }}
          >
            🎵 Calming Playlists
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            style={{ color: theme.colors.textLight }}
          >
            Curated soundscapes for focus, relaxation, sleep, and anxiety relief.
          </motion.p>
        </header>

        <PlaylistGrid />
      </div>

      {/* Floating Spotify-style player — only visible when a song is loaded */}
      <MusicPlayer />

      <Footer />
    </div>
  );
}
