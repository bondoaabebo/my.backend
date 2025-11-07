if (!process.env.VERCEL) {
  // تحميل dotenv محلي فقط
  const dotenv = await import("dotenv");
  dotenv.config();
}

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
  "PLAYBACK_SECRET",
  "MASTER_KMS_KEY",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV === "production") {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1);
    } else {
      console.warn(`⚠️ Missing ${key}, using fallback value (development mode)`);
    }
  }
}

export const cfg = {
  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduplatform",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
  playbackSecret: process.env.PLAYBACK_SECRET || "dev-playback-secret",
  masterKmsKey: process.env.MASTER_KMS_KEY || "dev-kms-key",
  deviceLimit: parseInt(process.env.DEVICE_LIMIT) || 3,
  voucherDefaultDays: parseInt(process.env.VOUCHER_DEFAULT_DAYS) || 30,
};
