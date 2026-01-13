import Device from '../models/device.js';
import License from '../models/license.js';

export async function licenseAuth(req, res, next) {
  try {
    const code = req.headers['x-license-code'];
    const deviceId = req.headers['x-device-id'];
    if (!code || !deviceId) return res.status(400).json({ error: "code & deviceId required" });

    const device = await Device.findOne({ device_id: deviceId, status: 'active' });
    if (!device) return res.status(403).json({ error: "Device not registered or blocked" });

    // ابحث عن الكود حتى لو deviceId = null
    const license = await License.findOne({ code, isActive: true, validUntil: { $gt: new Date() } });
    if (!license) return res.status(403).json({ error: "License expired or invalid" });

    // لو الكود غير مفعل بعد على أي جهاز
    if (!license.deviceId) {
      license.deviceId = device.device_id; // اربطه بالجهاز الحالي
      await license.save();
    } else if (license.deviceId !== device.device_id) {
      return res.status(403).json({ error: "هذا الكود مفعل على جهاز آخر" });
    }

    req.device = device;
    req.license = license;
    next();
  } catch (err) {
    console.error('License auth error:', err);
    res.status(500).json({ error: "Server error in license auth" });
  }
}
