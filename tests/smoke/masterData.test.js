'use strict';
const request = require('supertest');
const { app } = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Master Data API — Smoke Test', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .set('Content-Type', 'application/json');
    adminToken = res.body.data.accessToken;
  });

  describe('GET /master-data/departments', () => {
    it('✅ danh sách departments', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/departments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('✅ filter theo department_type', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/departments?department_type=clinical`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ search theo tên', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/departments?search=Tim`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /master-data/services', () => {
    it('✅ danh sách services', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/services`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('✅ filter theo category', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/services?category=consultation`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ filter BHYT services', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/services?is_bhyt=true`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /master-data/icd10/search', () => {
    it('✅ search ICD-10 theo code', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/icd10/search?q=J06`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ search ICD-10 theo mô tả (tiếng Việt)', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/icd10/search?q=sot`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ search không dấu tìm đúng tiếng Việt có dấu', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/icd10/search?q=trem cam`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ filter theo chapter', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/icd10/search?q=&chapter=J`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ giới hạn kết quả 50 items', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/icd10/search?q=`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(50);
    });
  });

  describe('GET /master-data/doctors', () => {
    it('✅ danh sách doctors', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/doctors`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ filter theo specialty', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/master-data/doctors?specialty=Tim`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /master-data/departments', () => {
    it('✅ tạo department mới', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/master-data/departments`)
        .send({ department_name: 'Khoa Xét nghiệm', department_type: 'support', department_code: 'KXN' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('department_name', 'Khoa Xét nghiệm');
    });
  });

  describe('POST /master-data/services', () => {
    it('✅ tạo service mới', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/master-data/services`)
        .send({
          service_code: 'TEST001',
          service_name: 'Xét nghiệm máu test',
          category: 'lab',
          department_id: 6,
          base_price: 150000,
          bhyt_price: 120000,
          is_bhyt: true,
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
    });
  });
});
