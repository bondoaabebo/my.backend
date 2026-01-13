// createUsersCli.js
/*
أداة لإضافة مستخدمين إلى قاعدة البيانات بدون كلمة مرور:
- تشغيل تفاعلي
- أو من ملف JSON
*/

// =======================
// الاستيراد
// =======================
import fs from "fs";
import readline from "readline";
import mongoose from "mongoose";
import User from "./models/User.js";
import { cfg } from "./config.js";

// =======================
// الاتصال بقاعدة البيانات
// =======================
async function connectDB() {
  try {
    await mongoose.connect(cfg.mongoUri, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err.message);
    return false;
  }
  return true;
}

// =======================
// إضافة مستخدم واحد
// =======================
async function addUser({ name, email }) {
  try {
    const u = new User({
      name,
      email,
      subscriptionEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 يوم
      activeDeviceId: null,
    });

    await u.save();
    console.log(`✅ Created: ${email}`);
  } catch (err) {
    console.error(`❌ Error creating user ${email}:`, err.message);
  }
}

// =======================
// إضافة مستخدمين من ملف JSON
// =======================
async function fromFile(path) {
  try {
    const raw = fs.readFileSync(path, "utf8");
    const arr = JSON.parse(raw);

    for (const item of arr) {
      if (!item.name || !item.email) {
        console.warn("⚠️ Skipped incomplete record:", item);
        continue;
      }
      await addUser(item);
    }
  } catch (err) {
    console.error("❌ Error reading file:", err.message);
  }
}

// =======================
// الوضع التفاعلي (CLI)
// =======================
async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));

  const nStr = await question("كم عدد المستخدمين اللي عايز تضيفه؟ ");
  const n = parseInt(nStr || "0", 10);

  if (!n || n <= 0) {
    console.log("❌ لم يتم إدخال عدد صحيح. تم الإنهاء.");
    rl.close();
    return;
  }

  for (let i = 0; i < n; i++) {
    console.log(`\n--- مستخدم ${i + 1} ---`);

    const name = await question("الاسم: ");
    const email = await question("الإيميل: ");

    if (!name || !email) {
      console.warn("⚠️ بيانات غير مكتملة. تم تخطي المستخدم.");
      continue;
    }

    await addUser({ name, email });
  }

  rl.close();
}

// =======================
// Main
// =======================
async function main() {
  console.log("🚀 بدء تشغيل أداة إنشاء المستخدمين...");

  const ok = await connectDB();
  if (!ok) return;

  const args = process.argv.slice(2);

  if (args[0] === "--file" && args[1]) {
    const path = args[1];

    if (!fs.existsSync(path)) {
      console.error("❌ الملف غير موجود:", path);
      return;
    }

    console.log("📂 إضافة مستخدمين من ملف:", path);
    await fromFile(path);
  } else {
    console.log("🧑‍💻 وضع الإدخال التفاعلي");
    await interactive();
  }

  console.log("\n⏹️ انتهى تشغيل الأداة. يمكنك إغلاق النافذة بأمان.");
}

main();
