// backend/middleware/authMiddleware.js
import { verifyAuthToken } from "../utils/jwt.js";

export default function authMiddleware(req, res, next) {
  // نجيب التوكن من الهيدر
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // التوكن بيكون عادة بالشكل: Bearer <token>
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    // التحقق من التوكن
    const decoded = verifyAuthToken(token);
    req.user = decoded; // نخزن البيانات في req.user
    next(); // نكمل تنفيذ المسار
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
