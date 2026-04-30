# HIS Backend — API Specification

> Version: 1.0.0 | Base URL: `/api/v1`
> Cập nhật: 01/05/2026 — Nguyễn Thanh Toàn

---

## 1. Common Specifications

### 1.1 Base URL

```
Development: http://localhost:3000/api/v1
Staging:    https://staging-api.hospital.vn/api/v1
Production: https://api.hospital.vn/api/v1
```

### 1.2 Authentication

Tất cả endpoints (trừ `/auth/*`) yêu cầu Bearer token:

```
Authorization: Bearer <accessToken>
```

**Token expiry:**
- Access token: **15 phút**
- Refresh token: **7 ngày**

### 1.3 Standard Response — Success

```json
// Single item
{
  "success": true,
  "data": { ... }
}

// List (non-paginated)
{
  "success": true,
  "data": [ ... ]
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Action success
{
  "success": true,
  "data": { "message": "..." }
}
```

### 1.4 Standard Response — Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": ["Field 'full_name' is required"]
  }
}
```

### 1.5 HTTP Status Codes

| Code | Mô tả |
|------|--------|
| `200` | OK — Success |
| `201` | Created — Resource created |
| `204` | No Content — Success, no response body |
| `400` | Bad Request — Validation failed |
| `401` | Unauthorized — Invalid or missing token |
| `403` | Forbidden — No permission |
| `404` | Not Found — Resource not found |
| `409` | Conflict — Duplicate resource |
| `429` | Too Many Requests — Rate limited |
| `500` | Internal Server Error |

### 1.6 Error Codes

| Code | HTTP | Mô tả |
|------|------|--------|
| `UNAUTHORIZED` | 401 | Sai credentials hoặc token hết hạn |
| `FORBIDDEN` | 403 | Không có quyền truy cập |
| `NOT_FOUND` | 404 | Resource không tồn tại |
| `VALIDATION_ERROR` | 400 | Dữ liệu đầu vào không hợp lệ |
| `DUPLICATE_DETECTED` | 409 | Phát hiện trùng lặp dữ liệu |
| `CONFLICT` | 409 | Xung đột dữ liệu (slot đã book, CCCD trùng...) |
| `RATE_LIMITED` | 429 | Quá số request cho phép |
| `INTERNAL_ERROR` | 500 | Lỗi server |

---

## 2. Auth Module — `/auth`

### `POST /auth/login`
**Mô tả:** Đăng nhập hệ thống

**Auth required:** Không

**Request body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": 1,
      "username": "admin",
      "email": "admin@hospital.vn",
      "role": "Admin",
      "permissions": [
        { "resource": "patients", "action": "create" },
        { "resource": "patients", "action": "read" }
      ]
    }
  }
}
```

**Error `401`:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid username or password"
  }
}
```

**Error `429` (rate limited):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many login attempts. Try again in 15 minutes."
  }
}
```

---

### `POST /auth/logout`
**Mô tả:** Đăng xuất

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### `POST /auth/refresh`
**Mô tả:** Refresh access token

**Auth required:** Không (dùng refresh token)

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error `401`:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired refresh token"
  }
}
```

---

### `POST /auth/forgot-password`
**Mô tả:** Gửi email reset mật khẩu

**Auth required:** Không

**Request body:**
```json
{
  "email": "doctor01@hospital.vn"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": { "message": "If the email exists, a reset link will be sent" }
}
```

---

### `POST /auth/reset-password`
**Mô tả:** Đặt lại mật khẩu bằng token

**Auth required:** Không

**Request body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePassword123"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": { "message": "Password reset successfully" }
}
```

---

### `GET /auth/profile`
**Mô tả:** Lấy thông tin người dùng hiện tại

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "admin",
    "email": "admin@hospital.vn",
    "role": "Admin",
    "is_active": true,
    "last_login_at": "2026-05-01T08:00:00.000Z",
    "created_at": "2026-04-27T00:00:00.000Z"
  }
}
```

---

## 3. RBAC Module — `/rbac`

### `GET /rbac/roles`
**Mô tả:** Danh sách tất cả roles + permissions

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `page` | number | Trang (mặc định: 1) |
| `pageSize` | number | Số items/trang (mặc định: 20) |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "role_id": 1,
      "role_name": "Admin",
      "description": "Quản trị hệ thống",
      "is_active": true,
      "permissions": [
        { "permission_id": 1, "resource": "patients", "action": "create" }
      ]
    }
  ]
}
```

