import express from 'express';
import License from '../models/License.js';
import Device from '../models/device.js';

const router = express.Router();

router.post('/activate', async (req, res) => {
  try {
    const { code, deviceId, deviceInfo } = req.body;

    if (!code || !deviceId) {
      return res.status(400).json({ error: "code & deviceId required" });
    }

    // 1) تحقق من صلاحية الترخيص
    const license = await License.findOne({
      code,
      validUntil: { $gt: new Date() },
      isActive: true
    });

    if (!license) {
      return res.status(403).json({ error: "License expired or invalid" });
    }

    // 2) الجهاز القديم المرتبط بنفس الكود
    const oldDevice = await Device.findOne({ license_code: code });

    if (oldDevice && oldDevice.device_id !== deviceId) {
      oldDevice.status = "blocked";
      await oldDevice.save();
    }

    // 3) الجهاز الجديد أو الموجود
    let device = await Device.findOne({ device_id: deviceId });

    if (!device) {
      device = new Device({
        device_id: deviceId,
        license_code: code,
        device_info: deviceInfo || {},
        status: "active"
      });
    } else {
      device.status = "active";
      device.device_info = deviceInfo || {};
      device.license_code = code;
    }

    await device.save();

    // 4) ربط الترخيص بالجهاز
    license.deviceId = deviceId;
    await license.save();

    return res.json({
      message: "License activated",
      code: license.code,
      deviceId: device.device_id,
      validUntil: license.validUntil
    });

  } catch (error) {
    console.error("Activation error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
