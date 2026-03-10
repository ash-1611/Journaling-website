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

const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
};
app.use(cors(corsOptions));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Mental Wellness API is running" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/journal", require("./routes/journalRoutes"));
app.use("/api/mood", require("./routes/moodRoutes"));
app.use("/api/music", require("./routes/musicRoutes"));
app.use("/api/exercise", require("./routes/exerciseRoutes"));
app.use("/api/yoga", require("./routes/yogaRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));

const stickerRoutes = require("./routes/stickerRoutes");
app.use("/api/stickers", stickerRoutes);
app.use("/uploads", express.static("uploads"));

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
