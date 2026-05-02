'use strict';
const request = require('supertest');
const { app } = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Patient API — Smoke Test', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .set('Content-Type', 'application/json');
    adminToken = res.body.data.accessToken;
  });

  describe('GET /patients', () => {
    it('✅ danh sách bệnh nhân — auth required', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/patients`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('❌ 401 khi không có token', async () => {
      const res = await request(app).get(`${API_PREFIX}/patients`);
      expect(res.status).toBe(401);
    });

    it('✅ search bệnh nhân theo tên', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/patients?search=${encodeURIComponent('Nguyễn')}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ filter theo gender', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/patients?gender=male`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /patients', () => {
    it('✅ tạo bệnh nhân thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/patients`)
        .send({
          full_name: 'Test Patient Smoke',
          phone: '0999999999',
          cccd: '079099999999',
          dob: '1990-01-01',
          gender: 'male',
          address: '123 Test Street',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('patient_id');
      expect(res.body.data.patient_id).toMatch(/^BV-\d{8}-\d{4}$/);
    });

    it('❌ tạo bệnh nhân thất bại — thiếu full_name', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/patients`)
        .send({ phone: '0999999998' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('❌ tạo bệnh nhân thất bại — trùng CCCD/phone (duplicate detection)', async () => {
      await request(app)
        .post(`${API_PREFIX}/patients`)
        .send({ full_name: 'Dupe Test', phone: '0888888888', cccd: '079088888888' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const res = await request(app)
        .post(`${API_PREFIX}/patients`)
        .send({ full_name: 'Dupe Test 2', phone: '0888888888', cccd: '079088888888' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty('code', 'DUPLICATE_DETECTED');
      expect(res.body.error.details).toBeInstanceOf(Array);
    });
  });

  describe('GET /patients/:id', () => {
    it('✅ lấy chi tiết bệnh nhân thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/patients`)
        .set('Authorization', `Bearer ${adminToken}`);

      const patientId = listRes.body.data[0].patient_id;

      const res = await request(app)
        .get(`${API_PREFIX}/patients/${patientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('patient_id', patientId);
    });

    it('❌ 404 khi bệnh nhân không tồn tại', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/patients/BV-99999999-9999`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toHaveProperty('code', 'NOT_FOUND');
    });
  });

  describe('PUT /patients/:id', () => {
    it('✅ cập nhật bệnh nhân thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/patients`)
        .set('Authorization', `Bearer ${adminToken}`);

      const patientId = listRes.body.data[0].patient_id;

      const res = await request(app)
        .put(`${API_PREFIX}/patients/${patientId}`)
        .send({ allergy: 'Penicillin, Seafood', emergency_contact: 'John Doe - 0900000000' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('allergy', 'Penicillin, Seafood');
    });
  });

  describe('DELETE /patients/:id', () => {
    it('✅ soft delete bệnh nhân thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/patients`)
        .set('Authorization', `Bearer ${adminToken}`);

      const patientId = listRes.body.data[0].patient_id;

      const res = await request(app)
        .delete(`${API_PREFIX}/patients/${patientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });
});
