import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Music.css";

const playlists = [
  {
    id: "focus",
    title: "Deep Focus",
    description: "Gentle beats to keep you in flow.",
    category: "Focus",
    color: "#4A90E2",
    imageGradient: "linear-gradient(135deg, #4A90E2, #8BC6EC)",
  },
  {
    id: "relax",
    title: "Soft Relaxation",
    description: "Unwind and release tension.",
    category: "Relax",
    color: "#C8A8E9",
    imageGradient: "linear-gradient(135deg, #C8A8E9, #F5EFF9)",
  },
  {
    id: "sleep",
    title: "Night Rain & Calm",
    description: "Drift into deep, peaceful sleep.",
    category: "Sleep",
    color: "#6C5CE7",
    imageGradient: "linear-gradient(135deg, #6C5CE7, #2D3436)",
  },
  {
    id: "anxiety",
    title: "Anxiety Relief",
    description: "Soft piano & ambient textures.",
    category: "Anxiety Relief",
    color: "#7FB069",
    imageGradient: "linear-gradient(135deg, #7FB069, #A8D5BA)",
  },
];

export default function Music() {
  const { theme } = useTheme();
  const [currentId, setCurrentId] = useState("focus");
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayToggle = (id) => {
    if (currentId === id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentId(id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="music-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <div className="music-container">
        <header className="music-header">
          <h1 style={{ color: theme.colors.text }}>Calming Playlists</h1>
          <p style={{ color: theme.colors.textLight }}>
            Curated sounds to help you focus, relax, sleep, and soothe anxiety.
          </p>
        </header>

        <section className="music-grid">
          {playlists.map((playlist, index) => {
            const active = currentId === playlist.id;

            return (
              <motion.article
                key={playlist.id}
                className={`music-card glass ${active ? "active" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -10, scale: 1.02 }}
                style={{
                  background: theme.colors.surface,
                  boxShadow: `0 8px 32px ${theme.colors.shadow}`,
                }}
              >
                <div className="music-image-wrapper">
                  <motion.div
                    className="music-image"
                    style={{ background: playlist.imageGradient }}
                    animate={
                      active && isPlaying
                        ? { scale: [1, 1.03, 1] }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: 2,
                      repeat: active && isPlaying ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="music-wave">
                      {[1, 2, 3, 4].map((bar) => (
                        <motion.span
                          key={bar}
                          className="wave-bar"
                          animate={
                            active && isPlaying
                              ? { height: ["20%", "80%", "40%"] }
                              : { height: "20%" }
                          }
                          transition={{
                            duration: 0.9,
                            repeat: active && isPlaying ? Infinity : 0,
                            delay: bar * 0.1,
                            ease: "easeInOut",
                          }}
                          style={{ background: "#fff" }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div className="music-content">
                  <span
                    className="music-chip"
                    style={{ color: playlist.color }}
                  >
                    {playlist.category}
                  </span>
                  <h2 style={{ color: theme.colors.text }}>{playlist.title}</h2>
                  <p style={{ color: theme.colors.textLight }}>
                    {playlist.description}
                  </p>

                  <motion.button
                    type="button"
                    className="music-play-button"
                    onClick={() => handlePlayToggle(playlist.id)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      borderColor: playlist.color,
                      color: active && isPlaying ? "#fff" : playlist.color,
                      background:
                        active && isPlaying
                          ? `linear-gradient(135deg, ${playlist.color}, ${theme.colors.accent})`
                          : "transparent",
                      boxShadow:
                        active && isPlaying
                          ? `0 10px 30px ${playlist.color}50`
                          : "none",
                    }}
                  >
                    <span className="play-icon">
                      {active && isPlaying ? "⏸" : "▶"}
                    </span>
                    <span>{active && isPlaying ? "Pause" : "Play"}</span>
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </section>
      </div>

      <Footer />
    </div>
  );
}
