'use strict';

/**
 * Mock Database Layer — thay thế SQL Server để test API.
 * Tất cả dữ liệu lưu trong memory, reset khi server restart.
 * Khi có DB thật: thay thế bằng src/config/database.js
 */

const { v4: uuidv4 } = require('uuid');

const USE_MOCK_DB = true;

// ─── Auto-increment counters ──────────────────────────────────────────────────
let counters = {
  user: 0,
  role: 0,
  permission: 0,
  audit: 0,
  patient: 0,
  appointment: 0,
  queueTicket: 0,
  encounter: 0,
  clinicalOrder: 0,
  prescription: 0,
  progressNote: 0,
  drug: 0,
  department: 0,
  service: 0,
  icd10: 0,
  doctor: 0,
  systemConfig: 0,
};

// ─── In-memory data stores ───────────────────────────────────────────────────
const db = {
  // M0 – Auth
  users: [],
  roles: [],
  permissions: [],
  userPermissions: [],
  auditLogs: [],
  systemConfigs: [],

  // M0 – Master Data
  departments: [],
  services: [],
  icd10Codes: [],
  doctors: [],

  // M1 – Patient & Appointment
  patients: [],
  appointments: [],
  queueTickets: [],
  encounters: [],
  clinicalOrders: [],
  prescriptions: [],
  drugs: [],
  progressNotes: [],
  notifications: [],
};

