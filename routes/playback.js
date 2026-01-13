import { Router } from "express";
import path from "path";
import fs from "fs";

import Course from "../models/courses.js";
import License from "../models/license.js";
import Device from "../models/device.js";

import { signPlaybackToken, verifyPlaybackToken } from "../utils/tokens.js";

const router = Router();

/* ======================================================
   Middleware: التحقق من الرخصة + الجهاز
====================================================== */
async function licenseAuth(req, res, next) {
  const { code, deviceId } = req.body;

  if (!code || !deviceId) {
    return res.status(400).json({ error: "code & deviceId required" });
  }

  const device = await Device.findOne({ device_id: deviceId });
  if (!device || device.status !== "active") {
    return res.status(403).json({ error: "Device not registered or blocked" });
  }

  const license = await License.findOne({
    code,
    deviceId,
    isActive: true,
    validUntil: { $gt: new Date() }
  });

  if (!license) {
    return res.status(403).json({ error: "License expired or invalid" });
  }

  req.device = device;
  req.license = license;
  next();
}

/* ======================================================
   توليد رابط التشغيل
====================================================== */
router.post("/get-url", licenseAuth, async (req, res) => {
  const { courseId, videoId } = req.body;
  const { license, device } = req;

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    return res.status(404).json({ error: "Course not found" });
  }

  const video = course.videos.find(v => v.videoId === videoId);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  const token = signPlaybackToken(
    {
      code: license.code,
      deviceId: device.device_id,
      courseId,
      videoId
    },
    "1h"
  );

  res.json({
    playbackUrl: `/api/playback/stream/${videoId}/index.m3u8?token=${token}`
  });
});

/* ======================================================
   بث HLS (m3u8 + ts) — بدون AES
====================================================== */
router.get("/stream/:videoId/:file?", async (req, res) => {
  const { token } = req.query;
  const { videoId, file } = req.params;

  if (!token) return res.status(401).end();

  let payload;
  try {
    payload = verifyPlaybackToken(token);
  } catch {
    return res.status(401).end();
  }

  if (payload.videoId !== videoId) {
    return res.status(403).end();
  }

  const videoDir = path.join(process.cwd(), "videos", videoId);
  const fileName = file || "index.m3u8";
  const filePath = path.join(videoDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).end();
  }

  res.setHeader("Cache-Control", "no-store");

  // ===== m3u8 =====
  if (fileName.endsWith(".m3u8")) {
    let manifest = fs.readFileSync(filePath, "utf8");

    // إضافة التوكن لملفات ts فقط
    manifest = manifest
      .split("\n")
      .map(line =>
        line.endsWith(".ts") ? `${line}?token=${token}` : line
      )
      .join("\n");

    res.type("application/vnd.apple.mpegurl");
    return res.send(manifest);
  }

  // ===== ts =====
  res.setHeader("Content-Type", "video/MP2T");
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "no-store");

  return res.sendFile(filePath);
});

export default router;
