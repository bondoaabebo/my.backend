import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { cfg } from "./config.js";

// =========================
// Routes
// =========================
import authRoutes from "./routes/auth.js";
import adminsRoutes from "./routes/admins.js";
import licenseRoutes from "./routes/License.js";
import playbackRoutes from "./routes/playback.js";
import coursesRoutes from "./routes/courses.js";
import voucherRoutes from "./routes/voucher.js";

const app = express();

// =========================
// Fix __dirname (ESM)
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// CORS (محكوم ومؤمن)
// =========================
app.use(
  cors({
    origin: (origin, callback) => {
      // السماح بالـ server-side requests
      if (!origin) return callback(null, true);

      if (cfg.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`),
        false
      );
    },
    credentials: true,
  })
);

app.options("*", cors());

// =========================
// Middlewares
// =========================
app.use(express.json());

// =========================
// 🎥 Serve videos
// =========================
app.use(
  "/videos",
  express.static(path.join(__dirname, "videos"))
);

// =========================
// MongoDB
// =========================
mongoose
  .connect(cfg.mongoUri)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.error("❌ MongoDB Error:", err.message)
  );

// =========================
// API routes
// =========================
app.get("/api/test", (req, res) => {
  res.json({ message: "API Working + CORS OK" });
});

app.use("/api/auth", authRoutes);
app.use("/admins", adminsRoutes);
app.use("/api/license", licenseRoutes);
app.use("/api/playback", playbackRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/vouchers", voucherRoutes);

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