---

### `GET /rbac/permissions`
**Mô tả:** Danh sách tất cả permissions hệ thống

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": [
    { "permission_id": 1, "resource": "auth", "action": "login", "description": "login auth" },
    { "permission_id": 2, "resource": "patients", "action": "create", "description": "create patients" }
  ]
}
```

---

### `GET /rbac/my-permissions`
**Mô tả:** Permissions của user hiện tại

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": [
    { "resource": "patients", "action": "create" },
    { "resource": "patients", "action": "read" },
    { "resource": "patients", "action": "update" }
  ]
}
```

---

## 4. Master Data Module — `/master-data`

### 4.1 Departments — `/master-data/departments`

#### `GET /master-data/departments`
**Mô tả:** Danh sách khoa/phòng

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `is_active` | boolean | Lọc theo trạng thái hoạt động |
| `department_type` | string | `clinical` \| `support` \| `administrative` |
| `search` | string | Tìm theo tên hoặc mã |
| `page` | number | Trang |
| `pageSize` | number | Số items/trang |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "department_id": 1,
      "department_code": "KTMH",
      "department_name": "Khoa Tim mạch",
      "department_type": "clinical",
      "head_doctor_id": null,
      "floor": null,
      "is_active": true,
      "created_at": "2026-04-27T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /master-data/departments/:id`
**Auth required:** Có

**Success `200`:** Object department (như trên)

**Error `404`:**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Department not found" }
}
```

---

#### `POST /master-data/departments`
**Mô tả:** Tạo khoa mới

**Auth required:** Có

**Request body:**
```json
{
  "department_name": "Khoa Ung bướu",
  "department_code": "KUB",
  "department_type": "clinical",
  "floor": 3
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "department_id": 9,
    "department_name": "Khoa Ung bướu",
    "department_code": "KUB",
    "is_active": true,
    "created_at": "2026-05-01T10:00:00.000Z"
  }
}
```

**Error `400`:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "department_name is required",
    "details": ["department_name: required field missing"]
  }
}
```

---

#### `PUT /master-data/departments/:id`
**Mô tả:** Cập nhật khoa

**Auth required:** Có

**Request body:**
```json
{
  "department_name": "Khoa Tim mạch — Cập nhật",
  "floor": 2
}
```

**Success `200`:** Object department đã cập nhật

---

#### `DELETE /master-data/departments/:id`
**Mô tả:** Vô hiệu hóa khoa (soft delete)

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": { "message": "Department deactivated" }
}
```

---

### 4.2 Services — `/master-data/services`

#### `GET /master-data/services`
**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `department_id` | number | Lọc theo khoa |
| `category` | string | `consultation` \| `imaging` \| `lab` \| `cardiology`... |
| `is_bhyt` | boolean | Dịch vụ có BHYT |
| `search` | string | Tìm theo tên hoặc mã |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "service_id": 1,
      "service_code": "KHAM",
      "service_name": "Khám bệnh",
      "category": "consultation",
      "department_id": 1,
      "base_price": 50000,
      "bhyt_price": 40000,
      "is_bhyt": true,
      "is_active": true
    }
  ]
}
```

---

#### `GET /master-data/services/:id`
**Auth required:** Có

**Success `200`:** Object service

---

#### `POST /master-data/services`
**Auth required:** Có

**Request body:**
```json
{
  "service_code": "CTSCAN",
  "service_name": "Chụp cắt lớp vi tính (CT)",
  "category": "imaging",
  "department_id": 6,
  "base_price": 500000,
  "bhyt_price": 400000,
  "is_bhyt": true
}
```

**Success `201`:** Object service đã tạo

---

#### `PUT /master-data/services/:id`
**Auth required:** Có

**Request body:** Partial object service

**Success `200`:** Object service đã cập nhật

---

### 4.3 ICD-10 — `/master-data/icd10`

