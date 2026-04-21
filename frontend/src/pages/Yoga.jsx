import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import "./Yoga.css";

const POSES = [
  {
    id: "childs-pose",
    name: "Child's Pose",
    sanskrit: "Balasana",
    duration: 180,
    level: "Beginner",
    category: "Calming",
    icon: "🧘",
    color: "#6BCB77",
    description: "Gently lengthen the spine and calm the nervous system. A resting pose that encourages deep breathing.",
    benefits: ["Releases back tension", "Calms the mind", "Stretches hips"],
    steps: [
      "Start on all fours on your mat.",
      "Sink your hips back toward your heels.",
      "Stretch your arms forward or rest them by your sides.",
      "Let your forehead rest on the mat.",
      "Breathe deeply and hold.",
    ],
  },
  {
    id: "cat-cow",
    name: "Cat–Cow Flow",
    sanskrit: "Marjaryasana-Bitilasana",
    duration: 120,
    level: "Beginner",
    category: "Morning",
    icon: "🌿",
    color: "#7FB069",
    description: "Connect breath with movement to release spinal tension and awaken the body gently.",
    benefits: ["Spinal mobility", "Reduces back pain", "Syncs breath"],
    steps: [
      "Start on hands and knees, wrists under shoulders.",
      "Inhale — drop belly, lift head (Cow).",
      "Exhale — round back, tuck chin (Cat).",
      "Flow slowly for 8–10 breaths.",
    ],
  },
  {
    id: "seated-forward",
    name: "Seated Forward Fold",
    sanskrit: "Paschimottanasana",
    duration: 120,
    level: "Beginner",
    category: "Calming",
    icon: "🍃",
    color: "#4D96FF",
    description: "Stretch the hamstrings and lower back while calming the mind and reducing anxiety.",
    benefits: ["Hamstring stretch", "Calms anxiety", "Stimulates digestion"],
    steps: [
      "Sit with legs extended straight.",
      "Inhale and lengthen the spine.",
      "Exhale and hinge forward from the hips.",
      "Reach for your feet or shins — don't strain.",
      "Hold and breathe for 60–90 seconds.",
    ],
  },
  {
    id: "legs-up-wall",
    name: "Legs Up the Wall",
    sanskrit: "Viparita Karani",
    duration: 300,
    level: "Beginner",
    category: "Restorative",
    icon: "🌙",
    color: "#9B59B6",
    description: "Support circulation and encourage deep relaxation. Ideal before bed.",
    benefits: ["Improves circulation", "Reduces swelling", "Deep relaxation"],
    steps: [
      "Sit sideways next to a wall.",
      "Swing legs up as you lower your back to the floor.",
      "Rest arms alongside your body.",
      "Close your eyes and breathe naturally.",
      "Stay for 3–5 minutes.",
    ],
  },
  {
    id: "warrior-2",
    name: "Warrior II",
    sanskrit: "Virabhadrasana II",
    duration: 60,
    level: "Intermediate",
    category: "Strength",
    icon: "⚔️",
    color: "#F39C12",
    description: "Build strength and focus while opening the hips and chest.",
    benefits: ["Strengthens legs", "Opens hips", "Builds focus"],
    steps: [
      "Stand with feet wide apart.",
      "Turn right foot out 90° and left foot slightly in.",
      "Bend right knee over right ankle.",
      "Extend arms parallel to the floor.",
      "Gaze over your right hand. Hold 30–60s each side.",
    ],
  },
  {
    id: "bridge-pose",
    name: "Bridge Pose",
    sanskrit: "Setu Bandha Sarvangasana",
    duration: 120,
    level: "Beginner",
    category: "Morning",
    icon: "🌉",
    color: "#FF6B6B",
    description: "Strengthen the back and glutes while opening the chest and improving posture.",
    benefits: ["Strengthens back", "Opens chest", "Reduces back pain"],
    steps: [
      "Lie on your back, knees bent, feet flat.",
      "Arms along your sides, palms down.",
      "Press feet into the floor and lift your hips.",
      "Hold for 3–5 breaths then lower slowly.",
      "Repeat 3 times.",
    ],
  },
  {
    id: "tree-pose",
    name: "Tree Pose",
    sanskrit: "Vrksasana",
    duration: 60,
    level: "Beginner",
    category: "Balance",
    icon: "🌳",
    color: "#7FB069",
    description: "Improve balance and mental focus while strengthening the standing leg.",
    benefits: ["Balance & focus", "Strengthens ankles", "Calms the mind"],
    steps: [
      "Stand tall with feet together.",
      "Shift weight to left foot.",
      "Place right foot on inner left thigh or calf (not knee).",
      "Press palms together at heart or raise overhead.",
      "Fix gaze on a still point. Hold 30–60s each side.",
    ],
  },
  {
    id: "corpse-pose",
    name: "Corpse Pose",
    sanskrit: "Savasana",
    duration: 300,
    level: "Beginner",
    category: "Restorative",
    icon: "🕊️",
    color: "#C8A8E9",
    description: "The ultimate relaxation pose. Allows the body to integrate the benefits of practice.",
    benefits: ["Full body relaxation", "Reduces stress", "Integrates practice"],
    steps: [
      "Lie flat on your back, legs slightly apart.",
      "Arms resting at 45°, palms facing up.",
      "Close your eyes and breathe naturally.",
      "Relax every muscle progressively from feet to face.",
      "Stay for 5–10 minutes.",
    ],
  },
];

