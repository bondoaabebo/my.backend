// backend/routes/license.js
import express from 'express';
import License from '../models/license.js';
import Device from '../models/device.js';
import Voucher from '../models/voucher.js'; // لازم نستورد الـ Voucher
import Course from '../models/courses.js'; // لو عايزين نرجع بيانات الكورس بعد التفعيل

const router = express.Router();

// =========================
// ✅ تفعيل الكود مع تسجيل الجهاز
// =========================
router.post('/activate', async (req, res) => {
  try {
    const { code, deviceId, userId, courseId } = req.body;

    // التحقق من الحقول المطلوبة
    if (!code || !deviceId || !userId || !courseId) {
      return res.status(400).json({ error: "code, deviceId, userId & courseId required" });
    }

    // البحث أولًا في License
    let license = await License.findOne({
      code,
      courseId,
      isActive: true,
      validUntil: { $gt: new Date() }
    });

    // لو مفيش License، نجرب الكود في Voucher
    if (!license) {
      const voucher = await Voucher.findOne({ code, courseId, redeemed: false });
      if (!voucher) {
        return res.status(403).json({ error: "License expired or invalid for this course" });
      }

      // إنشاء سجل جديد في License
      const validFrom = new Date();
      const validUntil = new Date();
      validUntil.setDate(validFrom.getDate() + voucher.days);

      license = new License({
        code: voucher.code,
        courseId: voucher.courseId,
        validFrom,
        validUntil,
        isActive: true,
        deviceId: null,
      });
      await license.save();

      // تحديث Voucher كـ Redeemed
      voucher.redeemed = true;
      await voucher.save();
    }

    // التحقق أو تسجيل الجهاز
    let device = await Device.findOne({ device_id: deviceId });
    if (!device) {
      device = new Device({
        device_id: deviceId,
        license_code: code,
        device_info: {},
        status: "active"
      });
      await device.save();
    }

    // التأكد أن الكود مش مفعل على جهاز آخر
    if (license.deviceId && license.deviceId !== deviceId) {
      return res.status(403).json({ error: "License already used on another device" });
    }

    // ربط الترخيص بالجهاز الحالي
    license.deviceId = deviceId;
    await license.save();

    // جلب بيانات الكورس بعد التفعيل
    const course = await Course.findById(courseId);

    res.json({
      message: "License activated successfully ✅",
      code: license.code,
      deviceId,
      validUntil: license.validUntil,
      course
    });

  } catch (err) {
    console.error("Activation error:", err);
    res.status(500).json({ error: "Server error during license activation" });
  }
});

export default router;
