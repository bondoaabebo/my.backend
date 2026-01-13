import { verifyPlaybackToken } from "../utils/tokens.js";

// Middleware للتحقق من التوكن وحماية الـ routes
export function authRequired(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      console.warn("No Authorization header provided");
      return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.warn("Invalid Authorization header format:", authHeader);
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = parts[1];

    const decoded = verifyPlaybackToken(token); // التحقق من التوكن
    req.user = decoded; // إضافة بيانات المستخدم إلى req
    next(); // السماح للـ route بالمتابعة
  } catch (err) {
    console.error("Auth token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Middleware للتحقق من صلاحية الادمن
export function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
}
