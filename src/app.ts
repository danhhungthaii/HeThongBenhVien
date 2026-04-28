import cors from 'cors';
import express from 'express';

import { errorHandler } from './common/middleware/errorHandler';
import { notFound } from './common/middleware/notFound';
import { requestLogger } from './common/middleware/requestLogger';
import apiRouter from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
