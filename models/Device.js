import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  deviceId: { type: String, index: true },
  userAgent: String,
  lastSeenAt: Date
}, { timestamps: true });

deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

export default mongoose.model('Device', deviceSchema);
