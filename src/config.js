import dotenv from 'dotenv';
dotenv.config();

export const cfg = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  playbackSecret: process.env.PLAYBACK_SECRET,
  deviceLimit: process.env.DEVICE_LIMIT || 3,
  voucherDefaultDays: process.env.VOUCHER_DEFAULT_DAYS || 30
};
