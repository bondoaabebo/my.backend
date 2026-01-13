import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  deviceId: { type: String, default: null },
  courseId: { type: String, required: true }, // الكورس المرتبط بالكود
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  redeemedOn: { type: Date },
}, { timestamps: true });

const License = mongoose.model("License", licenseSchema);
export default License;
