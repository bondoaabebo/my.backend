/*
backend/createUsersCli.js
سكربت CLI لإضافة مستخدمين تفاعليا أو من ملف JSON.
شغله من داخل مجلد backend:
  node createUsersCli.js
أو
  node createUsersCli.js --file ../path/to/users.json
*/
import fs from "fs";
import readline from "readline";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";                // تأكد المسار صحيح
import { cfg } from "./src/config.js";             // تأكد المسار صحيح

async function connectDB() {
  await mongoose.connect(cfg.mongoUri);
  console.log("✅ Connected to MongoDB");
}

async function addUser({ name, email, password }) {
  const hashed = await bcrypt.hash(password, 10);
  const u = new User({
    name,
    email,
    password: hashed,
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم تجريبي
    activeDevices: []
  });
  await u.save();
  console.log(`✅ Created: ${email}`);
}

async function fromFile(path) {
  const raw = fs.readFileSync(path, "utf8");
  const arr = JSON.parse(raw);
  for (const item of arr) {
    if (!item.name || !item.email || !item.password) {
      console.warn("⚠️ تخطيت سجل غير كامل:", item);
      continue;
    }
    await addUser(item);
  }
}

async function interactive() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(res => rl.question(q, ans => res(ans.trim())));

  const nStr = await question("كم عدد المستخدمين اللي عايز تضيف (اكتب رقم): ");
  const n = parseInt(nStr || "0", 10);
  if (!n || n <= 0) {
    console.log("لا يوجد مستخدمين. خرجت.");
    rl.close();
    return;
  }

  for (let i = 0; i < n; i++) {
    console.log(`--- مستخدم ${i+1} ---`);
    const name = await question("الاسم: ");
    const email = await question("الإيميل: ");
    const password = await question("كلمة المرور (واضح): ");
    if (!name || !email || !password) {
      console.log("⚠️ بيانات ناقصة. هذا المستخدم تم تخطيه.");
      continue;
    }
    await addUser({ name, email, password });
  }

  rl.close();
}

async function main() {
  try {
    await connectDB();

    const args = process.argv.slice(2);
    if (args[0] === "--file" && args[1]) {
      const path = args[1];
      if (!fs.existsSync(path)) {
        console.error("ملف مش موجود:", path);
        process.exit(1);
      }
      await fromFile(path);
    } else {
      await interactive();
    }

    console.log("⏹️ انتهى.");
    process.exit(0);
  } catch (e) {
    console.error("خطأ:", e);
    process.exit(1);
  }
}

main();
