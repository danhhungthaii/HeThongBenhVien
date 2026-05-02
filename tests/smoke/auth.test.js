'use strict';
const request = require('supertest');
const app = require('../../src/app');

const API_PREFIX = '/api/v1';

describe('Auth API — Smoke Test', () => {

  describe('POST /auth/login', () => {
    it('✅ login thành công với tài khoản admin', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: 'admin123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).toHaveProperty('username', 'admin');
      expect(res.body.data.user).toHaveProperty('role', 'Admin');
    });

    it('✅ login thành công với tài khoản doctor', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'doctor01', password: 'doctor123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty('role', 'Doctor');
    });

    it('✅ login thành công với tài khoản receptionist', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'receptionist01', password: 'receptionist123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data.user).toHaveProperty('role', 'Receptionist');
    });

    it('❌ login thất bại — sai mật khẩu', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: 'wrongpassword' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('code', 'UNAUTHORIZED');
    });

    it('❌ login thất bại — sai username', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'nonexistent', password: 'admin123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('❌ login thất bại — thiếu body', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('POST /auth/refresh', () => {
    it('✅ refresh token thành công', async () => {
      const loginRes = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: 'admin123' })
        .set('Content-Type', 'application/json');

      const refreshToken = loginRes.body.data.refreshToken;

      const res = await request(app)
        .post(`${API_PREFIX}/auth/refresh`)
        .send({ refreshToken })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('❌ refresh thất bại — token không hợp lệ', async () => {
      const res = await request(app)
        .post(`${API_PREFIX}/auth/refresh`)
        .send({ refreshToken: 'invalid-token' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('✅ lấy profile thành công với token hợp lệ', async () => {
      const loginRes = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: 'admin123' })
        .set('Content-Type', 'application/json');

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .get(`${API_PREFIX}/auth/profile`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('username', 'admin');
    });

    it('❌ profile thất bại — không có token', async () => {
      const res = await request(app).get(`${API_PREFIX}/auth/profile`);
      expect(res.status).toBe(401);
    });

    it('❌ profile thất bại — token không hợp lệ', async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/auth/profile`)
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('✅ logout thành công', async () => {
      const loginRes = await request(app)
        .post(`${API_PREFIX}/auth/login`)
        .send({ username: 'admin', password: 'admin123' })
        .set('Content-Type', 'application/json');

      const token = loginRes.body.data.accessToken;

      const res = await request(app)
        .post(`${API_PREFIX}/auth/logout`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('Health check', () => {
    it('✅ health endpoint trả về ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });
});
