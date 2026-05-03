'use strict';
const { poolPromise, sql } = require('../../database/database.real');

async function getServices(filters = {}) {
  const pool = await poolPromise;
  const req = pool.request();
  let where = '1=1';

  if (filters.search) {
    req.input('search', sql.NVarChar(100), `%${filters.search}%`);
    where += ' AND Drug_Name LIKE @search';
  }
  if (filters.is_bhyt !== undefined) {
    req.input('isBhyt', sql.Bit, filters.is_bhyt === 'true' || filters.is_bhyt === true ? 1 : 0);
    where += ' AND Is_Insurance_Pay = @isBhyt';
  }

  const result = await req.query(`SELECT * FROM Cat_Drugs WHERE ${where} ORDER BY Drug_Name`);
  return result.recordset.map(r => ({
    service_id: r.Drug_ID,
    drug_id: r.Drug_ID,
    service_name: r.Drug_Name,
    drug_name: r.Drug_Name,
    is_bhyt: r.Is_Insurance_Pay,
    current_stock: r.Current_Stock,
  }));
}

async function getServiceById(id) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('id', sql.Int, id)
    .query(`SELECT * FROM Cat_Drugs WHERE Drug_ID = @id`);
  if (!result.recordset[0]) return null;
  const r = result.recordset[0];
  return { service_id: r.Drug_ID, drug_id: r.Drug_ID, service_name: r.Drug_Name, drug_name: r.Drug_Name, is_bhyt: r.Is_Insurance_Pay, current_stock: r.Current_Stock };
}

async function createService(data) {
  const pool = await poolPromise;
  const result = await pool.request()
    .input('name', sql.NVarChar(255), data.service_name || data.drug_name)
    .input('isBhyt', sql.Bit, data.is_bhyt ? 1 : 0)
    .input('stock', sql.Int, data.current_stock || 0)
    .query(`INSERT INTO Cat_Drugs (Drug_Name, Is_Insurance_Pay, Current_Stock) OUTPUT INSERTED.* VALUES (@name, @isBhyt, @stock)`);
  const r = result.recordset[0];
  return { service_id: r.Drug_ID, drug_id: r.Drug_ID, service_name: r.Drug_Name, is_bhyt: r.Is_Insurance_Pay, current_stock: r.Current_Stock };
}

async function updateService(id, changes) {
  const pool = await poolPromise;
  const req = pool.request().input('id', sql.Int, id);
  const sets = [];
  if (changes.service_name || changes.drug_name) { req.input('name', sql.NVarChar(255), changes.service_name || changes.drug_name); sets.push('Drug_Name = @name'); }
  if (changes.current_stock !== undefined) { req.input('stock', sql.Int, changes.current_stock); sets.push('Current_Stock = @stock'); }
  if (sets.length === 0) return getServiceById(id);
  await req.query(`UPDATE Cat_Drugs SET ${sets.join(', ')} WHERE Drug_ID = @id`);
  return getServiceById(id);
}

module.exports = { getServices, getServiceById, createService, updateService };
