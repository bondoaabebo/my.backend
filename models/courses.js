import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: String,
  videoId: { type: String, index: true },
  durationSec: Number
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  videos: [videoSchema],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Course', courseSchema);