#### `GET /master-data/icd10/search`
**Mô tả:** Tìm kiếm mã ICD-10 (hỗ trợ tiếng Việt không dấu)

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `q` | string | Từ khóa tìm kiếm (mã hoặc mô tả) |
| `chapter` | string | Lọc theo chương (A–Z) |
| `is_notifiable` | boolean | Chỉ mã báo cáo theo dõi |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "icd10_id": 1,
      "code": "J06.9",
      "description_vn": "Nhiễm trùng hô hấp cấp trên, không xác định",
      "chapter": "J",
      "is_notifiable": false
    }
  ]
}
```

**Ghi chú:** Tìm "trem cam" sẽ ra "Nhiễm trùng hô hấp cấp trên" (unaccented search)

---

#### `GET /master-data/icd10/:id`
**Auth required:** Có

**Success `200`:** Object ICD-10

---

#### `POST /master-data/icd10`
**Auth required:** Có

**Request body:**
```json
{
  "code": "R50.9",
  "description_vn": "Sốt không xác định",
  "chapter": "R",
  "is_notifiable": false
}
```

**Error `409`:**
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "ICD-10 code already exists"
  }
}
```

---

### 4.4 Doctors — `/master-data/doctors`

#### `GET /master-data/doctors`
**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `department_id` | number | Lọc theo khoa |
| `specialty` | string | Tìm theo chuyên khoa |
| `is_active` | boolean | Trạng thái hoạt động |
| `search` | string | Tìm theo tên chuyên khoa hoặc số GPLX |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "doctor_id": 1,
      "specialty": "Tim mạch",
      "license_number": "BS001",
      "license_expiry": "2030-12-31",
      "is_active": true
    }
  ]
}
```

---

#### `GET /master-data/doctors/:id`
**Auth required:** Có

**Success `200`:** Object doctor

---

#### `POST /master-data/doctors`
**Auth required:** Có

**Request body:**
```json
{
  "specialty": "Thần kinh",
  "license_number": "BS005",
  "license_expiry": "2028-12-31"
}
```

**Success `201`:** Object doctor đã tạo

---

#### `PUT /master-data/doctors/:id`
**Auth required:** Có

**Request body:** Partial object doctor

**Success `200`:** Object doctor đã cập nhật

---

## 5. Patient Module — `/patients`

### `GET /patients`
**Mô tả:** Danh sách bệnh nhân

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `search` | string | Tìm theo tên, phone, CCCD, PID |
| `gender` | string | `male` \| `female` \| `other` |
| `blood_type` | string | `A` \| `B` \| `AB` \| `O` |
| `page` | number | Trang |
| `pageSize` | number | Số items/trang |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "patient_id": "BV-20260427-0001",
      "full_name": "Nguyễn Văn An",
      "dob": "1985-03-15",
      "gender": "male",
      "phone": "0901234567",
      "cccd": "079085001234",
      "blood_type": "O",
      "allergy": null,
      "insurance_id": "DN123456789",
      "bhyt_coverage_rate": 0.8,
      "is_active": true,
      "created_at": "2026-04-27T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /patients`
**Mô tả:** Tạo hồ sơ bệnh nhân mới — tự động sinh PID, kiểm tra trùng

**Auth required:** Có

**Request body:**
```json
{
  "full_name": "Trần Văn Minh",
  "dob": "1990-05-10",
  "gender": "male",
  "cccd": "079090005678",
  "address": "789 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "0909123456",
  "email": "tvminh@email.com",
  "blood_type": "A",
  "allergy": "Penicillin",
  "insurance_id": "DN555666777",
  "insurance_expire": "2027-12-31",
  "bhyt_coverage_rate": 0.8,
  "emergency_contact": "Trần Thị Hương — 0912345678"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "patient_id": "BV-20260501-0001",
    "full_name": "Trần Văn Minh",
    "dob": "1990-05-10",
    "gender": "male",
    "cccd": "079090005678",
    "phone": "0909123456",
    "blood_type": "A",
    "allergy": "Penicillin",
    "insurance_id": "DN555666777",
    "bhyt_coverage_rate": 0.8,
    "is_active": true,
    "created_at": "2026-05-01T10:30:00.000Z"
  }
}
```

**Error `400`:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "full_name is required",
    "details": ["full_name: required field missing"]
  }
}
```

**Error `409` (duplicate detected):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_DETECTED",
    "message": "Possible duplicate patient records found",
    "details": [
      { "patient": { "patient_id": "BV-20260427-0001", "full_name": "Nguyễn Văn An", "phone": "0901234567" }, "match_score": 3 }
    ]
  }
}
```

---

### `GET /patients/:id`
**Mô tả:** Chi tiết hồ sơ bệnh nhân

