const cors = require('cors');
const express = require('express');

const { errorHandler } = require('./common/middleware/errorHandler');
const { notFound } = require('./common/middleware/notFound');
const { requestLogger } = require('./common/middleware/requestLogger');
const apiRouter = require('./routes');

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

module.exports = app;