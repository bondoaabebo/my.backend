// lib/crypto-utils.js
const crypto = require('crypto');

function generateAesKeyBase64() {
  return crypto.randomBytes(32).toString('base64'); // AES-256 key
}

// AES-GCM encrypt (simulate KMS encrypt)
function aesGcmEncrypt(keyBase64, plaintext) {
  const key = Buffer.from(keyBase64,'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(plaintext)), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString('base64');
}

function aesGcmDecrypt(keyBase64, ciphertextBase64) {
  const data = Buffer.from(ciphertextBase64,'base64');
  const key = Buffer.from(keyBase64,'base64');
  const iv = data.slice(0,12);
  const tag = data.slice(12,28);
  const ct = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString();
}

// wrap content key with RSA public key (device pubkey PEM) using OAEP SHA-256
function wrapWithDevicePubKey(devicePubKeyPem, symmetricKeyBuffer) {
  const wrapped = crypto.publicEncrypt(
    {
      key: devicePubKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    symmetricKeyBuffer
  );
  return wrapped.toString('base64');
}

// unwrap with device private key (client-side) - server won't do this
module.exports = {
  generateAesKeyBase64,
  aesGcmEncrypt,
  aesGcmDecrypt,
  wrapWithDevicePubKey
};
