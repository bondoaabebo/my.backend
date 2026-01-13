import { Router } from "express";
import Voucher from "../models/voucher.js";
import { adminAuth } from "../middleware/adminsAuth.js";
import crypto from "crypto";

const router = Router();

router.post("/generate", adminAuth, async (req, res) => {
  let { code, days, courseId } = req.body;

  if (!days) return res.status(400).json({ error: "Days required" });
  if (!courseId) return res.status(400).json({ error: "CourseId required" });

  if (!code) {
    // توليد كود عشوائي لو لم يُرسل
    code = crypto.randomBytes(4).toString("hex").toUpperCase();
  }

  const existing = await Voucher.findOne({ code });
  if (existing)
    return res.status(400).json({ error: "Code already exists" });

  const voucher = new Voucher({ code, days, courseId });
  await voucher.save();

  res.status(201).json({ message: "Voucher created", code: voucher.code });
});

export default router;