**Auth required:** Có

**Success `200`:** Object patient đầy đủ

**Error `404`:**
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Patient not found" }
}
```

---

### `PUT /patients/:id`
**Mô tả:** Cập nhật hồ sơ

**Auth required:** Có

**Request body:**
```json
{
  "phone": "0912345678",
  "allergy": "Penicillin, Seafood",
  "emergency_contact": "Nguyễn Văn B — 0923456789",
  "address": "456 Lê Lợi, Quận 1, TP.HCM"
}
```

**Success `200`:** Object patient đã cập nhật

---

### `DELETE /patients/:id`
**Mô tả:** Xóa mềm bệnh nhân

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": { "message": "Patient deactivated" }
}
```

---

### `POST /patients/search-duplicates`
**Mô tả:** Tìm bệnh nhân trùng lặp

**Auth required:** Có

**Request body:**
```json
{
  "full_name": "Nguyễn Văn An",
  "phone": "0901234567",
  "dob": "1985-03-15",
  "cccd": "079085001234"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    { "patient": { "patient_id": "BV-20260427-0001", "full_name": "Nguyễn Văn An" }, "match_score": 5 }
  ]
}
```

**Ghi chú:** Score ≥ 2 → coi là trùng

---

### `POST /patients/merge`
**Mô tả:** Gộp 2 hồ sơ bệnh nhân

**Auth required:** Có

**Request body:**
```json
{
  "target_id": "BV-20260427-0001",
  "source_id": "BV-20260428-0003"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "patient_id": "BV-20260427-0001",
    "full_name": "Nguyễn Văn An",
    "is_active": true
  }
}
```

---

## 6. Appointment Module — `/appointments`

### `GET /appointments`
**Mô tả:** Danh sách lịch hẹn

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `patient_id` | string | Lọc theo bệnh nhân |
| `doctor_id` | number | Lọc theo bác sĩ |
| `department_id` | number | Lọc theo khoa |
| `status` | string | `pending` \| `confirmed` \| `completed` \| `cancelled` |
| `appointment_date` | string | Ngày cụ thể (`YYYY-MM-DD`) |
| `from_date` | string | Từ ngày |
| `to_date` | string | Đến ngày |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "appointment_id": 1,
      "patient_id": "BV-20260427-0001",
      "doctor_id": 1,
      "department_id": 1,
      "appointment_date": "2026-05-02",
      "slot_time": "08:00",
      "status": "confirmed",
      "notes": "Khám định kỳ tim mạch",
      "created_at": "2026-04-27T00:00:00.000Z"
    }
  ]
}
```

---

### `POST /appointments`
**Mô tả:** Tạo lịch hẹn — kiểm tra xung đột slot

**Auth required:** Có

**Request body:**
```json
{
  "patient_id": "BV-20260427-0001",
  "doctor_id": 1,
  "department_id": 1,
  "appointment_date": "2026-05-10",
  "slot_time": "09:00",
  "notes": "Khám định kỳ"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "appointment_id": 5,
    "patient_id": "BV-20260427-0001",
    "doctor_id": 1,
    "appointment_date": "2026-05-10",
    "slot_time": "09:00",
    "status": "pending",
    "created_at": "2026-05-01T11:00:00.000Z"
  }
}
```

**Error `400` (slot conflict):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Slot already booked"
  }
}
```

---

### `GET /appointments/available-slots`
**Mô tả:** Lấy danh sách slot trống của bác sĩ theo ngày

**Auth required:** Có

**Query params:**
| Param | Type | Bắt buộc | Mô tả |
|-------|------|---------|--------|
| `doctor_id` | number | Có | ID bác sĩ |
| `date` | string | Có | Ngày (`YYYY-MM-DD`) |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    { "time": "07:00", "available": true },
    { "time": "07:30", "available": false },
    { "time": "08:00", "available": true },
    { "time": "08:30", "available": true }
  ]
}
```

---

### `GET /appointments/:id`
**Auth required:** Có

**Success `200`:** Object appointment

---

### `PUT /appointments/:id`
**Mô tả:** Cập nhật lịch hẹn

**Auth required:** Có

**Request body:**
```json
{
  "slot_time": "10:00",
  "notes": "Bệnh nhân xin đổi giờ khám",
  "status": "confirmed"
}
```

**Success `200`:** Object appointment đã cập nhật

---

### `DELETE /appointments/:id`
**Mô tả:** Hủy lịch hẹn

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "appointment_id": 5,
    "status": "cancelled"
  }
}
```

