const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://journaling-website.vercel.app",
  "https://journaling-website-rbyx01git-aishwaryadas1611-8825s-projects.vercel.app"
];

const isAllowedVercelOrigin = (origin) => {
  return /^https:\/\/journaling-website(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin) || isAllowedVercelOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Preflight requests handler
app.options("*", cors());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Mental Wellness API is running" });
});

// Health check endpoint (simple & no auth needed)
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    message: "Mental Wellness API is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/mood", require("./routes/moodRoutes"));
app.use("/api/music", require("./routes/musicRoutes"));
app.use("/api/exercise",          require("./routes/exerciseRoutes"));
app.use("/api/exercise-progress", require("./routes/exerciseProgressRoutes"));
app.use("/api/yoga", require("./routes/yogaRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

const stickerRoutes = require("./routes/stickerRoutes");
app.use("/api/stickers", stickerRoutes);
app.use("/uploads", express.static("uploads"));

// Playlist + song streaming routes
app.use("/api/playlists", require("./routes/playlistRoutes"));

// AI Mental Wellness Assistant routes
app.use("/api/ai", require("./routes/aiRoutes"));

// Serve static audio files from backend/public/music
// Frontend can fetch:  GET /music/focus.mp3
app.use("/music", express.static(require("path").join(__dirname, "public", "music")));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error"
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
