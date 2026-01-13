import mongoose from "mongoose";
import { cfg } from "./config.js";
import Course from "./models/courses.js"; // تأكدي المسار صح

mongoose.connect(cfg.mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

const addCourse = async () => {
  const course = new Course({
    title: "كورس تجريبي",
    description: "هذا كورس للتجربة",
    isPublished: true, // ✅ لو عايزة يظهر في واجهة الـ admin
    videos: [
      {
        title: "الفيديو الأول",
        videoId: "abc123",
        durationSec: 300
      },
      {
        title: "الفيديو الثاني",
        videoId: "def456",
        durationSec: 420
      }
    ]
  });

  await course.save();
  console.log("✅ الكورس التجريبي اتسجل بنجاح");
  mongoose.disconnect();
};

addCourse();
