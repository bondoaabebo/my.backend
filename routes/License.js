// routes/license.js
import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import { getDevice, getContent, addLicense, getActiveLicensesFor, audit, revokeLicense } from "../src/lib/db.js";
import { getContentKeyPlain } from "../src/lib/kms.js";
import { wrapWithDevicePubKey } from "../src/lib/crypto-utils.js";
import { v4 as uuidv4 } from "uuid";

const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH, "utf8");
const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "no_auth" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid_token", detail: err.message });
  }
}

router.post("/request", authMiddleware, async (req, res) => {
  try {
    const { content_id, device_info, session_id } = req.body;
    const user = req.user;

    // entitlement check
    const entitled = (user.entitlements || []).some(
      (e) => e.content_id === content_id && e.can_play
    );
    if (!entitled) return res.status(403).json({ error: "no_entitlement" });

    // device check
    const device = getDevice(device_info.device_id);
    if (!device || device.status !== "active") {
      return res.status(403).json({ error: "device_blocked" });
    }

    // concurrency check
    const active = getActiveLicensesFor(content_id, device_info.device_id);
    if (active.length >= parseInt(process.env.MAX_CONCURRENCY || "1")) {
      return res.status(429).json({ error: "max_concurrency" });
    }

    // get content key
    const contentRecord = getContent(content_id);
    if (!contentRecord)
      return res.status(404).json({ error: "content_not_found" });

    const contentKeyBuf = await getContentKeyPlain(contentRecord);
    const wrapped = wrapWithDevicePubKey(device.device_pubkey_pem, contentKeyBuf);

    const now = Math.floor(Date.now() / 1000);
    const ttl = parseInt(process.env.LICENSE_TTL_SECONDS || "300");
    const license_id = "lic-" + uuidv4();

    const license = {
      license_id,
      user_id: user.uid,
      device_id: device.device_id,
      content_id,
      wrapped_content_key: wrapped,
      playback_policy: {
        ttl_seconds: ttl,
        max_concurrency: parseInt(process.env.MAX_CONCURRENCY || "1"),
      },
      issued_at: now,
      expires_at: now + ttl,
      status: "active",
      session_id,
    };

    addLicense(license);

    audit({
      event: "license_issued",
      license_id,
      user: user.uid,
      device: device.device_id,
      content_id,
      ts: now,
    });

    return res.json({
      license_id,
      content_id,
      wrapped_content_key: wrapped,
      playback_policy: license.playback_policy,
      issued_at: now,
      expires_at: now + ttl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// revoke endpoint
router.post("/revoke", (req, res) => {
  const { license_id, by } = req.body;
  if (!license_id) return res.status(400).json({ error: "invalid" });

  const ok = revokeLicense(license_id, by || "admin");
  audit({ event: "license_revoke", license_id, by, ts: Date.now() });
  return res.json({ ok });
});

export default router;
