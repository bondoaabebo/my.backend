import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
});

// 👇 هنا التعديل المهم
export default mongoose.model("Admin", adminSchema, "admins");
