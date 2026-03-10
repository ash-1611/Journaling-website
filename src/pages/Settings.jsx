import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Settings.css";

export default function Settings() {
  const { theme } = useTheme();

  const settingsSections = [
    {
      title: "Account",
      items: [
        { label: "Email", value: "user@example.com", editable: true },
        { label: "Password", value: "••••••••", editable: true },
        { label: "Profile Picture", value: "Change", editable: true },
      ],
    },
    {
      title: "Notifications",
      items: [
        { label: "Daily Reminders", value: true, type: "toggle" },
        { label: "Mood Check-ins", value: true, type: "toggle" },
        { label: "Weekly Reports", value: false, type: "toggle" },
      ],
    },
    {
      title: "Privacy",
      items: [
        { label: "Data Export", value: "Download", editable: true },
        { label: "Delete Account", value: "Delete", editable: true, danger: true },
      ],
    },
  ];

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
    <div className="settings-page page-with-sidebar">
      <Navbar />
      <Sidebar />

      <motion.div
        className="settings-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="settings-header" variants={itemVariants}>
          <h1 style={{ color: theme.colors.text }}>Settings</h1>
          <p style={{ color: theme.colors.textLight }}>
            Manage your account preferences and privacy settings
          </p>
        </motion.div>

        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            className="settings-section glass"
            variants={itemVariants}
            style={{
              background: theme.colors.surface,
              boxShadow: `0 8px 32px ${theme.colors.shadow}`,
            }}
          >
            <h2 style={{ color: theme.colors.text, marginBottom: "1.5rem" }}>
              {section.title}
            </h2>

            <div className="settings-items">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.label}
                  className="settings-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  style={{
                    borderBottom: `1px solid ${theme.colors.primary}20`,
                  }}
                >
                  <div className="settings-item-content">
                    <span
                      className="settings-label"
                      style={{ color: theme.colors.text }}
                    >
                      {item.label}
                    </span>
                    {item.type === "toggle" ? (
                      <motion.button
                        className={`settings-toggle ${item.value ? "active" : ""}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: item.value
                            ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                            : theme.colors.textLight + "40",
                        }}
                      >
                        <motion.div
                          className="toggle-thumb"
                          animate={{ x: item.value ? 20 : 0 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        className={`settings-button ${item.danger ? "danger" : ""}`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          color: item.danger ? "#FF6B6B" : theme.colors.primary,
                          border: `2px solid ${item.danger ? "#FF6B6B" : theme.colors.primary}30`,
                        }}
                      >
                        {item.value}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <Footer />
    </div>
  );
}

