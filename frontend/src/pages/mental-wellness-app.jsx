import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Exercise.css";

const exerciseCategories = [
  {
    id: "stretching",
    title: "Stretching",
    description: "Release tightness and gently wake up your body.",
    color: "#7FB069",
    items: [
      { name: "Neck & Shoulder Release", minutes: 3, progress: 60 },
      { name: "Full Body Morning Stretch", minutes: 5, progress: 40 },
    ],
  },
  {
    id: "breathing",
    title: "Breathing Exercises",
    description: "Soothe your nervous system with slow, mindful breaths.",
    color: "#4A90E2",
    items: [
      { name: "Box Breathing", minutes: 4, progress: 80 },
      { name: "4-7-8 Breathing", minutes: 3, progress: 50 },
    ],
  },
  {
    id: "morning",
    title: "Morning Movement",
    description: "Light movement to start the day with clarity and energy.",
    color: "#F39C12",
    items: [
      { name: "Gentle Wake-Up Flow", minutes: 6, progress: 30 },
      { name: "Mindful Walk in Place", minutes: 5, progress: 20 },
    ],
  },
];

export default function Exercise() {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState("stretching");

  return (
    <div className="exercise-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <div className="exercise-container">
        <header className="exercise-header">
          <h1 style={{ color: theme.colors.text }}>Gentle Movement</h1>
          <p style={{ color: theme.colors.textLight }}>
            Light, mental-health-friendly exercises to reconnect with your body.
          </p>
        </header>

        <div className="exercise-layout">
          <aside
            className="exercise-sidebar glass"
            style={{ background: theme.colors.surface }}
          >
            {exerciseCategories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  type="button"
                  className={`exercise-tab ${active ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    color: active ? "#fff" : theme.colors.text,
                    background: active
                      ? `linear-gradient(135deg, ${cat.color}, ${theme.colors.accent})`
                      : "transparent",
                  }}
                >
                  {cat.title}
                </motion.button>
              );
            })}
          </aside>

          <section className="exercise-content">
            {exerciseCategories.map((cat) => {
              if (cat.id !== activeCategory) return null;

              return (
                <motion.div
                  key={cat.id}
                  className="exercise-card glass"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background: theme.colors.surface,
                    boxShadow: `0 8px 32px ${theme.colors.shadow}`,
                  }}
                >
                  <h2 style={{ color: theme.colors.text }}>{cat.title}</h2>
                  <p style={{ color: theme.colors.textLight }}>
                    {cat.description}
                  </p>

                  <div className="exercise-items">
                    {cat.items.map((item, index) => (
                      <motion.div
                        key={item.name}
                        className="exercise-item"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <div className="exercise-item-header">
                          <h3 style={{ color: theme.colors.text }}>
                            {item.name}
                          </h3>
                          <span
                            className="exercise-duration"
                            style={{ color: theme.colors.textLight }}
                          >
                            {item.minutes} min
                          </span>
                        </div>

                        <div className="exercise-progress-bar">
                          <motion.div
                            className="exercise-progress-fill"
                            style={{
                              background: `linear-gradient(90deg, ${cat.color}, ${theme.colors.accent})`,
                            }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>

                        <div
                          className="exercise-progress-meta"
                          style={{ color: theme.colors.textLight }}
                        >
                          {item.progress}% complete
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