---

## 7. Queue Module — `/queue`

### `GET /queue/tickets`
**Mô tả:** Danh sách số thứ tự

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `department_id` | number | Lọc theo khoa |
| `doctor_id` | number | Lọc theo bác sĩ |
| `status` | string | `waiting` \| `called` \| `completed` \| `skipped` |
| `priority` | string | `emergency` \| `priority` \| `normal` |
| `date` | string | Ngày (`YYYY-MM-DD`) |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "ticket_id": 1,
      "ticket_number": "Q001",
      "patient_id": "BV-20260427-0001",
      "department_id": 1,
      "priority": "normal",
      "status": "waiting",
      "created_at": "2026-05-01T07:30:00.000Z",
      "called_at": null,
      "completed_at": null
    }
  ]
}
```

**Thứ tự ưu tiên:** `emergency` → `priority` → `normal` → FIFO theo giờ tạo

---

### `POST /queue/tickets`
**Mô tả:** Lấy số thứ tự

**Auth required:** Có

**Request body:**
```json
{
  "patient_id": "BV-20260427-0001",
  "department_id": 1,
  "doctor_id": 1,
  "priority": "normal"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "ticket_id": 5,
    "ticket_number": "Q005",
    "patient_id": "BV-20260427-0001",
    "department_id": 1,
    "priority": "normal",
    "status": "waiting",
    "created_at": "2026-05-01T08:00:00.000Z"
  }
}
```

---

### `POST /queue/call-next`
**Mô tả:** Gọi số tiếp theo — ưu tiên emergency trước

**Auth required:** Có

**Query params:**
| Param | Type | Bắt buộc | Mô tả |
|-------|------|---------|--------|
| `department_id` | number | Có | ID khoa |
| `doctor_id` | number | Không | ID bác sĩ (tùy chọn) |

**Success `200` (có người chờ):**
```json
{
  "success": true,
  "data": {
    "ticket_id": 3,
    "ticket_number": "Q003",
    "status": "called",
    "called_at": "2026-05-01T09:15:00.000Z"
  }
}
```

**Success `200` (không có người chờ):**
```json
{
  "success": true,
  "data": { "message": "No patients waiting" }
}
```

---

### `PUT /queue/:id/complete`
**Mô tả:** Đánh dấu đã hoàn thành khám

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "ticket_id": 3,
    "ticket_number": "Q003",
    "status": "completed",
    "completed_at": "2026-05-01T09:45:00.000Z"
  }
}
```

---

### `PUT /queue/:id/skip`
**Mô tả:** Bỏ qua số này, gọi số kế tiếp

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "ticket_id": 4,
    "status": "skipped"
  }
}
```

---

### `GET /queue/waiting-count`
**Mô tả:** Số người đang chờ của khoa

**Auth required:** Có

**Query params:**
| Param | Type | Bắt buộc |
|-------|------|---------|
| `department_id` | number | Có |

**Success `200`:**
```json
{
  "success": true,
  "data": { "waiting": 7 }
}
```

---

## 8. Encounter Module — `/encounters`

### `GET /encounters`
**Mô tả:** Danh sách phiên khám

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `patient_id` | string | Lọc theo bệnh nhân |
| `doctor_id` | number | Lọc theo bác sĩ |
| `department_id` | number | Lọc theo khoa |
| `status` | string | `in_progress` \| `completed` |
| `from_date` | string | Từ ngày |
| `to_date` | string | Đến ngày |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "encounter_id": 1,
      "patient_id": "BV-20260427-0001",
      "doctor_id": 1,
      "department_id": 1,
      "visit_date": "2026-05-01",
      "visit_type": "outpatient",
      "status": "in_progress",
      "chief_complaint": "Đau đầu, sốt nhẹ",
      "diagnosis_codes": null,
      "created_at": "2026-05-01T08:30:00.000Z"
    }
  ]
}
```

---

### `POST /encounters`
**Mô tả:** Tạo phiên khám mới

**Auth required:** Có

