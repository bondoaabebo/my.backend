import jwt from 'jsonwebtoken';
import { cfg } from '../config.js';

export function signAuthToken(payload, expiresIn='7d') {
  return jwt.sign(payload, cfg.jwtSecret, { expiresIn });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, cfg.jwtSecret);
}

export function signPlaybackToken(payload, expiresIn='1h') {
  return jwt.sign(payload, cfg.playbackSecret, { expiresIn });
}

export function verifyPlaybackToken(token) {
  return jwt.verify(token, cfg.playbackSecret);
}
