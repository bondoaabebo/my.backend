import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admins.js";

const router = express.Router();

// =========================
// Admin Login
// =========================
router.post("/login", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const password = req.body?.password?.trim();

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
