'use strict';
const request = require('supertest');
const { app } = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Encounter API — Smoke Test', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .set('Content-Type', 'application/json');
    adminToken = res.body.data.accessToken;
  });

  describe('POST /encounters', () => {
    it('✅ tạo encounter thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/encounters`)
        .send({
          patient_id: 'BV-20260427-0001',
          doctor_id: 1,
          department_id: 1,
          visit_type: 'outpatient',
          chief_complaint: 'Đau đầu, sốt nhẹ 2 ngày',
          history_of_present_illness: 'Bệnh nhân sốt từ 2 ngày trước, kèm đau đầu',
          physical_exam: 'Mạch: 80 lần/phút. Nhiệt độ: 37.8°C. Huyết áp: 120/80 mmHg',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('encounter_id');
      expect(res.body.data).toHaveProperty('status', 'in_progress');
    });

    it('❌ tạo encounter thất bại — thiếu patient_id', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/encounters`)
        .send({ doctor_id: 1, department_id: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });

    it('❌ tạo encounter thất bại — thiếu doctor_id', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/encounters`)
        .send({ patient_id: 'BV-20260427-0001', department_id: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /encounters', () => {
    it('✅ danh sách encounters', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/encounters`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ filter theo patient_id', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/encounters?patient_id=BV-20260427-0001`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ filter theo doctor_id', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/encounters?doctor_id=1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /encounters/:id', () => {
    it('✅ lấy chi tiết encounter', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/encounters`)
        .set('Authorization', `Bearer ${adminToken}`);

      const encounterId = listRes.body.data[0].encounter_id;

      const res = await request(app)
        .get(`${API_PREFIX}/encounters/${encounterId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('encounter_id', encounterId);
    });
  });

  describe('PUT /encounters/:id/vitals', () => {
    it('✅ thêm vitals thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/encounters`)
        .set('Authorization', `Bearer ${adminToken}`);

      const encounterId = listRes.body.data[0].encounter_id;

      const res = await request(app)
        .put(`${API_PREFIX}/encounters/${encounterId}/vitals`)
        .send({
          blood_pressure: '120/80',
          heart_rate: 80,
          temperature: 37.5,
          respiratory_rate: 18,
          spO2: 98,
          weight: 65,
          height: 170,
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.vitals)).toBe(true);
      expect(res.body.data.vitals.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /encounters/:id/diagnosis', () => {
    it('✅ thêm chẩn đoán thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/encounters`)
        .set('Authorization', `Bearer ${adminToken}`);

      const encounterId = listRes.body.data[0].encounter_id;

      const res = await request(app)
        .put(`${API_PREFIX}/encounters/${encounterId}/diagnosis`)
        .send({
          icd10_code: 'J06.9',
          description: 'Nhiễm trùng hô hấp cấp trên',
          type: 'primary',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
    });
  });

  describe('PUT /encounters/:id/close', () => {
    it('✅ đóng encounter thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/encounters`)
        .send({
          patient_id: 'BV-20260427-0002',
          doctor_id: 2,
          department_id: 2,
          visit_type: 'outpatient',
          chief_complaint: 'Khám định kỳ',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const encounterId = res.body.data.encounter_id;

      const closeRes = await request(app)
        .put(`${API_PREFIX}/encounters/${encounterId}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data).toHaveProperty('status', 'completed');
    });
  });
});
