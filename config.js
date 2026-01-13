import dotenv from "dotenv";

dotenv.config();

// تحقق من المتغيرات المهمة
const requiredEnv = ["MONGO_URI", "MASTER_KMS_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
}

export const cfg = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  playbackSecret: process.env.PLAYBACK_SECRET || "default-playback-secret",
  masterKmsKey: process.env.MASTER_KMS_KEY,

  deviceLimit: Number(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: Number(process.env.VOUCHER_DEFAULT_DAYS) || 15,

  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
  ].filter(Boolean),
};

