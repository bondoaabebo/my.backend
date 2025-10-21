import mongoose from 'mongoose';

// --------------------- Schemas ---------------------
const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const deviceSchema = new mongoose.Schema({
  device_id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  user_id: String,
  type: String,
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
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
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
const Device = mongoose.model('Device', deviceSchema);
const Content = mongoose.model('Content', contentSchema);
const License = mongoose.model('License', licenseSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// --------------------- Functions ---------------------
async function addUser(u) { return (await new User(u).save())._id; }
async function getUser(id) { return User.findById(id); }
async function addDevice(d) { return (await new Device(d).save()).device_id; }
async function getDevice(id) { return Device.findById(id); }
async function addContent(c) { return (await new Content(c).save()).content_id; }
async function getContent(content_id) { return Content.findOne({ content_id }); }
async function addLicense(l) { return (await new License(l).save()).license_id; }
async function getActiveLicensesFor(content_id, device_id) { return License.find({ content_id, status: 'active' }); }
async function revokeLicense(license_id, by) {
  const doc = await License.findById(license_id);
  if (!doc) return false;
  doc.status = 'revoked';
  doc.revoked_by = by;
  doc.revoked_at = new Date();
  await doc.save();
  return true;
}
async function audit(event, data = {}) { await new AuditLog({ event, data }).save(); }

export { addUser, getUser, addDevice, getDevice, addContent, getContent, addLicense, getActiveLicensesFor, revokeLicense, audit };
