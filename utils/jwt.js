import jwt from "jsonwebtoken";
import { cfg } from "../src/config.js";

export function signAuthToken(payload, expiresIn = "1d") {
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, cfg.jwtSecret);
}
