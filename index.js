// index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { cfg } from "./config.js";

const app = express();

// 🔹 إعداد CORS
const allowedOrigins = [
   "https://my-frontend-ten-vert.vercel.app/"
];

app.use(cors({
  origin: allowedOrigins,
}));

app.use(express.json());

let isConnected = false;

// 🔗 اتصال قاعدة البيانات
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

// 🧭 Route تجريبي
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.json({ message: "Backend running on Railway ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed ❌" });
  }
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
