'use strict';
const request = require('supertest');
const { app } = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Appointment API — Smoke Test', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .set('Content-Type', 'application/json');
    adminToken = res.body.data.accessToken;
  });

  describe('GET /appointments', () => {
    it('✅ danh sách lịch hẹn', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/appointments`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ filter theo patient_id', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/appointments?patient_id=BV-20260427-0001`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ filter theo status', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/appointments?status=confirmed`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /appointments', () => {
    it('✅ tạo lịch hẹn thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/appointments`)
        .send({
          patient_id: 'BV-20260427-0001',
          doctor_id: 1,
          department_id: 1,
          appointment_date: '2026-05-10',
          slot_time: '09:00',
          notes: 'Khám định kỳ',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('appointment_id');
    });

    it('❌ tạo lịch hẹn thất bại — trùng slot', async () => {
      await request(app)
        .post(`${API_PREFIX}/appointments`)
        .send({
          patient_id: 'BV-20260427-0002',
          doctor_id: 1,
          department_id: 1,
          appointment_date: '2026-05-11',
          slot_time: '10:00',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const res = await request(app)
        .post(`${API_PREFIX}/appointments`)
        .send({
          patient_id: 'BV-20260427-0001',
          doctor_id: 1,
          department_id: 1,
          appointment_date: '2026-05-11',
          slot_time: '10:00',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });

    it('❌ tạo lịch hẹn thất bại — thiếu required fields', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/appointments`)
        .send({ patient_id: 'BV-20260427-0001' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });
  });

  describe('GET /appointments/available-slots', () => {
    it('✅ lấy slot trống của bác sĩ theo ngày', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/appointments/available-slots?doctor_id=1&date=2026-05-15`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(slot => {
        expect(slot).toHaveProperty('time');
        expect(slot).toHaveProperty('available');
        expect(typeof slot.available).toBe('boolean');
      });
    });

    it('❌ 400 khi thiếu doctor_id hoặc date', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/appointments/available-slots?doctor_id=1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /appointments/:id', () => {
    it('✅ cập nhật lịch hẹn thành công', async () => {
      const listRes = await request(app)
        .get(`${API_PREFIX}/appointments`)
        .set('Authorization', `Bearer ${adminToken}`);

      const appointmentId = listRes.body.data[0].appointment_id;

      const res = await request(app)
        .put(`${API_PREFIX}/appointments/${appointmentId}`)
        .send({ status: 'completed', notes: 'Đã khám xong' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /appointments/:id', () => {
    it('✅ hủy lịch hẹn thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/appointments`)
        .send({
          patient_id: 'BV-20260427-0001',
          doctor_id: 2,
          department_id: 2,
          appointment_date: '2026-06-01',
          slot_time: '11:00',
        })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const appointmentId = res.body.data.appointment_id;

      const cancelRes = await request(app)
        .delete(`${API_PREFIX}/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data).toHaveProperty('status', 'cancelled');
    });
  });
});
