# Backend Architecture — HIS Project

> Node.js + Express + SQL Server. Backend Lead: Nguyễn Thanh Toàn.
> Cập nhật khi có thay đổi cấu trúc.

---

## 1. Tổng quan kiến trúc

```
his-backend/
├── src/
│   ├── config/              # Cấu hình ứng dụng
│   ├── common/              # Shared utilities, middleware, errors, constants
│   ├── database/            # SQL Server connection, migrations, seeds
│   ├── modules/             # Feature modules (M0–M9)
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── appointment/
│   │   ├── queue/
│   │   ├── encounter/
│   │   ├── clinical-order/
│   │   ├── prescription/
│   │   ├── lab/
│   │   ├── pharmacy/
│   │   ├── billing/
│   │   ├── inpatient/
│   │   ├── staff/
│   │   ├── equipment/
│   │   └── report/
│   ├── routes/              # Tổng hợp tất cả routes
│   ├── services/            # Shared business services (notification, scheduler)
│   └── app.js               # Entry point
├── tests/                   # Unit tests
├── docs/                    # API docs, ERD, data dictionary
└── package.json
```

---

## 2. Chi tiết từng thành phần

### 2.1. `src/config/`

```
config/
├── index.js              # Merge env vars → exports config object
├── database.js           # SQL Server connection config (mssql)
├── redis.js              # Redis client (session, cache)
├── jwt.js                # JWT secret + expiry config
├── mail.js               # SMTP config (Nodemailer)
├── sms.js                # SMS provider config (VNPT/Twilio)
└── scheduler.js          # node-cron job definitions
```

### 2.2. `src/common/`

```
common/
├── errors/
│   ├── AppError.js       # Base error class
│   ├── NotFoundError.js
│   ├── ValidationError.js
│   ├── UnauthorizedError.js
│   └── ForbiddenError.js
├── middlewares/
│   ├── errorHandler.js   # Global error handler
│   ├── asyncHandler.js   # Wrap async route handlers
│   ├── auth.js           # JWT verification middleware
│   ├── rbac.js           # Role + permission check middleware
│   ├── validate.js       # Request body/params validation
│   ├── rateLimiter.js    # Rate limiting
│   ├── requestLogger.js  # Log incoming requests
│   └── cors.js           # CORS config
├── constants/
│   ├── index.js          # Re-export all constants
│   ├── appointmentStatus.js
│   ├── orderStatus.js
│   ├── paymentStatus.js
│   ├── patientStatus.js
│   ├── bedStatus.js
│   └── bhytCoverageRates.js
├── helpers/
│   ├── dateHelper.js     # Format, parse, diff date
│   ├── paginationHelper.js
│   ├── responseHelper.js # Standardized API response
│   ├── csvHelper.js      # Parse CSV import
│   └── pdfHelper.js      # PDF generation helpers
└── validators/
    └── index.js          # Re-export all Joi/express-validator schemas
```

### 2.3. `src/database/`

```
database/
├── connection.js          # mssql connection pool + connect/disconnect
├── migrations/            # Chạy lúc khởi động hoặc qua CLI
│   ├── 001_init_schema.sql
│   ├── 002_m0_auth.sql
│   ├── 003_m1_patient.sql
│   └── ...
└── seeds/                 # Dữ liệu ban đầu
    ├── 001_roles.sql
    ├── 002_departments.sql
    ├── 003_icd10.sql
    └── ...
```

### 2.4. `src/modules/` — Cấu trúc 1 module

> Mỗi module (M0–M9) tuân theo cấu trúc thống nhất.

```
modules/
└── <module-name>/
    ├── controllers/
    │   └── <feature>.controller.js
    ├── services/
    │   ├── <feature>.service.js       # Business logic
    │   └── <feature>.service.test.js  # Unit test
    ├── models/
    │   └── <feature>.model.js         # SQL queries, parameterized
    ├── routes/
    │   └── <feature>.routes.js        # Express router
    ├── validators/
    │   └── <feature>.validator.js    # Joi schemas
    └── docs/
        └── <feature>.md              # API documentation
```

#### Ví dụ: Module `auth` (M0)

```
modules/
└── auth/
    ├── controllers/
    │   └── auth.controller.js        # Route handlers
    ├── services/
    │   ├── auth.service.js           # Login, refresh token, forgot password
    │   ├── token.service.js          # JWT generation, validation, blacklist
    │   └── session.service.js        # Session management, Redis
    ├── models/
    │   └── user.model.js             # User queries
    ├── routes/
    │   └── auth.routes.js
    └── validators/
        └── auth.validator.js         # Login, forgot password schemas
```

#### Ví dụ: Module `patient` (M1)

```
modules/
└── patient/
    ├── controllers/
    │   ├── patient.controller.js     # CRUD patient
    │   └── patientHistory.controller.js
    ├── services/
    │   ├── patient.service.js        # Business logic
    │   ├── patientService.service.js # PID auto-gen, duplicate detection
    │   └── patientHistory.service.js
    ├── models/
    │   ├── patient.model.js
    │   └── patientHistory.model.js
    ├── routes/
    │   ├── patient.routes.js
    │   └── patientHistory.routes.js
    └── validators/
        └── patient.validator.js
```

#### Ví dụ: Module `report` (M9)

