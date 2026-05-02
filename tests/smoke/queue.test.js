'use strict';
const request = require('supertest');
const app = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Queue API — Smoke Test', () => {
  let adminToken;

  beforeAll(async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/auth/login`)
      .send({ username: 'admin', password: 'admin123' })
      .set('Content-Type', 'application/json');
    adminToken = res.body.data.accessToken;
  });

  describe('POST /queue/tickets', () => {
    it('✅ tạo ticket thành công', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue`)
        .send({ patient_id: 'BV-20260427-0001', department_id: 1, priority: 'normal' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('ticket_id');
      expect(res.body.data).toHaveProperty('ticket_number');
      expect(res.body.data.ticket_number).toMatch(/^Q\d{3}$/);
    });

    it('✅ tạo ticket ưu tiên cấp cứu', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue`)
        .send({ patient_id: 'BV-20260427-0001', department_id: 1, priority: 'emergency' })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('priority', 'emergency');
    });
  });

  describe('GET /queue/tickets', () => {
    it('✅ danh sách ticket', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/queue`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('✅ filter theo department', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/queue?department_id=1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('✅ filter theo status', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/queue?status=waiting`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /queue/call-next', () => {
    it('✅ gọi bệnh nhân tiếp theo', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue/call-next?department_id=1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.ticket_id) {
        expect(res.body.data).toHaveProperty('status', 'called');
        expect(res.body.data).toHaveProperty('called_at');
      }
    });

    it('❌ 400 khi thiếu department_id', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue/call-next`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /queue/:id/complete', () => {
    it('✅ hoàn thành ticket', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue`)
        .send({ patient_id: 'BV-20260427-0001', department_id: 2 })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const ticketId = res.body.data.ticket_id;

      const completeRes = await request(app)
        .put(`${API_PREFIX}/queue/${ticketId}/complete`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data).toHaveProperty('status', 'completed');
      expect(completeRes.body.data).toHaveProperty('completed_at');
    });
  });

  describe('PUT /queue/:id/skip', () => {
    it('✅ bỏ qua ticket', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/queue`)
        .send({ patient_id: 'BV-20260427-0002', department_id: 1 })
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Content-Type', 'application/json');

      const ticketId = res.body.data.ticket_id;

      const skipRes = await request(app)
        .put(`${API_PREFIX}/queue/${ticketId}/skip`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(skipRes.status).toBe(200);
      expect(skipRes.body.data).toHaveProperty('status', 'skipped');
    });
  });

  describe('GET /queue/waiting-count', () => {
    it('✅ số người đang chờ', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/queue/waiting-count?department_id=1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('waiting');
      expect(typeof res.body.data.waiting).toBe('number');
    });
  });
});