// ─── Seed data ───────────────────────────────────────────────────────────────
function seedData() {
  // Roles
  const roles = [
    { role_name: 'Admin', description: 'Quản trị hệ thống' },
    { role_name: 'Doctor', description: 'Bác sĩ' },
    { role_name: 'Nurse', description: 'Điều dưỡng' },
    { role_name: 'Pharmacist', description: 'Dược sĩ' },
    { role_name: 'Accountant', description: 'Kế toán' },
    { role_name: 'Receptionist', description: 'Tiếp tân' },
    { role_name: 'DepartmentHead', description: 'Trưởng khoa' },
  ];
  roles.forEach(r => {
    db.roles.push({ role_id: ++counters.role, ...r, is_active: true, created_at: new Date() });
  });

  // Permissions
  const perms = [
    { resource: 'auth', actions: ['login', 'logout', 'refresh'] },
    { resource: 'patients', actions: ['create', 'read', 'update', 'delete', 'merge'] },
    { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'queue', actions: ['create', 'read', 'update', 'call'] },
    { resource: 'encounters', actions: ['create', 'read', 'update'] },
    { resource: 'prescriptions', actions: ['create', 'read', 'update'] },
    { resource: 'lab', actions: ['create', 'read', 'update', 'verify'] },
    { resource: 'pharmacy', actions: ['create', 'read', 'update', 'dispense'] },
    { resource: 'billing', actions: ['create', 'read', 'update', 'pay'] },
    { resource: 'inpatient', actions: ['create', 'read', 'update', 'discharge'] },
    { resource: 'staff', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'equipment', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'export'] },
    { resource: 'master-data', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'audit-logs', actions: ['read'] },
    { resource: 'system-config', actions: ['read', 'update'] },
  ];
  perms.forEach(p => {
    p.actions.forEach(action => {
      db.permissions.push({
        permission_id: ++counters.permission,
        resource: p.resource,
        action,
        description: `${action} ${p.resource}`,
      });
    });
  });

  // Admin user (password: admin123)
  db.users.push({
    user_id: ++counters.user,
    username: 'admin',
    password_hash: '$2a$12$qO2R6ElZYi16hdorjCdAtuXzGo9Iup5yQX8Pf1oCbFY6DEYQzSrXS', // admin123
    email: 'admin@hospital.vn',
    role: 'Admin',
    staff_id: null,
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Doctor user (password: doctor123)
  db.users.push({
    user_id: ++counters.user,
    username: 'doctor01',
    password_hash: '$2a$12$T87rmtPGSFfhyYkWAa6YS.1x/slg91Zo2pSFjOHr/YAerRvcM0LX6', // doctor123
    email: 'doctor01@hospital.vn',
    role: 'Doctor',
    staff_id: null,
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Receptionist user (password: receptionist123)
  db.users.push({
    user_id: ++counters.user,
    username: 'receptionist01',
    password_hash: '$2a$12$15wxLggqqh2xBwW05APrruCLIrHImcxX0T.kkpH0VO.oU1WkMCJq.', // receptionist123
    email: 'receptionist@hospital.vn',
    role: 'Receptionist',
    staff_id: null,
    is_active: true,
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Grant all permissions to Admin
  db.permissions.forEach(p => {
    db.userPermissions.push({ user_id: 1, permission_id: p.permission_id });
  });

  // Departments
  const depts = [
    { department_code: 'KTMH', department_name: 'Khoa Tim mạch', department_type: 'clinical' },
    { department_code: 'KHN', department_name: 'Khoa Hô hấp', department_type: 'clinical' },
    { department_code: 'KTHN', department_name: 'Khoa Thần kinh', department_type: 'clinical' },
    { department_code: 'KDAL', department_name: 'Khoa Da liễu', department_type: 'clinical' },
    { department_code: 'KNH', department_name: 'Khoa Nhi', department_type: 'clinical' },
    { department_code: 'KHCLS', department_name: 'Khoa Cận lâm sàng', department_type: 'support' },
    { department_code: 'KTM', department_name: 'Khoa Dược', department_type: 'support' },
    { department_code: 'KTVP', department_name: 'Khoa Tài vụ - Kế toán', department_type: 'support' },
  ];
  depts.forEach(d => {
    db.departments.push({ department_id: ++counters.department, ...d, head_doctor_id: null, floor: null, is_active: true, created_at: new Date() });
  });

  // Medical Services
  const services = [
    { service_code: 'KHAM', service_name: 'Khám bệnh', category: 'consultation', department_id: 1, base_price: 50000, bhyt_price: 40000, is_bhyt: true },
    { service_code: 'XQUANG', service_name: 'X-quang ngực', category: 'imaging', department_id: 6, base_price: 120000, bhyt_price: 96000, is_bhyt: true },
    { service_code: 'SIEUAM', service_name: 'Siêu âm bụng', category: 'imaging', department_id: 6, base_price: 150000, bhyt_price: 120000, is_bhyt: true },
    { service_code: 'XETNGHIEM', service_name: 'Xét nghiệm máu tổng quát', category: 'lab', department_id: 6, base_price: 200000, bhyt_price: 160000, is_bhyt: true },
    { service_code: 'ECG', service_name: 'Điện tâm đồ (ECG)', category: 'cardiology', department_id: 1, base_price: 80000, bhyt_price: 64000, is_bhyt: true },
  ];
  services.forEach(s => {
    db.services.push({ service_id: ++counters.service, ...s, is_active: true, created_at: new Date() });
  });

  // Drugs catalog (sample for M2 rules)
  const drugs = [
    { drug_name: 'Paracetamol 500mg', active_ingredient: 'Paracetamol', is_bhyt: true, current_stock: 120 },
    { drug_name: 'Amoxicillin 500mg', active_ingredient: 'Amoxicillin', is_bhyt: true, current_stock: 80 },
    { drug_name: 'Cefixime 200mg', active_ingredient: 'Cefixime', is_bhyt: false, current_stock: 40 },
    { drug_name: 'Cetirizine 10mg', active_ingredient: 'Cetirizine', is_bhyt: true, current_stock: 60 },
    { drug_name: 'Ibuprofen 400mg', active_ingredient: 'Ibuprofen', is_bhyt: false, current_stock: 25 },
  ];
  drugs.forEach(d => {
    db.drugs.push({ drug_id: ++counters.drug, ...d, is_active: true, created_at: new Date() });
  });

  // ICD-10 Codes (sample)
  const icds = [
    { code: 'J06.9', description_vn: 'Nhiễm trùng hô hấp cấp trên, không xác định', chapter: 'J', is_notifiable: false },
    { code: 'I10', description_vn: 'Tăng huyết áp (nguyên phát)', chapter: 'I', is_notifiable: false },
    { code: 'E11.9', description_vn: 'Đái tháo đường type 2, không có biến chứng', chapter: 'E', is_notifiable: false },
    { code: 'J18.9', description_vn: 'Viêm phổi, không xác định', chapter: 'J', is_notifiable: true },
    { code: 'A00.9', description_vn: 'Tả không xác định', chapter: 'A', is_notifiable: true },
    { code: 'K29.5', description_vn: 'Viêm dạ dày mạn tính', chapter: 'K', is_notifiable: false },
    { code: 'M54.5', description_vn: 'Đau lưng dưới', chapter: 'M', is_notifiable: false },
    { code: 'F32.9', description_vn: 'Rối loạn trầm cảm, không xác định', chapter: 'F', is_notifiable: false },
    { code: 'N39.0', description_vn: 'Nhiễm trùng đường tiết niệu', chapter: 'N', is_notifiable: false },
    { code: 'R50.9', description_vn: 'Sốt không xác định', chapter: 'R', is_notifiable: false },
  ];
  icds.forEach(i => {
    db.icd10Codes.push({ icd10_id: ++counters.icd10, ...i, description_en: null, created_at: new Date() });
  });

  // Doctors
  const doctors = [
    { staff_id: null, specialty: 'Tim mạch', license_number: 'BS001', license_expiry: '2030-12-31' },
    { staff_id: null, specialty: 'Hô hấp', license_number: 'BS002', license_expiry: '2029-06-30' },
    { staff_id: null, specialty: 'Nhi', license_number: 'BS003', license_expiry: '2028-12-31' },
    { staff_id: null, specialty: 'Da liễu', license_number: 'BS004', license_expiry: '2027-09-30' },
  ];
  doctors.forEach(d => {
    db.doctors.push({ doctor_id: ++counters.doctor, ...d, is_active: true, created_at: new Date() });
  });

  // System configs
  const configs = [
    { config_key: 'hospital_name', config_value: 'Bệnh viện Đa khoa Trung ương', description: 'Tên bệnh viện' },
    { config_key: 'hospital_address', config_value: '123 Nguyễn Trãi, Quận 1, TP.HCM', description: 'Địa chỉ bệnh viện' },
    { config_key: 'hospital_phone', config_value: '028-1234-5678', description: 'SĐT bệnh viện' },
    { config_key: 'appointment_reminder_before_hours', config_value: '24', description: 'Số giờ trước khi nhắc hẹn' },
    { config_key: 'min_password_length', config_value: '8', description: 'Độ dài tối thiểu mật khẩu' },
    { config_key: 'max_login_attempts', config_value: '5', description: 'Số lần đăng nhập tối đa' },
  ];
  configs.forEach(c => {
    db.systemConfigs.push({ config_id: ++counters.systemConfig, ...c, updated_at: new Date() });
  });

  // Sample patients
  const patients = [
    {
      patient_id: 'BV-20260427-0001',
      full_name: 'Nguyễn Văn An',
      dob: '1985-03-15',
      gender: 'male',
      cccd: '079085001234',
      address: '123 Lê Lợi, Quận 1, TP.HCM',
      phone: '0901234567',
      email: 'nvnan@email.com',
      blood_type: 'O',
      allergy: null,
      insurance_id: 'DN123456789',
      insurance_expire: '2027-12-31',
      bhyt_coverage_rate: 0.8,
      emergency_contact: 'Trần Thị Bình - 0912345678',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      patient_id: 'BV-20260427-0002',
      full_name: 'Trần Thị Minh',
      dob: '1992-07-22',
      gender: 'female',
      cccd: '079092007891',
      address: '456 Đồng Khởi, Quận 1, TP.HCM',
      phone: '0909876543',
      email: 'ttminh@email.com',
      blood_type: 'A',
      allergy: 'Penicillin',
      insurance_id: 'DN987654321',
      insurance_expire: '2026-06-30',
      bhyt_coverage_rate: 0.8,
      emergency_contact: 'Lê Văn Cường - 0934567890',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  patients.forEach(p => {
    db.patients.push(p);
  });

  // Sample appointments
  db.appointments.push({
    appointment_id: ++counters.appointment,
    patient_id: 'BV-20260427-0001',
    doctor_id: 1,
    department_id: 1,
    appointment_date: '2026-05-02',
    slot_time: '08:00',
    status: 'confirmed',
    notes: 'Khám định kỳ tim mạch',
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Sample queue
  db.queueTickets.push({
    ticket_id: ++counters.queueTicket,
    ticket_number: 'Q001',
    patient_id: 'BV-20260427-0001',
    doctor_id: null,
    department_id: 1,
    priority: 'normal',
    status: 'waiting',
    created_at: new Date(),
    called_at: null,
    completed_at: null,
  });

  console.log('[MockDB] Seed data loaded successfully');
}

seedData();

// ─── Query helpers ────────────────────────────────────────────────────────────
function findOne(table, predicate) {
  return db[table].find(predicate) || null;
}

function findMany(table, predicate) {
  return db[table].filter(predicate);
}

function findAll(table) {
  return [...db[table]];
}

function insert(table, data) {
  db[table].push(data);
  return data;
}

function update(table, predicate, changes) {
  const items = db[table];
  const updated = [];
  items.forEach((item, idx) => {
    if (predicate(item)) {
      items[idx] = { ...item, ...changes, updated_at: new Date() };
      updated.push(items[idx]);
    }
  });
  return updated;
}

function remove(table, predicate) {
  const before = db[table].length;
  db[table] = db[table].filter(item => !predicate(item));
  return db[table].length < before;
}

function count(table, predicate) {
  if (predicate) {
    return db[table].filter(predicate).length;
  }
  return db[table].length;
}

function paginate(table, items, page, pageSize) {
  const total = items.length;
  const offset = (page - 1) * pageSize;
  return {
    data: items.slice(offset, offset + pageSize),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

module.exports = {
  db,
  USE_MOCK_DB,
  findOne,
  findMany,
  findAll,
  insert,
  update,
  remove,
  count,
  paginate,
  counters,
};
