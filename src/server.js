// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import fs from 'fs';
import winston from 'winston';

import { cfg } from './config.js';
import authRoutes from '../routes/auth.js';
import courseRoutes from '../routes/course.js';
import deviceRoutes from '../routes/device.js';
import licenseRoutes from '../routes/license.js';
import { addContent } from './lib/db.js';
import { createContentKey } from './lib/kms.js';

// logger setup
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '100kb' }));

// rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/device', deviceRoutes);
app.use('/api/v1/license', licenseRoutes);

// bootstrap: create sample content (simulate KMS-wrapped content key)
(async () => {
  try {
    // check JWT keys exist (optional)
    if (!fs.existsSync(process.env.JWT_PRIVATE_KEY_PATH || '') || !fs.existsSync(process.env.JWT_PUBLIC_KEY_PATH || '')) {
      logger.warn('JWT keys not found. Place PEM files at configured paths.');
    }

    // connect DB
    await mongoose.connect(cfg.mongoUri);
    logger.info('✅ Connected to MongoDB');

    // create sample content key (simulate)
    const content_id = 'vid-1';
    const ck = await createContentKey(content_id);
    await addContent({ content_id, keyEncrypted: ck.wrappedKey, keyId: ck.keyId });
    logger.info('Sample content created: vid-1');

    // start server
    app.listen(cfg.port, () => logger.info(`🚀 License server listening on port ${cfg.port}`));
  } catch (err) {
    logger.error('❌ Server failed to start:', err);
    process.exit(1);
  }
})();
