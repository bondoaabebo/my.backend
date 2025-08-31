// backend/src/routes/auth.js
import express from 'express';
import User from '../models/User.js';
import { signAuthToken } from '../utils/jwt.js';

const router = express.Router();

// تسجيل الدخول
router.post('/login', async (req, res) => {
  const { email, password, deviceId } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.password !== password)
    return res.status(401).json({ message: "بيانات غير صحيحة" });

  // تحقق من مدة الاشتراك
  if (new Date() > user.subscriptionEndDate)
    return res.status(403).json({ message: "انتهت مدة الاشتراك" });

  // تحقق من الجهاز
  if (user.currentDeviceId && user.currentDeviceId !== deviceId)
    return res.status(403).json({ message: "تم تسجيل الدخول على جهاز آخر" });

  // السماح بالدخول
  user.currentDeviceId = deviceId;
  await user.save();

  // توليد توكن
  const token = signAuthToken({ userId: user._id, deviceId });

  res.json({ token });
});

export default router;