```
modules/
└── report/
    ├── controllers/
    │   ├── executiveDashboard.controller.js
    │   ├── internalReport.controller.js
    │   ├── regulatoryReport.controller.js
    │   └── reportExport.controller.js
    ├── services/
    │   ├── executiveDashboard.service.js
    │   ├── internalReport.service.js
    │   ├── regulatoryReport.service.js
    │   └── reportExport.service.js   # Bull queue, file generation
    ├── models/
    │   ├── dashboard.model.js
    │   └── report.model.js
    ├── routes/
    │   ├── dashboard.routes.js
    │   ├── internal.routes.js
    │   ├── regulatory.routes.js
    │   └── export.routes.js
    └── validators/
        └── report.validator.js
```

### 2.5. `src/services/` — Shared services

```
services/
├── notification.service.js  # Push notification (Socket.io, email, SMS)
├── scheduler.service.js     # node-cron job registry
├── audit.service.js         # Ghi audit log cho mọi thao tác
├── cache.service.js         # Redis cache helper (get, set, invalidate)
├── file.service.js          # Upload/download file (Multer + S3/MinIO)
├── pdf.service.js           # PDF generation (PDFKit)
└── queue.service.js         # Bull queue setup (email, report jobs)
```

### 2.6. `src/routes/`

```
routes/
├── index.js                 # Gộp tất cả routers, apply global prefix /api/v1
├── auth.routes.js           # Re-export từ modules/auth
├── patient.routes.js       # Re-export từ modules/patient
├── appointment.routes.js
├── queue.routes.js
├── encounter.routes.js
├── clinicalOrder.routes.js
├── prescription.routes.js
├── lab.routes.js
├── pharmacy.routes.js
├── billing.routes.js
├── inpatient.routes.js
├── staff.routes.js
├── equipment.routes.js
└── report.routes.js
```

### 2.7. `src/app.js` — Entry point

```js
// 1. Imports
// 2. Connect DB
// 3. Middlewares (helmet, cors, json, logger)
// 4. Routes (/api/v1)
// 5. Global error handler
// 6. 404 handler
// 7. Start server
```

---

## 3. Quy tắc đặt tên

| Thành phần | Format | Ví dụ |
|-----------|--------|-------|
| File JS | `kebab-case` | `patient.service.js`, `auth.middleware.js` |
| Folder | `kebab-case` | `src/common/middlewares/` |
| Class / Type | `PascalCase` | `class PatientService {}` |
| Biến / Hàm | `camelCase` | `findPatientById`, `isAppointmentConfirmed` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `TOKEN_EXPIRY_MS`, `MAX_PAGE_SIZE` |
| Bảng SQL | `PascalCase` số nhiều | `Patients`, `Appointments`, `AuditLogs` |
| Cột SQL | `snake_case` | `patient_id`, `full_name`, `is_active` |
| API URL | `kebab-case`, số nhiều | `/patients/:id`, `/lab-results` |

---

## 4. API Versioning

- Prefix: `/api/v1/`
- Khi breaking change: `/api/v2/`
- Giữ `/api/v1/` backward-compatible tối thiểu 1 release

---

## 5. Cấu trúc Response chuẩn

```js
// Success
{
  "success": true,
  "data": { ... },        // hoặc [ ... ] cho danh sách
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required field: patient_id",
    "details": [...]
  }
}
```

---

## 6. Environment Variables bắt buộc

```env
# Server
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# Database
DB_HOST=localhost
DB_PORT=1433
DB_NAME=HIS_DB
DB_USER=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# SMS
SMS_PROVIDER=VNPT
SMS_API_KEY=
SMS_API_SECRET=

# File Storage
S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=

# Misc
APP_URL=http://localhost:3000
CORS_ORIGIN=*
```

---

## 7. Script trong `package.json`

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "migrate": "node src/database/migrations/run.js",
    "seed": "node src/database/seeds/run.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

---

## 8. Module <-> Route mapping

| Module | Prefix | Controller file |
|--------|--------|----------------|
| auth | `/auth` | `modules/auth/controllers/auth.controller.js` |
| patient | `/patients` | `modules/patient/controllers/patient.controller.js` |
| appointment | `/appointments` | `modules/appointment/controllers/appointment.controller.js` |
| queue | `/queue` | `modules/queue/controllers/queue.controller.js` |
| encounter | `/encounters` | `modules/encounter/controllers/encounter.controller.js` |
| clinical-order | `/clinical-orders` | `modules/clinical-order/controllers/clinicalOrder.controller.js` |
| prescription | `/prescriptions` | `modules/prescription/controllers/prescription.controller.js` |
| lab | `/lab-requests` | `modules/lab/controllers/labRequest.controller.js` |
| pharmacy | `/drugs` | `modules/pharmacy/controllers/dispensing.controller.js` |
| billing | `/bills` | `modules/billing/controllers/billing.controller.js` |
| inpatient | `/inpatient-episodes` | `modules/inpatient/controllers/inpatient.controller.js` |
| staff | `/staff-profiles` | `modules/staff/controllers/staff.controller.js` |
| equipment | `/equipment` | `modules/equipment/controllers/equipment.controller.js` |
| report | `/dashboard` | `modules/report/controllers/dashboard.controller.js` |
