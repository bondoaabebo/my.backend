// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { signAuthToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import  sendEmail from '../utils/email.js';
import { cfg } from '../config.js';

const router = express.Router();

// --------------------- تسجيل الدخول ---------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;
    if (!email || !password || !deviceId)
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "بيانات غير صحيحة" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "بيانات غير صحيحة" });

    // التحقق من الاشتراك
    if (new Date() > user.subscriptionEndDate)
      return res.status(403).json({ message: "انتهت مدة الاشتراك" });

    // التحقق من عدد الأجهزة
    user.activeDevices = user.activeDevices || [];
    if (!user.activeDevices.includes(deviceId)) {
      if (user.activeDevices.length >= cfg.deviceLimit)
        return res.status(403).json({ message: `تم تجاوز عدد الأجهزة المسموح بها (${cfg.deviceLimit})` });
      user.activeDevices.push(deviceId);
    }

    await user.save();

    const accessToken = signAuthToken({ userId: user._id, deviceId });
    const refreshToken = signRefreshToken({ userId: user._id, deviceId });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "خطأ في الخادم" });
  }
});

// --------------------- تسجيل مستخدم جديد ---------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "كل الحقول مطلوبة" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "المستخدم موجود بالفعل" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      subscriptionEndDate: new Date(),
      activeDevices: []
    });

    await newUser.save();
    res.status(201).json({ message: "تم التسجيل بنجاح", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
  }
});

// --------------------- نسيت كلمة المرور ---------------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user) {
      // إنشاء توكن عشوائي
      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 3600000; // ساعة واحدة
      await user.save();

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail(user.email, "استرجاع كلمة المرور", `رابط الاسترجاع: ${resetLink}`);
    }

    // رسالة عامة لمنع كشف البريد
    res.json({ message: "إذا كان البريد مسجلاً، سيصلك رابط استرجاع كلمة المرور" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء إرسال البريد" });
  }
});

// --------------------- تغيير كلمة المرور ---------------------
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "الرابط غير صالح أو منتهي" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
  }
});

export default router;
