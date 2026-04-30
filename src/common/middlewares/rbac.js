'use strict';
const { ForbiddenError } = require('../errors/AppError');

function rbac(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User not authenticated'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role '${req.user.role}' is not authorized`));
    }
    next();
  };
}

function requirePermission(resource, action) {
  return (req, res, next) => {
    const permissions = req.user?.permissions || [];
    const hasPermission = permissions.some(
      p => p.resource === resource && p.action === action
    );
    if (!hasPermission) {
      return next(new ForbiddenError(`Missing permission: ${resource}:${action}`));
    }
    next();
  };
}

module.exports = { rbac, requirePermission };
