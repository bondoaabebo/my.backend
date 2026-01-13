// backend/src/lib/db.js
import mongoose from 'mongoose';

// --------------------- Schemas ---------------------
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
  subscriptionEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  },
  activeDeviceId: { type: String, default: null }
});

const deviceSchema = new mongoose.Schema({
  device_id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: { type: String, required: true },
  type: String,
  device_info: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

const contentSchema = new mongoose.Schema({
  content_id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  keyEncrypted: String,
  keyId: String,
  createdAt: { type: Date, default: Date.now }
});

const licenseSchema = new mongoose.Schema({
  license_id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  content_id: String,
  device_id: String,
  code: { type: String, required: true, unique: true },
  courseId: String,
  status: { type: String, default: 'active' },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked_by: String,
  revoked_at: Date
});

const auditLogSchema = new mongoose.Schema({
  event: String,
  data: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

// --------------------- Models ---------------------
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);
const Content = mongoose.models.Content || mongoose.model('Content', contentSchema);
const License = mongoose.models.License || mongoose.model('License', licenseSchema);
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

// --------------------- Functions ---------------------
// Users
async function addUser(u) {
  const user = await new User(u).save();
  return user._id;
}

async function getUser(id) {
  return User.findById(id);
}

async function isSubscriptionValid(userId) {
  const user = await getUser(userId);
  return user && user.subscriptionEndDate > new Date();
}

// Devices
async function addOrUpdateDevice(userId, device) {
  const user = await getUser(userId);
  if (!user) throw new Error("User not found");

  let dev = await Device.findOne({ device_id: user.activeDeviceId });

  if (dev) {
    dev.device_id = device.device_id;
    dev.type = device.type;
    dev.device_info = device.device_info;
    dev.createdAt = new Date();
    await dev.save();
  } else {
    dev = await new Device({ ...device, user_id: userId }).save();
  }

  user.activeDeviceId = dev.device_id;
  await user.save();

  return dev.device_id;
}

async function getDevice(device_id) {
  return Device.findOne({ device_id });
}

// Content
async function addContent(c) {
  const content = await new Content(c).save();
  return content.content_id;
}

async function getContent(content_id) {
  return Content.findOne({ content_id });
}

// Licenses
async function addLicense(l) {
  const license = await new License(l).save();
  return license.license_id;
}

async function getActiveLicensesFor(code, device_id) {
  return License.find({
    code,
    device_id,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });
}

async function revokeLicense(license_id, by) {
  const doc = await License.findOne({ license_id });
  if (!doc) return false;

  doc.status = 'revoked';
  doc.revoked_by = by;
  doc.revoked_at = new Date();
  await doc.save();

  return true;
}

// Audit
async function audit({ event, data = {} }) {
  await new AuditLog({ event, data }).save();
}

// --------------------- Export ---------------------
export {
  User,
  Device,
  Content,
  License,
  AuditLog,
  addUser, getUser, isSubscriptionValid,
  addOrUpdateDevice, getDevice,
  addContent, getContent,
  addLicense, getActiveLicensesFor, revokeLicense,
  audit
};
