import dotenv from "dotenv";
dotenv.config();

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "PLAYBACK_SECRET",
  "MASTER_KMS_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}
export const cfg = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  playbackSecret: process.env.PLAYBACK_SECRET,
  masterKmsKey: process.env.MASTER_KMS_KEY,
  deviceLimit: parseInt(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: parseInt(process.env.VOUCHER_DEFAULT_DAYS) || 30,
}