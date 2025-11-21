import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAuthToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
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

    if (new Date() > user.subscriptionEndDate)
      return res.status(403).json({ message: "انتهت مدة الاشتراك" });

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

// --------------------- تجديد Access Token ---------------------
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token مطلوب" });

    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user || !user.activeDevices.includes(payload.deviceId))
      return res.status(403).json({ message: "غير مصرح" });

    const newAccessToken = signAuthToken({ userId: user._id, deviceId: payload.deviceId });
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Refresh token غير صالح أو انتهت صلاحيته" });
  }
});

// --------------------- تسجيل مستخدم جديد ---------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, deviceId } = req.body;
    if (!name || !email || !password || !deviceId)
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
      activeDevices: [deviceId] // يسجل الجهاز مباشرة
    });

    await newUser.save();

    const accessToken = signAuthToken({ userId: newUser._id, deviceId });
    const refreshToken = signRefreshToken({ userId: newUser._id, deviceId });

    res.status(201).json({
      message: "تم التسجيل بنجاح",
      user: newUser,
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
  }
});

export default router;

