import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import serverless from "serverless-http";
import { cfg } from "../../config.js";

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(cfg.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log("✅ MongoDB connected");
}

// Route تجريبي للتأكد من التشغيل
app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.json({ message: "Backend running on Vercel ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database connection failed ❌" });
  }
});

// تحويل الـ Express app لـ Serverless Function
export const handler = serverless(app);
