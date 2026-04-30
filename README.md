# HIS Backend — Hospital Information System

> API Backend cho Hệ thống Thông tin Bệnh viện (HIS).
> Backend Lead: Nguyễn Thanh Toàn | PM: Danh Hùng Thái

---

## 1. Quick Start

```bash
# 1. Clone & install
git clone <repo-url>
npm install

# 2. Configure environment
cp .env.example .env
# Chỉnh sửa .env: DB_HOST, DB_PASSWORD, JWT_SECRET

# 3. Run (mock DB — không cần SQL Server)
npm run dev
# Server: http://localhost:3000/api/v1

# 4. Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 2. Test Accounts (Mock DB)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor01` | `password` | Doctor |
| `receptionist01` | `password` | Receptionist |

---

## 3. API Base URL

```
http://localhost:3000/api/v1
```

---

## 4. API Endpoints Summary

> **Full API Specification:** Xem [API_SPEC.md](./API_SPEC.md) — đầy đủ request/response schemas, HTTP status, error codes.

### Auth & RBAC

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/auth/profile` | Lấy thông tin profile |

### Master Data

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/master-data/departments` | Danh sách khoa |
| GET | `/master-data/services` | Danh sách dịch vụ |
| GET | `/master-data/icd10/search?q=` | Tìm ICD-10 |
| GET | `/master-data/doctors` | Danh sách bác sĩ |
| POST/PUT/DELETE | `/master-data/departments\|services\|doctors` | CRUD |

### Patient

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/patients` | Danh sách bệnh nhân |
| POST | `/patients` | Tạo hồ sơ mới |
| GET | `/patients/:id` | Chi tiết bệnh nhân |
| PUT | `/patients/:id` | Cập nhật |
| DELETE | `/patients/:id` | Xóa mềm |
| POST | `/patients/search-duplicates` | Tìm trùng |
| POST | `/patients/merge` | Gộp hồ sơ |

### Appointment

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/appointments` | Danh sách lịch hẹn |
| POST | `/appointments` | Tạo lịch hẹn |
| GET | `/appointments/available-slots` | Slot trống |
| PUT | `/appointments/:id` | Cập nhật |
| DELETE | `/appointments/:id` | Hủy lịch hẹn |

### Queue

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/queue/tickets` | Danh sách số |
| POST | `/queue/tickets` | Lấy số |
| POST | `/queue/call-next` | Gọi số tiếp |
| PUT | `/queue/:id/complete` | Hoàn thành |
| PUT | `/queue/:id/skip` | Bỏ qua |
| GET | `/queue/waiting-count` | Số đang chờ |

### Encounter

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/encounters` | Danh sách phiên khám |
| POST | `/encounters` | Tạo phiên khám |
| PUT | `/encounters/:id` | Cập nhật |
| PUT | `/encounters/:id/vitals` | Thêm vitals |
| PUT | `/encounters/:id/diagnosis` | Thêm chẩn đoán |
| PUT | `/encounters/:id/close` | Đóng phiên |

### EMR

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/emr/patients/:id/history` | Timeline lịch sử khám |
| GET | `/emr/patients/:id/summary` | Tóm tắt bệnh nhân |

### RBAC & Audit

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/rbac/roles` | Danh sách roles |
| GET | `/rbac/permissions` | Danh sách permissions |
| GET | `/rbac/my-permissions` | Permissions của tôi |
| GET | `/audit-logs` | Nhật ký hệ thống |
| GET/PUT | `/system-config` | Cấu hình hệ thống |

---

## 5. Standard Response Format

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "pageSize": 20, "total": 150, "totalPages": 8 }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: full_name",
    "details": ["Missing required field: full_name"]
  }
}
```

---

## 6. Authentication

```bash
# Lấy token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Dùng token cho request
curl http://localhost:3000/api/v1/patients \
  -H "Authorization: Bearer <accessToken>"
```

---

## 7. Scripts

```bash
npm run dev          # Dev server (nodemon)
npm start            # Production
npm test             # Unit tests
npm run test:smoke   # Smoke tests (cần server đang chạy)
npm run test:coverage # Coverage report
npm run lint         # ESLint
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npm run format:check # Check format
npm run precommit    # Pre-commit hook: lint + format + test
```

---

## 8. Project Structure

```
his-backend/
├── src/
│   ├── app.js                    # Entry point
│   ├── config/                  # Cấu hình (DB, Redis, JWT)
│   ├── common/
│   │   ├── errors/              # Custom error classes
│   │   ├── middlewares/         # Auth, RBAC, validate, errorHandler...
│   │   ├── constants/           # Hằng số (status, limits)
│   │   └── helpers/             # Date, pagination, response helpers
│   ├── modules/                 # Feature modules
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── appointment/
│   │   ├── queue/
│   │   ├── encounter/
│   │   ├── master-data/
│   │   ├── emr/
│   │   ├── rbac/
│   │   ├── audit/
│   │   └── system-config/
│   ├── services/                # Shared services
│   └── database/
│       ├── mockDb.js            # In-memory DB (test)
│       └── migrations/          # SQL Server migrations
├── tests/
│   ├── helpers/apiHelper.js
│   ├── setup.js
│   └── smoke/                   # Smoke tests
├── .github/workflows/           # CI/CD (GitHub Actions)
├── .eslintrc.json
├── .prettierrc
├── .editorconfig
├── jest.config.js
├── BRANCH_STRATEGY.md
├── CLEAN_CODE_GUIDELINES.md
└── PROJECT_STATUS.md
```

---

## 9. Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | SQL Server (mssql) / Mock DB (in-memory) |
| Cache | Redis (ioredis) |
| Auth | JWT + bcrypt |
| Validation | Custom validate middleware |
| Logging | Winston + Morgan |
| Testing | Jest + Supertest |
| Queue | Bull (Redis-backed) |
| PDF | PDFKit |
| Realtime | Socket.io |

---

## 10. Branch & Commit Convention

Xem chi tiết: [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md)

```bash
# Feature branch
git checkout -b feat/m2-prescription-drug-interaction

# Commit
git commit -m "feat(prescription): add drug interaction checker"
```

---

## 11. Switching to Real SQL Server

```bash
# 1. Chỉnh sửa .env với DB thật
# 2. Đổi USE_MOCK_DB = false trong src/config/database.js
# 3. Chạy migrations
npm run migrate
npm run seed
# 4. Khởi động lại server
npm run dev
```
