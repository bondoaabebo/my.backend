import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { cfg } from './config.js';
import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import coursesRoutes from './routes/courses.js';
import devicesRoutes from './routes/devices.js';
import playbackRoutes from './routes/playback.js';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/vouchers', vouchersRoutes);
app.use('/courses', coursesRoutes);
app.use('/devices', devicesRoutes);
app.use('/playback', playbackRoutes);

app.get('/', (req, res) => res.send('Edu Platform API Running'));

// Connect to MongoDB and start server
mongoose.connect(cfg.mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(cfg.port, () => console.log(`🚀 Server running on http://localhost:${cfg.port}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed', err);
  });
