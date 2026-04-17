// src/components/AIHealthBadge.jsx
import React, { useEffect } from 'react';
import { useAI } from '../context/AIContext';
import './AIHealthBadge.css';

export default function AIHealthBadge() {
  const { healthStatus, checkHealth } = useAI();

  // Recheck health every 2 minutes
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  if (!healthStatus) return null;

  const { status, fallbackMode, message } = healthStatus;

  const statusConfig = {
    ok: {
      color: '#10b981',
      label: '🟢 AI Live',
      title: 'Full AI analysis enabled',
    },
    error_api_call: {
      color: '#f59e0b',
      label: '🟡 Using Smart Fallback',
      title: 'AI service unavailable - using accurate keyword-based analysis',
    },
    not_configured: {
      color: '#f59e0b',
      label: '🟡 Smart Fallback Mode',
      title: 'No API key configured - using keyword-based analysis',
    },
    error_invalid_response: {
      color: '#ef4444',
      label: '🔴 System Error',
      title: 'AI response parsing failed',
    },
    unknown: {
      color: '#6b7280',
      label: '⚪ Unknown Status',
      title: 'AI system status unknown',
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;

  return (
    <div
      className="ai-health-badge"
      title={`${config.title}\n\n${message}`}
      style={{ borderColor: config.color, backgroundColor: `${config.color}10` }}
    >
      <span className="ai-health-label" style={{ color: config.color }}>
        {config.label}
      </span>
      {fallbackMode && (
        <span className="ai-health-tooltip">
          💡 Results use intelligent keyword analysis - still very accurate!
        </span>
      )}
    </div>
  );
}
