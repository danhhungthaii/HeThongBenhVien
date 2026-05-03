'use strict';
const { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../constants');

function buildPaginationMeta(page, pageSize, total) {
  const p = Math.max(1, parseInt(page, 10) || DEFAULT_PAGE);
  const ps = Math.min(Math.max(1, parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const totalPages = Math.ceil(total / ps);
  return {
    page: p,
    pageSize: ps,
    total,
    totalPages,
  };
}

function getPaginationParams(query) {
  const page = parseInt(query.page, 10) || DEFAULT_PAGE;
  const pageSize = Math.min(parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = { buildPaginationMeta, getPaginationParams };
