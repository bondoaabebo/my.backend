// routes/device.js
import express from "express";
import { addDevice, getDevice } from "../src/lib/db.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/register", (req, res) => {
  const { device_pubkey_pem, device_info, user_id } = req.body;
  if (!device_pubkey_pem || !user_id) {
    return res.status(400).json({ error: "invalid" });
  }

  const device_id = "dev-" + uuidv4();
  const record = {
    device_id,
    user_id,
    device_pubkey_pem,
    device_info,
    status: "active",
    registered_at: Date.now(),
  };

  addDevice(record);
  return res.json({ device_id });
});

router.get("/:deviceId", (req, res) => {
  const d = getDevice(req.params.deviceId);
  if (!d) return res.status(404).json({ error: "not_found" });
  return res.json(d);
});

export default router;  // ✅ بدل module.exports
