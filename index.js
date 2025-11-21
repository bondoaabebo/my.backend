// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { cfg } from "./config.js";
import authRoutes from "./routes/auth.js";

const app = express();

// ✅ قائمة الدومينات المسموح بها
const allowedOrigins = [
  "https://frontend-two-inky-65.vercel.app",
  "https://frontend-git-main-bondoaas-projects.vercel.app",
  "https://frontend-epojns9gm-bondoaas-projects.vercel.app"
];

// ✅ إعداد CORS لجميع الدومينات المسموح بها
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ السماح لجميع preflight requests
app.options("*", cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ قراءة JSON من الطلبات
app.use(express.json());

// 🔗 اتصال قاعدة البيانات
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(cfg.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

// 🧭 Route تجريبي للتأكد من تشغيل السيرفر و CORS
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.json({ message: "✅ Backend running and CORS OK" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Database connection failed" });
  }
});

// 🧪 مسار تجريبي للتأكد من CORS
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ CORS working!" });
});

// 🔐 مسارات المصادقة
app.use("/auth", authRoutes);

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
