'use strict';
const { poolPromise, sql } = require('../../database/database.real');

async function searchIcd10(query, filters = {}) {
  const pool = await poolPromise;
  const req = pool.request();
  let where = '1=1';

  if (query) {
    req.input('q', sql.NVarChar(100), `%${query}%`);
    where += ' AND (ICD10_Code LIKE @q OR Disease_Name LIKE @q)';
  }

  const result = await req.query(`SELECT TOP 50 * FROM Cat_ICD10 WHERE ${where} ORDER BY ICD10_Code`);
  return result.recordset.map(r => ({
    icd10_id: r.ICD10_Code,
    code: r.ICD10_Code,
    description_vn: r.Disease_Name,
  }));
}

async function getIcd10ById(id) {
  return getIcd10ByCode(id);
}

async function getIcd10ByCode(code) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('code', sql.VarChar(10), code)
    .query(`SELECT * FROM Cat_ICD10 WHERE ICD10_Code = @code`);
  if (!result.recordset[0]) return null;
  const r = result.recordset[0];
  return { icd10_id: r.ICD10_Code, code: r.ICD10_Code, description_vn: r.Disease_Name };
}

async function createIcd10(data) {
  const pool = await poolPromise;
  await pool.request()
    .input('code', sql.VarChar(10), data.code)
    .input('name', sql.NVarChar(255), data.description_vn)
    .query(`INSERT INTO Cat_ICD10 (ICD10_Code, Disease_Name) VALUES (@code, @name)`);
  return getIcd10ByCode(data.code);
}

module.exports = { searchIcd10, getIcd10ById, getIcd10ByCode, createIcd10 };
