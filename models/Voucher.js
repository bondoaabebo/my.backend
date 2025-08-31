import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  days: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Voucher', VoucherSchema);
