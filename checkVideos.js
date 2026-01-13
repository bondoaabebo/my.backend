// checkVideos.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { verifyPlaybackToken } from "./utils/tokens.js"; // مسار ملف التوكن عندك

dotenv.config();

const VIDEOS_DIR = path.join(process.cwd(), "backend", "videos");

// افحص كل فيديو
async function checkVideo(videoId, token) {
  const videoDir = path.join(VIDEOS_DIR, videoId);
  const m3u8Path = path.join(videoDir, "index.m3u8");

  // 1️⃣ تحقق من وجود index.m3u8
  if (!fs.existsSync(m3u8Path)) {
    console.error(`❌ ملف index.m3u8 مفقود لـ videoId=${videoId}`);
    return false;
  }

  console.log(`✅ index.m3u8 موجود لـ videoId=${videoId}`);

  // 2️⃣ تحقق من وجود ملفات .ts
  const manifest = fs.readFileSync(m3u8Path, "utf-8");
  const tsFiles = manifest
    .split("\n")
    .filter((line) => line.trim().endsWith(".ts"));

  let allTsExist = true;
  for (const tsFile of tsFiles) {
    const tsPath = path.join(videoDir, tsFile);
    if (!fs.existsSync(tsPath)) {
      console.error(`❌ ملف ts مفقود: ${tsFile}`);
      allTsExist = false;
    }
  }

  if (allTsExist) console.log(`✅ جميع ملفات .ts موجودة لـ videoId=${videoId}`);

  // 3️⃣ تحقق من التوكن (اختياري)
  if (token) {
    try {
      const decoded = verifyPlaybackToken(token);
      if (decoded.videoId !== videoId) {
        console.error(`❌ التوكن لا يتوافق مع videoId=${videoId}`);
        return false;
      }
      console.log(`✅ التوكن صالح للفيديو`);
    } catch (err) {
      console.error("❌ التوكن غير صالح أو انتهت صلاحيته:", err.message);
      return false;
    }
  }

  return allTsExist;
}

// مثال استخدام
async function main() {
  const videosToCheck = [
    { id: "abc123", token: null }, // ضع التوكن إذا موجود
    { id: "def456", token: null },
  ];

  for (const v of videosToCheck) {
    console.log("\n=========");
    console.log(`التحقق من الفيديو: ${v.id}`);
    await checkVideo(v.id, v.token);
  }
}

main();
