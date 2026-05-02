const asyncHandler = (handler) => {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
};

module.exports = { asyncHandler };