// 🟢 رابط الباكند على Railway
const BACKEND_URL = 'https://mybackend-production-dd8d.up.railway.app';

// --------------------- Device ID ---------------------
function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

// --------------------- حماية الفيديو ---------------------
function applyCaptureGuards(videoEl) {
  document.addEventListener('visibilitychange', () => {
    videoEl.classList.toggle('blurred', document.hidden);
    if (document.hidden) videoEl.pause();
    else videoEl.play().catch(() => {});
  });

  videoEl.oncontextmenu = (e) => e.preventDefault();

  if ('disablePictureInPicture' in videoEl) {
    videoEl.disablePictureInPicture = true;
  }
}

// --------------------- طلبات API ---------------------
async function api(path, method = 'GET', body, token) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --------------------- تشغيل الفيديو ---------------------
document.getElementById('playBtn').addEventListener('click', async () => {
  const token = document.getElementById('authToken').value.trim();
  const courseId = document.getElementById('courseId').value.trim();
  const videoId = document.getElementById('videoId').value.trim();
  const deviceId = getDeviceId();
  const vid = document.getElementById('vid');
  const wm = document.getElementById('wm');

  try {
    // تسجيل الجهاز
    await api('/devices/register', 'POST', { device_pubkey_pem: deviceId, user_id: token }, token);

    // طلب توكن التشغيل
    const { playbackUrl, watermark } = await api(
      '/playback/token',
      'POST',
      { courseId, videoId, deviceId },
      token
    );

    // Watermark ديناميكي
    wm.textContent = `Student: ${watermark.name} | ID: ${watermark.id} | Device: ${deviceId}`;

    applyCaptureGuards(vid);

    // تشغيل الفيديو
    vid.src = `${BACKEND_URL}${playbackUrl}`;
    vid.preload = 'auto';
    await vid.play();

    // تحقق دوري من صلاحية التوكن
    const interval = setInterval(async () => {
      try {
        await api('/playback/verify', 'POST', { courseId, videoId, deviceId }, token);
      } catch {
        vid.pause();
        vid.classList.add('blurred');
        clearInterval(interval);
        alert('انتهت صلاحية التوكن أو الجهاز غير مصرح به');
      }
    }, 10000); // كل 10 ثواني
  } catch (e) {
    alert(`Error: ${e.message}`);
  }
});
