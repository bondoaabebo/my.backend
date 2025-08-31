// backend/routes/courses.js
import express from "express";
import Course from "../models/Course.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// جميع الكورسات
router.get("/", authRequired, async (req, res) => {
  const courses = await Course.find({ isPublished: true });
  res.json(courses);
});

// كورس واحد مع الفيديوهات
router.get("/:id", authRequired, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "الكورس غير موجود" });
  res.json(course);
});


export default router;
