const cors = require('cors');
const express = require('express');

const { errorHandler } = require('./common/middlewares/errorHandler');
const { notFound } = require('./common/middlewares/notFound');
const { requestLogger } = require('./common/middlewares/requestLogger');
const apiRouter = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', success: true, message: 'OK' });
});

app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;