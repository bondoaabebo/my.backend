import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // تاريخ نهاية الاشتراك
  subscriptionEndDate: { type: Date, required: true },

  // قائمة الأجهزة المفعّلة (لتحديد الجهاز المسموح له)
  activeDevices: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
