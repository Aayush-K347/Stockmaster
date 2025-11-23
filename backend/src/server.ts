import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { productRouter } from './routes/products';
import { operationsRouter } from './routes/operations';
import { ledgerRouter } from './routes/ledger';
import { warehouseRouter } from './routes/warehouse';
import { testConnection } from './config/database';

const app = express();

app.use(
  cors({
    origin: [
      "https://stockmaster-red.vercel.app",  // ❌ Remove trailing slash
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],  // Add this
  })
);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);
app.use(pinoHttp({ logger: logger as any }));

app.get('/health', async (_req, res, next) => {
  try {
    await testConnection();
    res.json({ status: 'ok', service: env.appName });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api', warehouseRouter);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await testConnection();
  app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port}`);
  });
};

start().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
