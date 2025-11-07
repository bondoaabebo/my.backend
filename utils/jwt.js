import jwt from "jsonwebtoken";
import { cfg } from "../config.js";

// مدة قصيرة للوصول
export function signAuthToken(payload, expiresIn = "15m") {
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn, issuer: "edu-platform", audience: "edu-clients" });
}

// Refresh Token طويل المدة
export function signRefreshToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn, issuer: "edu-platform", audience: "edu-clients" });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, cfg.jwtSecret, { issuer: "edu-platform", audience: "edu-clients" });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, cfg.jwtSecret, { issuer: "edu-platform", audience: "edu-clients" });
}
