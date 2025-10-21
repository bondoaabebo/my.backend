import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import winston from 'winston';

import { cfg } from './config.js';
import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import coursesRoutes from './routes/courses.js';
import devicesRoutes from './routes/devices.js';
import playbackRoutes from './routes/playback.js';

// --------------------- Logger Setup ---------------------
const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/requests.log' }),
    new winston.transports.Console()
  ]
});

const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/errors.log' }),
    new winston.transports.Console()
  ]
});

const app = express();

// --------------------- Middleware ---------------------
app.use(cors({ origin: 'https://yourfrontend.com' })); // ضع دومين الواجهة الأمامية
app.use(helmet());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestLogger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// --------------------- Rate Limiting ---------------------
// عام لجميع المسارات
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // أقصى 200 طلب لكل IP
  standardHeaders: true,
  legacyHeaders: false,
});

// خاص بالمسارات الحساسة مثل auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 50, // أقصى 50 طلب لكل IP
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// --------------------- Routes ---------------------
app.use('/auth', authLimiter, authRoutes); // حماية إضافية لمسار auth
app.use('/vouchers', vouchersRoutes);
app.use('/courses', coursesRoutes);
app.use('/devices', devicesRoutes);
app.use('/playback', playbackRoutes);

app.get('/', (req, res) => res.send('Edu Platform API Running'));

// --------------------- Error Middleware ---------------------
app.use((err, req, res, next) => {
  errorLogger.error(`${req.method} ${req.originalUrl} - ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --------------------- Start Server ---------------------
mongoose.connect(cfg.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    requestLogger.info('✅ Connected to MongoDB');
    app.listen(cfg.port, () => requestLogger.info(`🚀 Server running on http://localhost:${cfg.port}`));
  })
  .catch(err => errorLogger.error('❌ MongoDB connection failed', err));

// --------------------- Handle Unhandled Errors ---------------------
process.on('unhandledRejection', (reason) => {
  errorLogger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  errorLogger.error('Uncaught Exception:', err);
  process.exit(1);
});
