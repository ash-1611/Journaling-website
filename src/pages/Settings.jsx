import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Settings.css";

const API = "http://localhost:5001";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i=0) => ({ opacity:1, y:0, transition:{ duration:0.4, delay:i*0.07 } }),
};

function Toggle({ on, onChange, color }) {
  return (
    <motion.button
      className={`settings-toggle ${on ? "on" : ""}`}
      style={{ background: on ? color : "rgba(128,128,128,0.25)" }}
      onClick={() => onChange(!on)}
      whileTap={{ scale: 0.93 }}
    >
      <motion.div className="toggle-thumb" animate={{ x: on ? 22 : 2 }} transition={{ type:"spring", stiffness:400, damping:25 }} />
    </motion.button>
  );
}

export default function Settings() {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [prefs,   setPrefs]   = useState({
    dailyReminders: true, moodCheckins: true, weeklyReports: false, reminderTime: "09:00"
  });
  const [pwForm,  setPwForm]  = useState({ current: "", next: "", confirm: "" });

  const [saving,  setSaving]  = useState(false);
  const [pwSaving,setPwSaving]= useState(false);
  const [toast,   setToast]   = useState(null); // { msg, type }

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }

    Promise.allSettled([
      axios.get(`${API}/api/profile/me`,  { headers: authHeaders() }),
      axios.get(`${API}/api/settings`,    { headers: authHeaders() }),
    ]).then(([prof, sett]) => {
      if (prof.status === "fulfilled") {
        const u = prof.value.data;
        setProfile({ name: u.name || "", email: u.email || "" });
      }
      if (sett.status === "fulfilled") {
        const s = sett.value.data;
        setPrefs({
          dailyReminders: s.dailyReminders ?? true,
          moodCheckins:   s.moodCheckins   ?? true,
          weeklyReports:  s.weeklyReports  ?? false,
          reminderTime:   s.reminderTime   || "09:00",
        });
      }
    });
  }, [navigate]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/profile/update`, { name: profile.name }, { headers: authHeaders() });
      localStorage.setItem('userName', profile.name);
      showToast("Profile updated ✓");
    } catch { showToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/settings`, prefs, { headers: authHeaders() });
      showToast("Preferences saved ✓");
    } catch { showToast("Failed to save", "error"); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { showToast("Passwords don't match", "error"); return; }
    if (pwForm.next.length < 6) { showToast("Password must be ≥ 6 characters", "error"); return; }
    setPwSaving(true);
    try {
      await axios.put(`${API}/api/settings/change-password`,
        { currentPassword: pwForm.current, newPassword: pwForm.next },
        { headers: authHeaders() }
      );
      showToast("Password changed ✓");
      setPwForm({ current:"", next:"", confirm:"" });
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to change password", "error");
    }
    setPwSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="settings-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar />
      <Sidebar />

      <div className="settings-container">
        <motion.div className="settings-header" variants={fadeUp} custom={0} initial="hidden" animate="visible">
          <h1 style={{ color: theme.colors.text }}>Settings</h1>
          <p style={{ color: theme.colors.textLight }}>Manage your account, preferences, and privacy.</p>
        </motion.div>

        {/* ── Profile ── */}
        <motion.div
          className="settings-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          variants={fadeUp} custom={1} initial="hidden" animate="visible"
        >
          <div className="section-icon-title">
            <span className="section-icon" style={{ background:`${theme.colors.primary}22`, color:theme.colors.primary }}>👤</span>
            <h2 style={{ color: theme.colors.text }}>Profile</h2>
          </div>
          <div className="settings-form-row">
            <label style={{ color: theme.colors.textLight }}>Display Name</label>
            <input
              className="settings-input"
              style={{ background:`${theme.colors.primary}0a`, color:theme.colors.text, borderColor:`${theme.colors.primary}30` }}
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="settings-form-row">
            <label style={{ color: theme.colors.textLight }}>Email</label>
            <input
              className="settings-input disabled"
              style={{ background:`${theme.colors.primary}05`, color:theme.colors.textLight, borderColor:`${theme.colors.primary}20` }}
              value={profile.email}
              disabled
            />
          </div>
          <motion.button
            className="settings-save-btn"
            style={{ background:`linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            disabled={saving}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={handleSaveProfile}
          >
            {saving ? "Saving…" : "Save Profile"}
          </motion.button>
        </motion.div>

        {/* ── Theme ── */}
        <motion.div
          className="settings-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          variants={fadeUp} custom={2} initial="hidden" animate="visible"
        >
          <div className="section-icon-title">
            <span className="section-icon" style={{ background:`${theme.colors.primary}22`, color:theme.colors.primary }}>🎨</span>
            <h2 style={{ color: theme.colors.text }}>Appearance</h2>
          </div>
          <div className="theme-grid">
            {Object.entries(themes).map(([key, t]) => (
              <motion.button
                key={key}
                className={`theme-card ${currentTheme === key ? "active" : ""}`}
                style={{
                  background: t.colors.background,
                  border: `2px solid ${currentTheme === key ? t.colors.primary : "transparent"}`,
                  boxShadow: currentTheme === key ? `0 0 0 2px ${t.colors.primary}` : "none",
                }}
                whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                onClick={() => changeTheme(key)}
              >
                <span style={{ fontSize:"1.4rem" }}>{t.emoji}</span>
                <span className="theme-name" style={{ color: t.colors.text }}>{t.name}</span>
                <div className="theme-dots">
                  {[t.colors.primary, t.colors.accent, t.colors.secondary].map((c,i) => (
                    <span key={i} style={{ background:c, width:10, height:10, borderRadius:"50%", display:"inline-block" }} />
                  ))}
                </div>
                {currentTheme === key && <span className="theme-check">✓</span>}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* ── Notifications ── */}
        <motion.div
          className="settings-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          variants={fadeUp} custom={3} initial="hidden" animate="visible"
        >
          <div className="section-icon-title">
            <span className="section-icon" style={{ background:`${theme.colors.primary}22`, color:theme.colors.primary }}>🔔</span>
            <h2 style={{ color: theme.colors.text }}>Notifications</h2>
          </div>
          {[
            { key:"dailyReminders", label:"Daily Reminders",       desc:"Get a daily nudge to check in." },
            { key:"moodCheckins",   label:"Mood Check-ins",         desc:"Reminder to log your mood." },
            { key:"weeklyReports",  label:"Weekly Wellness Report", desc:"Receive a weekly summary email." },
          ].map((item, i) => (
            <div key={item.key} className="settings-row" style={{ borderBottom:`1px solid ${theme.colors.primary}15` }}>
              <div>
                <span className="row-label" style={{ color: theme.colors.text }}>{item.label}</span>
                <span className="row-desc"  style={{ color: theme.colors.textLight }}>{item.desc}</span>
              </div>
              <Toggle
                on={prefs[item.key]}
                onChange={v => setPrefs(p => ({ ...p, [item.key]: v }))}
                color={theme.colors.primary}
              />
            </div>
          ))}
          <div className="settings-form-row" style={{ marginTop:"0.75rem" }}>
            <label style={{ color: theme.colors.textLight }}>Reminder Time</label>
            <input
              type="time"
              className="settings-input"
              style={{ background:`${theme.colors.primary}0a`, color:theme.colors.text, borderColor:`${theme.colors.primary}30`, maxWidth:140 }}
              value={prefs.reminderTime}
              onChange={e => setPrefs(p => ({ ...p, reminderTime: e.target.value }))}
            />
          </div>
          <motion.button
            className="settings-save-btn"
            style={{ background:`linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            disabled={saving}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={handleSavePrefs}
          >
            {saving ? "Saving…" : "Save Preferences"}
          </motion.button>
        </motion.div>

        {/* ── Change Password ── */}
        <motion.div
          className="settings-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          variants={fadeUp} custom={4} initial="hidden" animate="visible"
        >
          <div className="section-icon-title">
            <span className="section-icon" style={{ background:`${theme.colors.primary}22`, color:theme.colors.primary }}>🔒</span>
            <h2 style={{ color: theme.colors.text }}>Security</h2>
          </div>
          {[
            { key:"current", label:"Current Password",  placeholder:"Enter current password" },
            { key:"next",    label:"New Password",       placeholder:"At least 6 characters" },
            { key:"confirm", label:"Confirm New Password", placeholder:"Repeat new password" },
          ].map(f => (
            <div key={f.key} className="settings-form-row">
              <label style={{ color: theme.colors.textLight }}>{f.label}</label>
              <input
                type="password"
                className="settings-input"
                style={{ background:`${theme.colors.primary}0a`, color:theme.colors.text, borderColor:`${theme.colors.primary}30` }}
                value={pwForm[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <motion.button
            className="settings-save-btn"
            style={{ background:`linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
            disabled={pwSaving}
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={handleChangePassword}
          >
            {pwSaving ? "Updating…" : "Update Password"}
          </motion.button>
        </motion.div>

        {/* ── Danger Zone ── */}
        <motion.div
          className="settings-section glass"
          style={{ background: theme.colors.surface, boxShadow:`0 8px 28px ${theme.colors.shadow}` }}
          variants={fadeUp} custom={5} initial="hidden" animate="visible"
        >
          <div className="section-icon-title">
            <span className="section-icon" style={{ background:"#FF6B6B22", color:"#FF6B6B" }}>⚠️</span>
            <h2 style={{ color: theme.colors.text }}>Account</h2>
          </div>
          <div className="danger-row">
            <div>
              <span className="row-label" style={{ color: theme.colors.text }}>Sign Out</span>
              <span className="row-desc"  style={{ color: theme.colors.textLight }}>Log out of your account on this device.</span>
            </div>
            <motion.button
              className="danger-btn outline"
              style={{ color: theme.colors.primary, borderColor:`${theme.colors.primary}40` }}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
              onClick={handleLogout}
            >
              Sign Out
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`settings-toast ${toast.type}`}
            initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:40 }}
          >
            {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