**Request body:**
```json
{
  "patient_id": "BV-20260427-0001",
  "doctor_id": 1,
  "department_id": 1,
  "appointment_id": 1,
  "visit_date": "2026-05-01",
  "visit_type": "outpatient",
  "chief_complaint": "Đau đầu, sốt nhẹ 2 ngày",
  "history_of_present_illness": "Bệnh nhân sốt từ 2 ngày trước, kèm đau đầu vùng trán",
  "physical_exam": "Mạch: 80 lần/phút. Nhiệt độ: 37.8°C. Huyết áp: 120/80 mmHg"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "encounter_id": 2,
    "patient_id": "BV-20260427-0001",
    "doctor_id": 1,
    "status": "in_progress",
    "created_at": "2026-05-01T08:30:00.000Z"
  }
}
```

---

### `GET /encounters/:id`
**Auth required:** Có

**Success `200`:** Object encounter đầy đủ (bao gồm vitals, diagnoses)

---

### `PUT /encounters/:id`
**Mô tả:** Cập nhật phiên khám

**Auth required:** Có

**Request body:**
```json
{
  "history_of_present_illness": "Bệnh nhân sốt tăng lên 38.5°C, ho khan",
  "plan": "Làm xét nghiệm máu, chụp X-quang ngực"
}
```

**Success `200`:** Object encounter đã cập nhật

---

### `PUT /encounters/:id/vitals`
**Mô tả:** Ghi nhận vitals mới (append vào danh sách)

**Auth required:** Có

**Request body:**
```json
{
  "blood_pressure": "120/80",
  "heart_rate": 80,
  "temperature": 37.5,
  "respiratory_rate": 18,
  "spO2": 98,
  "weight": 65,
  "height": 170,
  "notes": "Vitals lúc vào khám"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "encounter_id": 2,
    "vitals": [
      {
        "recorded_at": "2026-05-01T08:35:00.000Z",
        "blood_pressure": "120/80",
        "heart_rate": 80,
        "temperature": 37.5,
        "respiratory_rate": 18,
        "spO2": 98,
        "weight": 65,
        "height": 170
      }
    ]
  }
}
```

---

### `PUT /encounters/:id/diagnosis`
**Mô tả:** Thêm chẩn đoán vào phiên khám

**Auth required:** Có

**Request body:**
```json
{
  "icd10_code": "J06.9",
  "description": "Nhiễm trùng hô hấp cấp trên, không xác định",
  "type": "primary",
  "notes": "Chẩn đoán ban đầu"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "encounter_id": 2,
    "diagnosis_codes": "J06.9",
    "diagnosis_notes": "Nhiễm trùng hô hấp cấp trên, không xác định",
    "diagnoses": [
      {
        "icd10_code": "J06.9",
        "description": "Nhiễm trùng hô hấp cấp trên, không xác định",
        "type": "primary",
        "diagnosed_at": "2026-05-01T08:50:00.000Z"
      }
    ]
  }
}
```

---

### `PUT /encounters/:id/close`
**Mô tả:** Đóng phiên khám

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "encounter_id": 2,
    "status": "completed",
    "updated_at": "2026-05-01T10:00:00.000Z"
  }
}
```

---

## 9. EMR Module — `/emr`

### `GET /emr/patients/:id/history`
**Mô tả:** Timeline lịch sử khám của bệnh nhân

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "patient_id": "BV-20260427-0001",
    "total_encounters": 3,
    "timeline": [
      {
        "type": "encounter",
        "id": 3,
        "date": "2026-05-01",
        "doctor": { "id": 1, "specialty": "Tim mạch" },
        "department": { "id": 1, "name": "Khoa Tim mạch" },
        "chief_complaint": "Đau ngực",
        "diagnosis": "Tăng huyết áp",
        "vitals": { "blood_pressure": "140/90", "heart_rate": 85 },
        "prescriptions": [],
        "clinical_orders": []
      },
      {
        "type": "encounter",
        "id": 1,
        "date": "2026-04-27",
        "doctor": { "id": 1, "specialty": "Tim mạch" },
        "department": { "id": 1, "name": "Khoa Tim mạch" },
        "chief_complaint": "Khám định kỳ",
        "diagnosis": null,
        "vitals": null,
        "prescriptions": [],
        "clinical_orders": []
      }
    ]
  }
}
```

---

