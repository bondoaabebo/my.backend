import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url'; // لإصلاح __dirname
import { cfg } from "./src/config.js";

import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import coursesRoutes from './routes/courses.js';
import devicesRoutes from './routes/device.js';
import playbackRoutes from './routes/playback.js';

const app = express();

// إصلاح __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes
app.use('/auth', authRoutes);
app.use('/vouchers', vouchersRoutes);
app.use('/courses', coursesRoutes);
app.use('/devices', devicesRoutes);
app.use('/playback', playbackRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: "الربط ناجح ✅" });
});

// Catch-all for frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Connect to MongoDB and start server
mongoose.connect(cfg.mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(cfg.port, () => console.log(`🚀 Server running on http://localhost:${cfg.port}`));
  })
  .catch(err => console.error('❌ MongoDB connection failed', err));
