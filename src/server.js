import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import winston from 'winston';

import { cfg } from '../../config.js';
import authRoutes from './routes/auth.js';
import vouchersRoutes from './routes/vouchers.js';
import coursesRoutes from './routes/courses.js';
import devicesRoutes from './routes/devices.js';
import playbackRoutes from './routes/playback.js';
import { createContentKey } from './lib/kms.js';
import { addContent } from './lib/db.js';

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
app.use(cors({ origin: 'https://my-frontend-blue-theta.vercel.app' }));
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    requestLogger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// --------------------- Rate Limiting ---------------------
const generalLimiter = rateLimit({ windowMs: 15*60*1000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 50, message: { error: 'Too many attempts, try later' } });

app.use(generalLimiter);

// --------------------- Routes ---------------------
app.use('/auth', authLimiter, authRoutes);
app.use('/vouchers', vouchersRoutes);
app.use('/courses', coursesRoutes);
app.use('/devices', devicesRoutes);
app.use('/playback', playbackRoutes);

app.get('/', (req, res) => res.send('Edu Platform API Running'));

// --------------------- Bootstrap sample content ---------------------
(async () => {
  try {
    await mongoose.connect(cfg.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    requestLogger.info('✅ Connected to MongoDB');

    const content_id = 'vid-1';
    const ck = await createContentKey(content_id);
    await addContent({ content_id, keyEncrypted: ck.wrappedKey, keyId: ck.keyId });
    requestLogger.info(`Sample content created: ${content_id}`);

    app.listen(cfg.port, () => requestLogger.info(` Server running on http://localhost:${cfg.port}`));
  } catch (err) {
    errorLogger.error('❌ Server startup failed', err);
    process.exit(1);
  }
})();

// --------------------- Error Middleware ---------------------
app.use((err, req, res, next) => {
  let logMessage = `${req.method} ${req.originalUrl} - ${err.stack}`;
  if (req.method === 'POST') logMessage += `\nBody: ${JSON.stringify(req.body)}\nHeaders: ${JSON.stringify(req.headers)}`;
  errorLogger.error(logMessage);
  res.status(500).json({ error: 'Internal Server Error' });
});

// --------------------- Handle Unhandled Errors ---------------------
process.on('unhandledRejection', (reason) => errorLogger.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => { errorLogger.error('Uncaught Exception:', err); process.exit(1); });