### `GET /emr/patients/:id/summary`
**Mô tả:** Thẻ tóm tắt nhanh — dùng cho quầy tiếp nhận

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "patient_id": "BV-20260427-0001",
    "full_name": "Nguyễn Văn An",
    "dob": "1985-03-15",
    "blood_type": "O",
    "allergy": null,
    "insurance_id": "DN123456789",
    "latest_visit": {
      "date": "2026-05-01",
      "diagnosis": "Tăng huyết áp",
      "department": 1
    },
    "active_medications": [
      {
        "prescription_id": 5,
        "drugs": [
          { "drug_name": "Amlodipine 5mg", "dosage": "1 viên/ngày", "duration": "30 ngày" }
        ]
      }
    ],
    "total_visits": 3
  }
}
```

---

## 10. Audit Module — `/audit-logs`

### `GET /audit-logs`
**Mô tả:** Nhật ký hệ thống — ghi nhận mọi thao tác ghi

**Auth required:** Có

**Query params:**
| Param | Type | Mô tả |
|-------|------|--------|
| `user_id` | number | Lọc theo người thực hiện |
| `action` | string | `create` \| `update` \| `delete` \| `login`... |
| `resource` | string | `patients` \| `appointments`... |
| `from_date` | string | Từ ngày |
| `to_date` | string | Đến ngày |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "audit_id": 1,
      "user_id": 1,
      "action": "create",
      "resource": "patients",
      "resource_id": "BV-20260427-0001",
      "old_value": null,
      "new_value": "{\"full_name\":\"Nguyễn Văn An\"}",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-04-27T09:00:00.000Z"
    }
  ]
}
```

---

## 11. System Config Module — `/system-config`

### `GET /system-config`
**Mô tả:** Lấy toàn bộ cấu hình hệ thống

**Auth required:** Có

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "hospital_name": "Bệnh viện Đa khoa Trung ương",
    "hospital_address": "123 Nguyễn Trãi, Quận 1, TP.HCM",
    "hospital_phone": "028-1234-5678",
    "appointment_reminder_before_hours": "24",
    "min_password_length": "8",
    "max_login_attempts": "5"
  }
}
```

---

### `PUT /system-config`
**Mô tả:** Cập nhật 1 config

**Auth required:** Có

**Request body:**
```json
{
  "key": "hospital_name",
  "value": "Bệnh viện Đa khoa Trung ương — Cơ sở 2"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "config_id": 1,
    "config_key": "hospital_name",
    "config_value": "Bệnh viện Đa khoa Trung ương — Cơ sở 2",
    "updated_at": "2026-05-01T12:00:00.000Z"
  }
}
```

---

### `PUT /system-config/bulk`
**Mô tả:** Cập nhật nhiều configs cùng lúc

**Auth required:** Có

**Request body:**
```json
{
  "hospital_name": "Bệnh viện Đa khoa Trung ương",
  "appointment_reminder_before_hours": "24"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    { "config_key": "hospital_name", "config_value": "Bệnh viện Đa khoa Trung ương", "updated_at": "2026-05-01T12:00:00.000Z" },
    { "config_key": "appointment_reminder_before_hours", "config_value": "24", "updated_at": "2026-05-01T12:00:00.000Z" }
  ]
}
```

---

## 12. Error Code Reference

| Code | HTTP | Trigger |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Token hết hạn, sai token, user inactive |
| `FORBIDDEN` | 403 | Role không có permission truy cập resource |
| `NOT_FOUND` | 404 | Patient/Appointment/Encounter không tồn tại |
| `VALIDATION_ERROR` | 400 | Thiếu required field, sai format, slot conflict |
| `DUPLICATE_DETECTED` | 409 | Phát hiện bệnh nhân trùng khi tạo mới |
| `CONFLICT` | 409 | ICD-10 code trùng, resource conflict khác |
| `RATE_LIMITED` | 429 | Login > 10 lần/15 phút |
| `INTERNAL_ERROR` | 500 | Lỗi không xác định |

---

## 13. HTTP Status by Operation

| Operation | Success | Error |
|-----------|---------|-------|
| Tạo mới (POST) | `201 Created` | `400` / `409` |
| Đọc (GET) | `200 OK` | `401` / `403` / `404` |
| Cập nhật (PUT) | `200 OK` | `400` / `404` |
| Xóa (DELETE) | `200 OK` | `401` / `404` |
| Action (call-next, complete...) | `200 OK` | `400` / `404` |
