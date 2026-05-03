'use strict';
const { ValidationError } = require('../errors/AppError');

function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const dataToValidate = { ...req.body, ...req.params, ...req.query };

    for (const [field, rules] of Object.entries(schema)) {
      const value = dataToValidate[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Field '${field}' is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rules.type === 'number' && isNaN(Number(value))) {
          errors.push(`Field '${field}' must be a number`);
        }
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push(`Field '${field}' must be a string`);
        }
        if (rules.type === 'date' && isNaN(Date.parse(value))) {
          errors.push(`Field '${field}' must be a valid date`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`Field '${field}' must be one of: ${rules.enum.join(', ')}`);
        }
        if (rules.minLength && String(value).length < rules.minLength) {
          errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && String(value).length > rules.maxLength) {
          errors.push(`Field '${field}' must not exceed ${rules.maxLength} characters`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError(errors.join('; '), errors));
    }
    next();
  };
}

module.exports = { validate };
