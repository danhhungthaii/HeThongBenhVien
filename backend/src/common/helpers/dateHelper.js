'use strict';
const SQL_FORMATS = {
  DATE: 'dd/MM/yyyy',
  DATETIME: 'dd/MM/yyyy HH:mm:ss',
  TIME: 'HH:mm:ss',
};

function formatDate(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpired(expiryDate) {
  return new Date(expiryDate) < new Date();
}

module.exports = { formatDate, parseDate, addDays, diffDays, isExpired, SQL_FORMATS };
