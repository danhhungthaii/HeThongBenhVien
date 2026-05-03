'use strict';

/**
 * master-data services (department, doctor, icd10, serviceCatalog)
 * These tables do NOT exist in HeThongBV yet — return stub data until they are created.
 * Columns for reference when tables are added later.
 */
const { poolPromise, sql } = require('../../database/database.real');

// ─── Departments ─────────────────────────────────────────────────────────────
// Table not in DB yet → stub (keeps API alive)
async function getDepartments() {
  return [];
}
async function getDepartmentById() { return null; }
async function createDepartment() { return { message: 'Departments table not yet in database' }; }
async function updateDepartment() { return null; }
async function deleteDepartment() { return null; }

// ─── Doctors ─────────────────────────────────────────────────────────────────
async function getDoctors() {
  return [];
}
async function getDoctorById() { return null; }
async function createDoctor() { return { message: 'Doctors table not yet in database' }; }
async function updateDoctor() { return null; }
async function deleteDoctor() { return null; }

// ─── ICD-10 ──────────────────────────────────────────────────────────────────
// Table: Cat_ICD10 (ICD10_Code, Disease_Name)
async function getICD10Codes(filters = {}) {
  const pool = await poolPromise;
  const req = pool.request();
  let where = '1=1';
  if (filters.search) {
    req.input('search', sql.NVarChar(100), `%${filters.search}%`);
    where += ' AND (ICD10_Code LIKE @search OR Disease_Name LIKE @search)';
  }
  if (filters.code) {
    req.input('code', sql.VarChar(10), filters.code);
    where += ' AND ICD10_Code = @code';
  }
  const result = await req.query(`SELECT TOP 100 * FROM Cat_ICD10 WHERE ${where} ORDER BY ICD10_Code`);
  return result.recordset.map(r => ({
    code: r.ICD10_Code,
    description_vn: r.Disease_Name,
  }));
}
async function getICD10ByCode(code) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('code', sql.VarChar(10), code)
    .query(`SELECT * FROM Cat_ICD10 WHERE ICD10_Code = @code`);
  if (!result.recordset[0]) return null;
  return { code: result.recordset[0].ICD10_Code, description_vn: result.recordset[0].Disease_Name };
}

// ─── Medical Services / Drugs ─────────────────────────────────────────────────
// Table: Cat_Drugs (Drug_ID, Drug_Name, Is_Insurance_Pay, Current_Stock)
async function getServiceCatalog(filters = {}) {
  const pool = await poolPromise;
  const req = pool.request();
  let where = '1=1';
  if (filters.search) {
    req.input('search', sql.NVarChar(100), `%${filters.search}%`);
    where += ' AND Drug_Name LIKE @search';
  }
  const result = await req.query(`SELECT * FROM Cat_Drugs WHERE ${where} ORDER BY Drug_Name`);
  return result.recordset.map(r => ({
    drug_id: r.Drug_ID,
    drug_name: r.Drug_Name,
    is_insurance: r.Is_Insurance_Pay,
    current_stock: r.Current_Stock,
  }));
}

module.exports = {
  // departments
  getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment,
  // doctors
  getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor,
  // icd10
  getICD10Codes, getICD10ByCode,
  // catalog (drugs)
  getServiceCatalog,
};
