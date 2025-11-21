// backend/utils/email.js

// نسخة مؤقتة للتشغيل المحلي أو على سيرفر خارجي
// فقط تقوم بطباعة رسالة في الكونسول بدلاً من إرسال إيميل فعلي
export default function sendEmail(to, subject, text) {
  console.log(`Pretend sending email to ${to} with subject: ${subject}`);
  console.log(`Message content: ${text}`);
}

/*
لإرسال إيميل فعلي، يمكن استخدام مكتبة nodemailer:
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });
}
*/
