import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  days: { type: Number, default: 15 },
  courseId: { type: String, required: true }, // الكورس المرتبط بالكود
  redeemed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Voucher', VoucherSchema);
