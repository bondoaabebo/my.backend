import dotenv from "dotenv";
dotenv.config();

// =========================
// Required ENV (في Railway فقط)
// =========================
const requiredEnv = ["MONGO_URI", "MASTER_KMS_KEY"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1); // مهم: مايرميش Error يكسر السيرفر
  }
}

export const cfg = {
  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  playbackSecret: process.env.PLAYBACK_SECRET || "default-playback-secret",
  masterKmsKey: process.env.MASTER_KMS_KEY,

  deviceLimit: Number(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: Number(process.env.VOUCHER_DEFAULT_DAYS) || 15,

  // =========================
  // CORS
  // =========================
  allowedOrigins: [
    "http://localhost:3000",
    "http://localhost:5173",

    // رابط فيرسل (لازم يكون موجود)
    process.env.FRONTEND_URL,

    // fallback لو env نسيتيه
    "https://educ-platform-frontend-jmr6lq5z9-bondoaas-projects-f0daaf9d.vercel.app",
  ].filter(Boolean),
};


