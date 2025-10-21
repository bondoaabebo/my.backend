import express from "express";
import { v4 as uuidv4 } from "uuid";
import Device from "../models/Device.js"; // موديل Mongoose للجهاز

const router = express.Router();

// --------------------- تسجيل جهاز جديد ---------------------
router.post("/register", async (req, res) => {
  try {
    const { device_pubkey_pem, device_info, user_id } = req.body;
    if (!device_pubkey_pem || !user_id) {
      return res.status(400).json({ error: "device_pubkey_pem و user_id مطلوبين" });
    }

    const device_id = "dev-" + uuidv4();
    const record = new Device({
      device_id,
      user_id,
      device_pubkey_pem,
      device_info,
      status: "active",
      registered_at: new Date(),
    });

    await record.save();
    return res.json({ device_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// --------------------- استرجاع بيانات جهاز ---------------------
router.get("/:deviceId", async (req, res) => {
  try {
    const device = await Device.findOne({ device_id: req.params.deviceId });
    if (!device) return res.status(404).json({ error: "الجهاز غير موجود" });
    return res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
