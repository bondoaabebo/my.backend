const { aesGcmEncrypt, aesGcmDecrypt, generateAesKeyBase64 } = require('./crypto-utils');
const { v4: uuidv4 } = require('uuid');
const { cfg } = require('../config.js');

const MASTER_KEY = cfg.masterKmsKey;

async function createContentKey(content_id) {
  try {
    const contentKey = Buffer.from(generateAesKeyBase64(), 'base64'); // 32 bytes AES256
    const wrapped = aesGcmEncrypt(MASTER_KEY, contentKey.toString('base64'));
    return { keyId: `contentKey-${uuidv4()}`, wrappedKey: wrapped };
  } catch (err) {
    console.error('Error creating content key:', err);
    throw err;
  }
}

async function getContentKeyPlain(contentRecord) {
  try {
    const b64 = aesGcmDecrypt(MASTER_KEY, contentRecord.keyEncrypted);
    return Buffer.from(b64, 'base64');
  } catch (err) {
    console.error('Error decrypting content key:', err);
    throw err;
  }
}

module.exports = { createContentKey, getContentKeyPlain };
