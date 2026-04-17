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

// Enhanced CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001"
    ];
    
    // Allow requests with no origin (like mobile apps or Curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Preflight requests handler
app.options("*", cors(corsOptions));

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
