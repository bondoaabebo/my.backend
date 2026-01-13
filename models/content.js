import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    content_id: {
      type: String,
      required: true,
      unique: true
    },
    aesKey: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);
