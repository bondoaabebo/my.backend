// lib/db.js
import { v4 as uuidv4 } from 'uuid';

const users = new Map();      // userId -> user record
const devices = new Map();    // deviceId -> device record
const contents = new Map();   // contentId -> { keyEncrypted, keyId }
const licenses = new Map();   // licenseId -> license record
const auditLogs = [];

function addUser(u) { users.set(u.id, u); }
function getUser(id) { return users.get(id); }

function addDevice(d) { devices.set(d.device_id, d); }
function getDevice(id) { return devices.get(id); }

function addContent(c) { contents.set(c.content_id, c); }
function getContent(content_id) { return contents.get(content_id); }

function addLicense(l) { licenses.set(l.license_id, l); }
function getActiveLicensesFor(content_id, device_id) {
  // simple concurrency check
  const out = [];
  for (const l of licenses.values()) {
    if (l.content_id === content_id && l.status === 'active') out.push(l);
  }
  return out;
}

function revokeLicense(license_id, by) {
  const l = licenses.get(license_id);
  if (l) {
    l.status = 'revoked';
    l.revoked_by = by;
    l.revoked_at = Date.now();
    return true;
  }
  return false;
}

function audit(event) { auditLogs.push(event); }

export {
  addUser, getUser,
  addDevice, getDevice,
  addContent, getContent,
  addLicense, getActiveLicensesFor, revokeLicense,
  audit, auditLogs
};
