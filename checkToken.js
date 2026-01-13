import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

// -------------------------------------
// ضع هنا رابط البث الكامل من السيرفر
// مثال: http://localhost:8080/playback/stream/def456/index.m3u8?token=eyJ...
// -------------------------------------
const playbackUrl = 'http://localhost:8080/playback/stream/def456/index.m3u8?token=ضع_التوكن_هنا';

// -------------------------------------
// المفتاح السري المستخدم لإنشاء التوكن
// نفس المفتاح اللي في signPlaybackToken
// -------------------------------------
const secret = 'veryStrongSecret';

// -------------------------------------
// استخراج التوكن من الرابط
// -------------------------------------
function extractToken(urlString) {
  try {
    const parsedUrl = new URL(urlString);
    const token = parsedUrl.searchParams.get('token');
    if (!token) throw new Error('Token not found in URL');
    return token;
  } catch (err) {
    console.error('❌ خطأ في استخراج التوكن:', err.message);
    process.exit(1);
  }
}

// -------------------------------------
// التحقق من التوكن
// -------------------------------------
const token = extractToken(playbackUrl);

try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ التوكن صالح!');
  console.log('Decoded payload:', decoded);

  // تحويل وقت الانتهاء إلى تاريخ واضح
  const expDate = new Date(decoded.exp * 1000);
  console.log('⏰ التوكن ينتهي في:', expDate.toLocaleString());

  // -------------------------------------
  // التحقق من وجود ملفات الفيديو
  // -------------------------------------
  const videoId = decoded.videoId;
  const videoDir = path.join(process.cwd(), 'backend', 'videos', videoId);
  const indexFile = path.join(videoDir, 'index.m3u8');

  if (!fs.existsSync(indexFile)) {
    console.error(`❌ الملف index.m3u8 غير موجود في: ${videoDir}`);
    process.exit(1);
  }

  console.log(`✅ الملف index.m3u8 موجود في: ${videoDir}`);

  // قراءة الـ m3u8 والتأكد من وجود segments
  const manifest = fs.readFileSync(indexFile, 'utf-8');
  const segments = manifest.match(/\.ts|\.m4s/g);
  if (!segments || segments.length === 0) {
    console.warn('⚠️ لم يتم العثور على أي segments في الـ m3u8');
  } else {
    console.log(`✅ عدد segments الموجود: ${segments.length}`);
  }

} catch (err) {
  console.log('❌ التوكن غير صالح أو انتهت صلاحيته');
  console.error(err.message);
}