const CATEGORIES = ["All", ...new Set(POSES.map(p => p.category))];

function Timer({ duration, isRunning, onComplete }) {
  const [remaining, setRemaining] = useState(duration);
  const ref = useRef(null);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (isRunning) {
      ref.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(ref.current);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [isRunning, onComplete]);

  const pct = ((duration - remaining) / duration) * 100;
  const min = Math.floor(remaining / 60);
  const sec = remaining % 60;

  return (
    <div className="yoga-timer">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r="34"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 34}`}
          strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
          style={{ transformOrigin:"center", transform:"rotate(-90deg)" }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <span className="timer-text">{`${min}:${String(sec).padStart(2,"0")}`}</span>
    </div>
  );
}

export default function Yoga() {
  const { theme } = useTheme();
  const [category,      setCategory]     = useState("All");
  const [selected,      setSelected]     = useState(null);
  const [timerRunning,  setTimerRunning] = useState(false);
  const [completed,     setCompleted]    = useState(new Set());
  const [toast,         setToast]        = useState("");

  const filtered = category === "All" ? POSES : POSES.filter(p => p.category === category);
  const pose = POSES.find(p => p.id === selected);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleComplete = () => {
    if (pose) {
      setCompleted(prev => new Set([...prev, pose.id]));
      setTimerRunning(false);
      showToast(`${pose.name} complete! 🎉`);
    }
  };

  return (
    <div className="yoga-page page-with-sidebar" style={{ background: theme.colors.background }}>
      <Navbar />
      <Sidebar />

      <div className="yoga-container">
        <header className="yoga-header">
          <motion.h1 initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ color: theme.colors.text }}>
            🌿 Gentle Yoga
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1, transition:{ delay:0.15 } }} style={{ color: theme.colors.textLight }}>
            Beginner-friendly poses to unwind your body and slow your mind.
          </motion.p>
        </header>

        {/* Progress strip */}
        {completed.size > 0 && (
          <motion.div
            className="yoga-progress-strip glass"
            style={{ background: theme.colors.surface }}
            initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          >
            <span style={{ color: theme.colors.text }}>
              🔥 <strong>{completed.size}</strong> / {POSES.length} poses completed today
            </span>
            <div className="yoga-progress-bar-bg">
              <motion.div
                className="yoga-progress-bar-fill"
                style={{ background:`linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.accent})` }}
                animate={{ width:`${(completed.size/POSES.length)*100}%` }}
                transition={{ duration:0.6 }}
              />
            </div>
          </motion.div>
        )}

        {/* Category filter */}
        <div className="yoga-tabs">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              className={`yoga-tab ${category === cat ? "active" : ""}`}
              style={{
                background: category === cat ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})` : "transparent",
                color: category === cat ? "#fff" : theme.colors.textLight,
                border: `1.5px solid ${category === cat ? "transparent" : theme.colors.primary+"35"}`,
              }}
              whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setCategory(cat)}
            >{cat}</motion.button>
          ))}
        </div>

        {/* Pose grid */}
        <section className="yoga-grid">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.article
                key={p.id}
                className={`yoga-card glass ${selected === p.id ? "selected" : ""} ${completed.has(p.id) ? "done" : ""}`}
                style={{
                  background: theme.colors.surface,
                  boxShadow:`0 8px 28px ${theme.colors.shadow}`,
                  borderColor: selected === p.id ? p.color : "transparent",
                }}
                layout
                initial={{ opacity:0, y:30 }}
                animate={{ opacity:1, y:0, transition:{ delay:i*0.06 } }}
                exit={{ opacity:0, scale:0.9 }}
                whileHover={{ y:-8 }}
                onClick={() => { setSelected(p.id === selected ? null : p.id); setTimerRunning(false); }}
              >
                <div className="yoga-cover" style={{ background:`${p.color}18` }}>
                  <span className="yoga-icon">{p.icon}</span>
                  {completed.has(p.id) && <span className="yoga-done-badge">✓</span>}
                </div>
                <div className="yoga-card-body">
                  <div className="yoga-card-top">
                    <h2 style={{ color: theme.colors.text }}>{p.name}</h2>
                    <span className="yoga-level-badge" style={{ background:`${p.color}22`, color:p.color }}>{p.level}</span>
                  </div>
                  <p className="yoga-sanskrit" style={{ color: p.color }}>{p.sanskrit}</p>
                  <p style={{ color: theme.colors.textLight, fontSize:"0.88rem" }}>{p.description}</p>
                  <div className="yoga-meta-row">
                    <span style={{ color: theme.colors.textLight }}>⏱ {Math.floor(p.duration/60)} min</span>
                    <span style={{ color: theme.colors.textLight }}>📁 {p.category}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </section>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {pose && (
          <motion.div
            className="yoga-detail-overlay"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => { setSelected(null); setTimerRunning(false); }}
          >
            <motion.div
              className="yoga-detail-panel glass"
              style={{ background: theme.colors.surface }}
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:280 }}
              onClick={e => e.stopPropagation()}
            >
              <button className="yoga-panel-close" style={{ color: theme.colors.textLight }}
                onClick={() => { setSelected(null); setTimerRunning(false); }}
              >✕</button>

              <div className="yoga-panel-cover" style={{ background:`${pose.color}18` }}>
                <span style={{ fontSize:"3.5rem" }}>{pose.icon}</span>
              </div>

              <div className="yoga-panel-body">
                <span className="yoga-level-badge" style={{ background:`${pose.color}22`, color:pose.color }}>{pose.level}</span>
                <h2 style={{ color: theme.colors.text }}>{pose.name}</h2>
                <p className="yoga-panel-sanskrit" style={{ color: pose.color }}>{pose.sanskrit}</p>
                <p style={{ color: theme.colors.textLight, lineHeight:1.7 }}>{pose.description}</p>

                {/* Timer */}
                <div className="yoga-timer-row" style={{ color: pose.color }}>
                  <Timer key={pose.id} duration={pose.duration} isRunning={timerRunning} onComplete={handleComplete} />
                  <div className="yoga-timer-btns">
                    <motion.button
                      className="yoga-timer-btn start"
                      style={{ background:`linear-gradient(135deg, ${pose.color}, ${pose.color}bb)` }}
                      whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                      onClick={() => setTimerRunning(p => !p)}
                    >
                      {timerRunning ? "⏸ Pause" : "▶ Start"}
                    </motion.button>
                    {completed.has(pose.id) && (
                      <span className="yoga-panel-done" style={{ color: pose.color }}>✅ Completed!</span>
                    )}
                  </div>
                </div>

                {/* Benefits */}
                <h3 style={{ color: theme.colors.text }}>Benefits</h3>
                <div className="yoga-benefits">
                  {pose.benefits.map((b,i) => (
                    <span key={i} className="yoga-benefit-chip" style={{ background:`${pose.color}18`, color:pose.color }}>
                      ✓ {b}
                    </span>
                  ))}
                </div>

                {/* Steps */}
                <h3 style={{ color: theme.colors.text }}>How to do it</h3>
                <ol className="yoga-steps">
                  {pose.steps.map((s,i) => (
                    <li key={i} className="yoga-step" style={{ borderLeft:`3px solid ${pose.color}` }}>
                      <span className="step-num" style={{ background:`${pose.color}22`, color:pose.color }}>{i+1}</span>
                      <span style={{ color: theme.colors.textLight }}>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="yoga-toast" initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:40 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
