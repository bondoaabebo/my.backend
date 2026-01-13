import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحميل .env من نفس مكان الملف
dotenv.config({ path: path.resolve(__dirname, ".env") });

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

  // 👇 رابط الفرونت على فيرسل
  frontendUrl:
    process.env.FRONTEND_URL ||
    "https://educ-platform-frontend-oaf3d3ug3-bondoaas-projects-f0daaf9d.vercel.app",

  playbackSecret: process.env.PLAYBACK_SECRET || "default-playback-secret",
  masterKmsKey: process.env.MASTER_KMS_KEY,

  deviceLimit: parseInt(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: parseInt(process.env.VOUCHER_DEFAULT_DAYS) || 15,

  allowedOrigins: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
    "https://educ-platform-frontend-oaf3d3ug3-bondoaas-projects-f0daaf9d.vercel.app",
  ].filter(Boolean),
};
