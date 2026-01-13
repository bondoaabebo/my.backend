import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import Content from "../../models/content.js";
import { wrapWithDevicePubKey } from "./crypto-utils.js";

// ✅ الاسم الصح + بدون fallback
const MASTER_KEY = process.env.MASTER_KMS_KEY
  ? Buffer.from(process.env.MASTER_KMS_KEY, "base64")
  : null;

if (!MASTER_KEY) {
  throw new Error("MASTER_KMS_KEY is not defined");
}

// توليد مفتاح AES
export function generateAesKeyBase64() {
  return crypto.randomBytes(32).toString("base64");
}

// تشفير AES-GCM بشكل صحيح
function aesGcmEncrypt(key, plaintextBase64) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintextBase64, "base64")),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // نخزن iv + tag + data
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export async function createContentKeyForDevices(contentId, devices = []) {
  try {
    const contentKey = Buffer.from(generateAesKeyBase64(), "base64");

    const wrappedKeyMaster = aesGcmEncrypt(
      MASTER_KEY,
      contentKey.toString("base64")
    );

    if (!wrappedKeyMaster) {
      throw new Error("wrappedKeyMaster is undefined");
    }

    const wrappedKeys = {};
    for (const d of devices) {
      if (!d.pubKeyPem) continue;
      wrappedKeys[d.deviceId] = wrapWithDevicePubKey(
        d.pubKeyPem,
        contentKey
      );
    }

    const keyId = `contentKey-${uuidv4()}`;

    await Content.create({
      content_id: contentId,
      keyEncrypted: wrappedKeyMaster,
      keyId,
      createdAt: new Date()
    });

    return { keyId, wrappedKeys };

  } catch (err) {
    console.error("❌ Error creating content key:", err);
    throw err;
  }
}
