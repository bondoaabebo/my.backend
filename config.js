import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const requiredEnv = ["MONGO_URI", "MASTER_KMS_KEY"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1); // مهم: مايرميش Error يكسر السيرفر
  }
}

const frontendUrl =
  process.env.FRONTEND_URL ||
  "https://educ-platform-frontend-oaf3d3ug3-bondoaas-projects-f0daaf9d.vercel.app";

export const cfg = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  frontendUrl,
  playbackSecret: process.env.PLAYBACK_SECRET || "default-playback-secret",
  masterKmsKey: process.env.MASTER_KMS_KEY,
  deviceLimit: Number(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: Number(process.env.VOUCHER_DEFAULT_DAYS) || 15,
  // =========================
  // CORS
  // =========================
  allowedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    frontendUrl,
  ],
};


