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
import licenseRoutes from "./routes/license.js";
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
// ✅ Public files (manifest / assets)
// =========================
app.use(express.static(path.join(__dirname, "public")));

// =========================
// ✅ CORS (حل نهائي)
// =========================
app.use(
  cors({
    origin: (origin, callback) => {
      // Postman / mobile / server-side
      if (!origin) return callback(null, true);

      // أي مشروع Vercel
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Local dev
      if (origin === "http://localhost:5173") {
        return callback(null, true);
      }

      // ❗ ما نكسرش الطلب
      return callback(null, true);
    },
    credentials: true,
  })
);

// لازم للـ preflight
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
// Test Route
// =========================
app.get("/api/test", (req, res) => {
  res.json({ message: "API Working + CORS OK" });
});

// =========================
// API Routes
// =========================
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
