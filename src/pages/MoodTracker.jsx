import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import './MoodTracker.css';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_BASE_URL = 'http://localhost:5001';

const moodData = [
  { emoji: '😊', label: 'Happy', value: 8, color: '#FFD93D' },
  { emoji: '😌', label: 'Calm', value: 7, color: '#6BCB77' },
  { emoji: '😢', label: 'Sad', value: 3, color: '#4D96FF' },
  { emoji: '😰', label: 'Anxious', value: 4, color: '#FF6B6B' },
  { emoji: '😴', label: 'Tired', value: 5, color: '#9B59B6' },
  { emoji: '😡', label: 'Angry', value: 2, color: '#E74C3C' },
  { emoji: '🤔', label: 'Thoughtful', value: 6, color: '#3498DB' },
  { emoji: '😍', label: 'Excited', value: 9, color: '#F39C12' },
];

export default function MoodTracker() {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    // Load mood history from backend
    const token = localStorage.getItem('token');
    axios.get(`${API_BASE_URL}/api/mood/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        setMoodHistory(res.data);
      })
      .catch(err => {
        console.error('Failed to load mood history:', err);
      });
  }, []);

  // Generate weekly data
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map((day, index) => {
      // Simulate mood values (in a real app, this would come from actual data)
      return Math.floor(Math.random() * 5) + 5;
    });
    return { labels: days, data };
  };

  const weeklyData = getWeeklyData();

  const chartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Mood Score',
        data: weeklyData.data,
        borderColor: theme.colors.primary,
        backgroundColor: `${theme.colors.primary}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: theme.colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.colors.surface,
        titleColor: theme.colors.text,
        bodyColor: theme.colors.text,
        borderColor: theme.colors.primary,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          color: theme.colors.textLight,
          font: {
            family: 'Poppins',
          },
        },
        grid: {
          color: `${theme.colors.primary}20`,
        },
      },
      x: {
        ticks: {
          color: theme.colors.textLight,
          font: {
            family: 'Poppins',
          },
        },
        grid: {
          color: `${theme.colors.primary}20`,
        },
      },
    },
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
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="mood-tracker-page page-with-sidebar">
      <Navbar />
      <Sidebar />
      
      <motion.div
        className="mood-tracker-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mood-tracker-header"
          variants={itemVariants}
        >
          <h1 style={{ color: theme.colors.text }}>Mood Tracker</h1>
          <p style={{ color: theme.colors.textLight }}>
            Track your emotional patterns and see your progress over time
          </p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          className="period-selector"
          variants={itemVariants}
        >
          {['week', 'month', 'year'].map((period) => (
            <motion.button
              key={period}
              className={`period-button ${selectedPeriod === period ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(period)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: selectedPeriod === period
                  ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.accent})`
                  : theme.colors.surface,
                color: selectedPeriod === period ? 'white' : theme.colors.text,
                border: `2px solid ${selectedPeriod === period ? 'transparent' : theme.colors.primary + '30'}`,
                boxShadow: selectedPeriod === period
                  ? `0 5px 20px ${theme.colors.shadow}`
                  : 'none',
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Chart Section */}
        <motion.div
          className="chart-section glass"
          variants={itemVariants}
          style={{
            background: theme.colors.surface,
            boxShadow: `0 8px 32px ${theme.colors.shadow}`,
          }}
        >
          <h2 style={{ color: theme.colors.text, marginBottom: '1.5rem' }}>
            Weekly Mood Overview
          </h2>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Mood Cards Grid */}
        <motion.div
          className="mood-cards-section"
          variants={itemVariants}
        >
          <h2 style={{ color: theme.colors.text, marginBottom: '2rem' }}>
            Your Mood Patterns
          </h2>
          <div className="mood-cards-grid">
            {moodData.map((mood, index) => (
              <motion.div
                key={index}
                className="mood-card glass"
                style={{
                  background: theme.colors.surface,
                  boxShadow: `0 8px 32px ${theme.colors.shadow}`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <div className="mood-card-emoji">{mood.emoji}</div>
                <h3 style={{ color: theme.colors.text }}>{mood.label}</h3>
                <div className="mood-value-container">
                  <div
                    className="mood-value-bar"
                    style={{
                      background: `linear-gradient(90deg, ${mood.color}, ${mood.color}80)`,
                      width: `${(mood.value / 10) * 100}%`,
                    }}
                  />
                </div>
                <div
                  className="mood-value-text"
                  style={{ color: theme.colors.textLight }}
                >
                  {mood.value}/10
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Insights Section */}
        <motion.div
          className="insights-section glass"
          variants={itemVariants}
          style={{
            background: theme.colors.surface,
            boxShadow: `0 8px 32px ${theme.colors.shadow}`,
          }}
        >
          <h2 style={{ color: theme.colors.text, marginBottom: '1rem' }}>
            💡 Insights
          </h2>
          <p style={{ color: theme.colors.textLight, lineHeight: 1.8 }}>
            Your mood has been generally positive this week! You've been feeling 
            excited and happy most days. Keep up the great work in taking care of 
            your mental wellness. Remember to journal regularly to track your 
            emotional patterns.
          </p>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
}

