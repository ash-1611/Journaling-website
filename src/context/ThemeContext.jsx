import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const themes = {
  calmBlue: {
    name: 'Calm Blue',
    emoji: '🌊',
    colors: {
      primary: '#6B9BD1',
      secondary: '#A8D0E6',
      accent: '#4A90E2',
      background: 'linear-gradient(135deg, #E8F4F8 0%, #D1E7F0 100%)',
      surface: 'rgba(255, 255, 255, 0.7)',
      text: '#2C3E50',
      textLight: '#5A6C7D',
      shadow: 'rgba(107, 157, 209, 0.2)',
    },
  },
  softLavender: {
    name: 'Soft Lavender',
    emoji: '🌸',
    colors: {
      primary: '#C8A8E9',
      secondary: '#E6D4F0',
      accent: '#B19CD9',
      background: 'linear-gradient(135deg, #F5EFF9 0%, #E8D5F0 100%)',
      surface: 'rgba(255, 255, 255, 0.7)',
      text: '#4A3A5A',
      textLight: '#6B5B7B',
      shadow: 'rgba(200, 168, 233, 0.2)',
    },
  },
  forestGreen: {
    name: 'Forest Green',
    emoji: '🌿',
    colors: {
      primary: '#7FB069',
      secondary: '#A8D5BA',
      accent: '#5A9A6E',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #D4EDDA 100%)',
      surface: 'rgba(255, 255, 255, 0.7)',
      text: '#2D4A2D',
      textLight: '#5A7A5A',
      shadow: 'rgba(127, 176, 105, 0.2)',
    },
  },
  darkNight: {
    name: 'Dark Night',
    emoji: '🌙',
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      accent: '#5F3DC4',
      background: 'linear-gradient(135deg, #2D3436 0%, #1A1A1A 100%)',
      surface: 'rgba(45, 52, 54, 0.8)',
      text: '#FFFFFF',
      textLight: '#B2BEC3',
      shadow: 'rgba(108, 92, 231, 0.3)',
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved : 'calmBlue';
  });

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    document.documentElement.style.setProperty('--theme-primary', themes[currentTheme].colors.primary);
    document.documentElement.style.setProperty('--theme-secondary', themes[currentTheme].colors.secondary);
    document.documentElement.style.setProperty('--theme-accent', themes[currentTheme].colors.accent);
    document.documentElement.style.setProperty('--theme-background', themes[currentTheme].colors.background);
    document.documentElement.style.setProperty('--theme-surface', themes[currentTheme].colors.surface);
    document.documentElement.style.setProperty('--theme-text', themes[currentTheme].colors.text);
    document.documentElement.style.setProperty('--theme-text-light', themes[currentTheme].colors.textLight);
    document.documentElement.style.setProperty('--theme-shadow', themes[currentTheme].colors.shadow);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, theme: themes[currentTheme], changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

