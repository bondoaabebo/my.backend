// server.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { cfg } from "./src/config.js";

import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import coursesRoutes from './routes/courses.js';
import devicesRoutes from './routes/device.js';
import playbackRoutes from './routes/playback.js';

const app = express();

// Middlewareapp.use(cors({
app.use(cors({
  origin: "https://your-frontend.vercel.app", // ضع رابط مشروعك على Vercel
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/vouchers', vouchersRoutes);
app.use('/courses', coursesRoutes);
app.use('/devices', devicesRoutes);
app.use('/playback', playbackRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "✅ الربط ناجح" });
});

// البورت الديناميكي الخاص بـ Fly.io
const port = process.env.PORT || cfg.port;

// Connect to MongoDB and start server
mongoose.connect(cfg.mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch(err => console.error('❌ MongoDB connection failed', err));
