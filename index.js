import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { cfg } from "./config.js";
import authRoutes from "./routes/auth.js";

const app = express();

// ✅ قائمة الدومينات المسموح بها
const allowedOrigins = ["https://frontend-seven-beta-22.vercel.app"];

// ✅ إعداد CORS شامل لكل الطلبات
app.use(cors({
  origin: function(origin, callback) {
    // السماح بأي request من frontend أو لو origin مش موجود (Postman مثلاً)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ التعامل مع preflight requests
app.options("*", cors());

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
app.use("/api/auth", authRoutes);

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
