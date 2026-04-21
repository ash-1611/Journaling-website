import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { MusicProvider } from "./context/MusicContext";
import { AIProvider } from "./context/AIContext";
import Landing from "./pages/Landing";
import Journal from "./pages/Journal";
import MoodTracker from "./pages/MoodTracker";
import Themes from "./pages/Themes";
import Auth from "./pages/Auth";
import Music from "./pages/Music";
import Yoga from "./pages/Yoga";
import Exercise from "./pages/Exercise";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import AIChat from "./pages/AIChat";
import AIAnalytics from "./pages/AIAnalytics";

function App() {
  return (
    <ThemeProvider>
      <MusicProvider>
        <AIProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/mood-tracker" element={<MoodTracker />} />
              <Route path="/music" element={<Music />} />
              <Route path="/yoga" element={<Yoga />} />
              <Route path="/exercise" element={<Exercise />} />
              <Route path="/themes" element={<Themes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/ai-chat" element={<AIChat />} />
              <Route path="/ai-analytics" element={<AIAnalytics />} />
            </Routes>
          </BrowserRouter>
        </AIProvider>
      </MusicProvider>
    </ThemeProvider>
  );
}

export default App;
