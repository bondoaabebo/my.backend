// backend/models/License.js
import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // كود الترخيص الفريد
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // صاحب الترخيص
  validFrom: { type: Date, default: Date.now }, // بداية الترخيص
  validUntil: { type: Date, required: true }, // نهاية الترخيص
  maxDevices: { type: Number, default: 3 }, // عدد الأجهزة المسموح بها
  kmsKey: { type: String, required: true }, // مفتاح KMS للتشفير
  playbackSecret: { type: String }, // لو في مفتاح تشغيل الفيديو
  isActive: { type: Boolean, default: true }, // هل الترخيص مفعل
  redeemedOn: { type: Date }, // لو تم استهلاك الترخيص
}, { timestamps: true }); // يحفظ createdAt و updatedAt تلقائي

// Index للكود عشان البحث يكون سريع
licenseSchema.index({ code: 1 });

const License = mongoose.model("License", licenseSchema);

export default License;
