import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { cfg } from "./config.js";
import authRoutes from "./routes/auth.js";

const app = express();

const allowedOrigins = ["https://frontend-seven-beta-22.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(cfg.mongoUri);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

app.get("/", async (req, res) => {
  try {
    await connectDB();
    res.json({ message: "✅ Backend running and CORS OK" });
  } catch (err) {
    res.status(500).json({ error: "❌ Database connection failed" });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "✅ CORS working!" });
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
