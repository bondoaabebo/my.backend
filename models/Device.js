import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true, unique: true },
  license_code: { type: String, required: true },
  device_info: { type: Object },
  status: { type: String, default: "active" },
  registered_at: { type: Date, default: Date.now },
});

export default mongoose.model("Device", deviceSchema);
