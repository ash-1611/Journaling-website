import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Yoga.css";

const poses = [
  {
    id: "childs-pose",
    name: "Child's Pose",
    duration: "2 - 3 min",
    level: "Beginner",
    description: "Gently lengthen the spine and calm the nervous system.",
    icon: "🧘",
  },
  {
    id: "cat-cow",
    name: "Cat-Cow Flow",
    duration: "1 - 2 min",
    level: "Beginner",
    description:
      "Release tension in the back and connect breath with movement.",
    icon: "🌿",
  },
  {
    id: "seated-forward",
    name: "Seated Forward Fold",
    duration: "2 min",
    level: "Beginner",
    description: "Stretch the hamstrings and relax the mind.",
    icon: "🍃",
  },
  {
    id: "legs-up-wall",
    name: "Legs Up The Wall",
    duration: "3 - 5 min",
    level: "Beginner",
    description: "Support circulation and encourage deep relaxation.",
    icon: "🌙",
  },
];

export default function Yoga() {
  const { theme } = useTheme();

  return (
    <div className="yoga-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <div className="yoga-container">
        <header className="yoga-header">
          <h1 style={{ color: theme.colors.text }}>Gentle Yoga</h1>
          <p style={{ color: theme.colors.textLight }}>
            Beginner-friendly poses to help your body unwind and your mind slow
            down.
          </p>
        </header>

        <section className="yoga-grid">
          {poses.map((pose, index) => (
            <motion.article
              key={pose.id}
              className="yoga-card glass"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              style={{
                background: theme.colors.surface,
                boxShadow: `0 8px 32px ${theme.colors.shadow}`,
              }}
            >
              <motion.div
                className="yoga-image"
                initial={{ scale: 0.95, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <div className="yoga-gradient" />
                <div className="yoga-icon">{pose.icon}</div>
              </motion.div>

              <div className="yoga-content">
                <h2 style={{ color: theme.colors.text }}>{pose.name}</h2>
                <p style={{ color: theme.colors.textLight }}>
                  {pose.description}
                </p>

                <div className="yoga-meta">
                  <span
                    className="yoga-pill"
                    style={{ color: theme.colors.primary }}
                  >
                    {pose.duration}
                  </span>
                  <span
                    className="yoga-pill"
                    style={{ color: theme.colors.textLight }}
                  >
                    {pose.level}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </section>
      </div>

      <Footer />
    </div>
  );
}
