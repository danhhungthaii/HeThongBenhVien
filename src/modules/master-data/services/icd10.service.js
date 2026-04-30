'use strict';
const db = require('../../../config/database');

async function searchIcd10(query, filters = {}) {
  let items = db.findAll('icd10Codes');

  if (query) {
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    items = items.filter(i =>
      i.code.toLowerCase().includes(query) ||
      i.description_vn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      (i.description_en && i.description_en.toLowerCase().includes(q))
    );
  }

  if (filters.chapter) {
    items = items.filter(i => i.chapter === filters.chapter);
  }
  if (filters.is_notifiable !== undefined) {
    items = items.filter(i => i.is_notifiable === (filters.is_notifiable === 'true'));
  }

  return items.slice(0, 50);
}

async function getIcd10ById(id) {
  return db.findOne('icd10Codes', i => i.icd10_id === parseInt(id));
}

async function getIcd10ByCode(code) {
  return db.findOne('icd10Codes', i => i.code === code);
}

async function createIcd10(data) {
  const existing = await getIcd10ByCode(data.code);
  if (existing) return null;
  const icd = {
    icd10_id: ++db.counters.icd10,
    code: data.code,
    description_vn: data.description_vn,
    description_en: data.description_en || null,
    chapter: data.chapter || null,
    is_notifiable: data.is_notifiable || false,
    created_at: new Date(),
  };
  return db.insert('icd10Codes', icd);
}

module.exports = { searchIcd10, getIcd10ById, getIcd10ByCode, createIcd10 };
