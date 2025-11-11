// config.js
// ✅ تحميل dotenv فقط عند التشغيل المحلي (مش في Railway)
if (process.env.NODE_ENV !== "production") {
  try {
    const dotenv = await import("dotenv");
    dotenv.config();
    console.log("🧩 Dotenv loaded for local development");
  } catch (err) {
    console.warn("⚠️ Dotenv not found (probably running on Railway)");
  }
}

const requiredEnv = ["MONGO_URI", "JWT_SECRET"];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    if (process.env.NODE_ENV === "production") {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1);
    } else {
      console.warn(`⚠️ Missing ${key}, using fallback (development)`);
    }
  }
}

export const cfg = {
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/localdb",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key",
};
