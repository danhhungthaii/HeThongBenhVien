'use strict';
// Auth
const MAX_LOGIN_ATTEMPTS = 5;
const ACCOUNT_LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_RESET_EXPIRY_MS = 30 * 60 * 1000;

// Pagination
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Appointment
const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

// Order
const ORDER_STATUS = {
  ORDERED: 'ordered',
  SAMPLE_COLLECTED: 'sample_collected',
  PROCESSING: 'processing',
  RESULTED: 'resulted',
  VERIFIED: 'verified',
  RELEASED: 'released',
  CANCELLED: 'cancelled',
};

const ORDER_TYPE = {
  LAB: 'lab',
  IMAGING: 'imaging',
  PROCEDURE: 'procedure',
  REFERRAL: 'referral',
};

// Payment
const PAYMENT_METHOD = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  E_WALLET: 'e_wallet',
  VIET_QR: 'viet_qr',
};

const PAYMENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

const BILL_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PARTIAL: 'partial',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// Patient
const PATIENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DECEASED: 'deceased',
  MERGED: 'merged',
};

// Bed
const BED_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
};

// Queue
const QUEUE_PRIORITY = {
  NORMAL: 'normal',
  PRIORITY: 'priority',
  EMERGENCY: 'emergency',
};

const QUEUE_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
};

// BHYT coverage rates
const BHYT_COVERAGE_RATES = {
  STANDARD: 0.80,
  CHILDREN_UNDER_6: 0.95,
  SERIOUS: 1.00,
  POOR: 1.00,
};

// Staff
const STAFF_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  RESIGNED: 'resigned',
};

// Shift types
const SHIFT_TYPE = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
  ON_CALL: 'on_call',
};

module.exports = {
  // Auth
  MAX_LOGIN_ATTEMPTS,
  ACCOUNT_LOCKOUT_DURATION_MS,
  TOKEN_EXPIRY_MS,
  REFRESH_TOKEN_EXPIRY_MS,
  MIN_PASSWORD_LENGTH,
  PASSWORD_RESET_EXPIRY_MS,
  // Pagination
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  // Status enums
  APPOINTMENT_STATUS,
  ORDER_STATUS,
  ORDER_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  BILL_STATUS,
  PATIENT_STATUS,
  BED_STATUS,
  QUEUE_PRIORITY,
  QUEUE_STATUS,
  STAFF_STATUS,
  SHIFT_TYPE,
  BHYT_COVERAGE_RATES,
};
