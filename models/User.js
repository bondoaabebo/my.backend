import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionEndDate: { type: Date, required: true },
  activeDevices: { type: [String], default: [] },

  // حقول نسيت كلمة المرور
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;
