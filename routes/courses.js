import { Router } from "express";
import Course from "../models/Courses.js";
import Device from "../models/Device.js";
import License from "../models/License.js";
import { signPlaybackToken, verifyPlaybackToken } from "../utils/tokens.js";

const router = Router();

// ===== middleware للتحقق من الترخيص والجهاز والكورس =====
async function licenseAuth(req, res, next) {
  // ✅ استخدم req.body بدل req.headers
  const { code, deviceId, courseId } = req.body;

  if (!code || !deviceId || !courseId)
    return res.status(400).json({ error: "code, deviceId & courseId required" });

  const device = await Device.findOne({ device_id: deviceId, status: "active" });
  if (!device)
    return res.status(403).json({ error: "Device not registered or blocked" });

  const license = await License.findOne({
    code,
    deviceId,
    courseId,
    isActive: true,
    validUntil: { $gt: new Date() },
  });

  if (!license)
    return res.status(403).json({ error: "License expired, invalid, or not for this course" });

  req.license = license;
  req.device = device;
  next();
}

// ===== روتات الكورسات =====

// جلب كل الكورسات
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching courses" });
  }
});

// جلب كورس واحد (محمي بالترخيص)
router.get("/:id", licenseAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.isPublished)
      return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid course ID" });
    res.status(500).json({ message: "Error fetching course" });
  }
});

// توليد توكن التشغيل (Playback Token)
router.post("/playback-token", licenseAuth, async (req, res) => {
  const { courseId, videoId } = req.body;
  const { device, license } = req;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished)
    return res.status(404).json({ error: "Course not found" });

  const video = course.videos.find(v => v.videoId === videoId);
  if (!video)
    return res.status(404).json({ error: "Video not found" });

  const token = signPlaybackToken(
    { courseId, videoId, deviceId: device.device_id, code: license.code },
    "1h"
  );

  const playbackUrl = `/playback/stream/${videoId}?token=${token}`;

  res.json({
    playbackUrl,
    watermark: { code: license.code, deviceId: device.device_id },
  });
});

export default router;
