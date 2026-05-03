'use strict';
function successResponse(data, meta = null) {
  const response = { success: true, data };
  if (meta) response.meta = meta;
  return response;
}

function errorResponse(code, message, details = null) {
  const error = { code, message };
  if (details) error.details = details;
  return { success: false, error };
}

function createdResponse(data) {
  return { success: true, data, created: true };
}

function noContentResponse() {
  return { success: true, data: null };
}

module.exports = { successResponse, errorResponse, createdResponse, noContentResponse };
