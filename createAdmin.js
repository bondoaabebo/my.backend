import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "./models/admins.js";

// ✨ عدلي كلمة السر هنا فقط
const PASSWORD = "Bondoaa";

// رابط قاعدة البيانات
const MONGO_URI =
"mongodb+srv://bondoaabeboo_db_user:Loe6ByHseMboPpSY@eduplatform.8zvo8zq.mongodb.net/?retryWrites=true&w=majority&appName=eduplatform";
async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Mongo Connected");

    // مسح أي أدمن قديم
    await Admin.deleteMany({});
    console.log("🗑️ Old admin deleted");

    // تشفير الباسورد
    const hash = await bcrypt.hash(PASSWORD, 10);
    console.log("🔐 HASH:", hash);

    // إنشاء أدمن جديد
    await Admin.create({ password: hash });

    console.log("✅ Admin created successfully");
    console.log("👉 PASSWORD =", PASSWORD);

    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

createAdmin();
