import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signAuthToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import rateLimit from 'express-rate-limit';
import { cfg } from '../src/config.js';

const router = express.Router();

// --------------------- Rate Limiter ---------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 10,
  message: { message: "محاولات كثيرة جدًا، حاول لاحقًا" }
});

router.use(authLimiter);

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
    const deviceLimit = cfg.deviceLimit;
    if (!user.activeDevices.includes(deviceId)) {
      if (user.activeDevices.length >= deviceLimit)
        return res.status(403).json({ message: `تم تجاوز عدد الأجهزة المسموح بها (${deviceLimit})` });
      user.activeDevices.push(deviceId);
    }

    await user.save();

    // توليد توكن
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
      subscriptionEndDate: new Date(), // مؤقتًا لغاية تضيفي نظام الاشتراك
      activeDevices: []
    });

    await newUser.save();
    res.status(201).json({ message: "تم التسجيل بنجاح", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "حدث خطأ أثناء التسجيل" });
  }
});

export default router;
