// lib/kms.js
const { aesGcmEncrypt, aesGcmDecrypt, generateAesKeyBase64 } = require('./crypto-utils');
const { v4: uuidv4 } = require('uuid');

const MASTER_KEY = process.env.MASTER_KMS_KEY; // base64 from .env - in prod use HSM

async function createContentKey(content_id) {
  // generate content symmetric key (AES256)
  const contentKey = Buffer.from(generateAesKeyBase64(),'base64'); // Buffer 32 bytes
  // wrap/encrypt contentKey with MASTER_KEY (simulate KMS envelope)
  const wrapped = aesGcmEncrypt(MASTER_KEY, contentKey.toString('base64'));
  return { keyId: 'kms-'+uuidv4(), wrappedKey: wrapped };
}

async function getContentKeyPlain(contentRecord) {
  // decrypt via MASTER_KEY
  const b64 = aesGcmDecrypt(MASTER_KEY, contentRecord.keyEncrypted);
  return Buffer.from(b64,'base64'); // Buffer with symmetric key
}

module.exports = { createContentKey, getContentKeyPlain };

