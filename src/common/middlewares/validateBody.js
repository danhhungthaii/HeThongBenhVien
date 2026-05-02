const { AppError } = require('../errors/AppError');

function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new AppError('Validation failed', 400, result.error.flatten()));
      return;
    }

    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };