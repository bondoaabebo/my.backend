import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { signPlaybackToken, verifyPlaybackToken } from '../utils/tokens.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Device from '../models/Device.js';

const r = Router();

r.post('/token', authRequired, async (req,res) => {
  const { courseId, videoId, deviceId } = req.body;
  if (!courseId || !videoId || !deviceId) return res.status(400).json({ error: 'courseId, videoId, deviceId required' });

  const dev = await Device.findOne({ user:req.user.id, deviceId });
  if (!dev) return res.status(403).json({ error: 'Unregistered device' });

  const en = await Enrollment.findOne({ user:req.user.id, course:courseId, expiresAt: {$gt:new Date()} });
  if (!en) return res.status(403).json({ error: 'Not enrolled or expired' });

  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) return res.status(404).json({ error: 'Course not found' });
  const v = course.videos.find(x=>x.videoId===videoId);
  if (!v) return res.status(404).json({ error: 'Video not found' });

  const token = signPlaybackToken({ sub:req.user.id, courseId, videoId, deviceId }, '1h');
  const playbackUrl = `/playback/stream/${videoId}?token=${token}`;
  res.json({ playbackUrl, watermark:{ name:req.user.name||'', id:req.user.id } });
});

r.get('/stream/:videoId', async (req,res)=>{
  const { token } = req.query;
  if(!token) return res.status(401).json({ error:'Missing token' });

  try{
    const decoded = verifyPlaybackToken(token);
    if(decoded.videoId !== req.params.videoId) throw new Error('Video mismatch');

    const fakeHls = `https://example-cdn.com/protected/${decoded.videoId}/index.m3u8?xpt=${encodeURIComponent(token)}`;

    // 🔒 منع التخزين المؤقت
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.redirect(302, fakeHls);
  }catch{
    return res.status(401).json({ error:'Invalid/expired token' });
  }
});


export default r;
