# Trạng thái tiến độ dự án HIS

> Cập nhật: 01/05/2026 — Nguyễn Thanh Toàn (Backend Lead)
> Format: `[DD/MM] - Người cập nhật - Nội dung`

---

## Tổng quan

| Trường | Chi tiết |
|--------|----------|
| **Dự án** | Hệ thống Thông tin Bệnh viện (HIS) |
| **PM** | Danh Hùng Thái |
| **Backend Lead** | Nguyễn Thanh Toàn |
| **Thời gian** | 27/04/2026 – 25/05/2026 |
| **Tổng modules** | 10 (M0–M9) |
| **Tổng features** | 40 |
| **Ngày cập nhật gần nhất** | 30/04/2026 |

---

## Tiến độ theo tuần

| Tuần | Thời gian | Trạng thái | Ghi chú |
|------|-----------|-----------|---------|
| Tuần 1 | 27/04 – 03/05 | ✅ Hoàn thành (30/04) | M0 + M1 APIs + Mock DB |
| Tuần 2 | 04/05 – 10/05 | 🔄 Đang thực hiện | M2 + M3 |
| Tuần 3 | 11/05 – 17/05 | ⬜ Chưa bắt đầu | M4 + M5 |
| Tuần 4 | 18/05 – 25/05 | ⬜ Chưa bắt đầu | M6 + M7 + M8 + M9 + UAT |

---

## Tiến độ chi tiết theo Module

### M0 – Nền tảng hệ thống
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M0.1 | Authentication & Session Management | P0 | ✅ Hoàn thành | JWT, bcrypt, brute-force lockout, mock ready |
| M0.2 | Role-Based Access Control (RBAC) | P0 | ✅ Hoàn thành | Roles, permissions, rbac middleware |
| M0.3 | Master Data & Shared Catalog | P0 | ✅ Hoàn thành | Departments, Services, ICD-10, Doctors CRUD |
| M0.4 | Audit Log & System Configuration | P0 | ✅ Hoàn thành | Audit log + system config CRUD |

### M1 – Tiếp nhận & Hồ sơ BN
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M1.1 | Patient Profile Management | P0 | ✅ Hoàn thành | CRUD, PID auto-gen, duplicate detection |
| M1.2 | Appointment Scheduling & Booking | P0 | ✅ Hoàn thành | CRUD, slot check, conflict detection |
| M1.3 | Queue Management & Patient Flow | P0 | ✅ Hoàn thành | Ticket gen, call-next, priority queue |
| M1.4 | Patient Record Lookup & EMR Linking | P0 | ✅ Hoàn thành | Patient history timeline, summary card |

### M2 – Khám & Điều trị
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M2.1 | Clinical Encounter Recording | P0 | ✅ Hoàn thành | CRUD, vitals, diagnosis, close encounter |
| M2.2 | Diagnosis & Clinical Orders | P0 | ⬜ Chưa bắt đầu | |
| M2.3 | Electronic Prescription (e-Prescribing) | P0 | ⬜ Chưa bắt đầu | |
| M2.4 | Follow-up & Treatment Monitoring | P0 | ⬜ Chưa bắt đầu | |

### M3 – Cận lâm sàng
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M3.1 | Lab & Imaging Order Intake | P1 | ⬜ Chưa bắt đầu | |
| M3.2 | Sample Processing & Status Tracking | P1 | ⬜ Chưa bắt đầu | |
| M3.3 | Result Entry & Verification | P1 | ⬜ Chưa bắt đầu | |
| M3.4 | Result Release & Retrieval | P1 | ⬜ Chưa bắt đầu | |

### M4 – Dược & Vật tư y tế
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M4.1 | Drug & Supply Catalog + Inventory | P1 | ⬜ Chưa bắt đầu | |
| M4.2 | Drug Dispensing | P1 | ⬜ Chưa bắt đầu | |
| M4.3 | Expiry Alerts & Low Stock Warnings | P1 | ⬜ Chưa bắt đầu | |
| M4.4 | Dispensing & Consumption Reports | P1 | ⬜ Chưa bắt đầu | |

### M5 – Viện phí & Thanh toán
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M5.1 | Service Fee Calculation | P1 | ⬜ Chưa bắt đầu | |
| M5.2 | Cashier & Payment Processing | P1 | ⬜ Chưa bắt đầu | |
| M5.3 | BHYT Processing & Co-payment | P1 | ⬜ Chưa bắt đầu | |
| M5.4 | Invoice & End-of-Day Reconciliation | P1 | ⬜ Chưa bắt đầu | |

### M6 – Nội trú
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M6.1 | Admission & Bed Management | P2 | ⬜ Chưa bắt đầu | |
| M6.2 | Nursing Care & Order Execution | P2 | ⬜ Chưa bắt đầu | |
| M6.3 | Nutrition & Daily Treatment Notes | P2 | ⬜ Chưa bắt đầu | |
| M6.4 | Discharge & Discharge Summary | P2 | ⬜ Chưa bắt đầu | |

### M7 – Nhân sự & Phân công
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M7.1 | Staff Profile Management | P2 | ⬜ Chưa bắt đầu | |
| M7.2 | Work Schedule & Shift Management | P2 | ⬜ Chưa bắt đầu | |
| M7.3 | Training & Certification Tracking | P2 | ⬜ Chưa bắt đầu | |
| M7.4 | Staffing Alert & Assignment Dashboard | P2 | ⬜ Chưa bắt đầu | |

### M8 – Thiết bị & Hậu cần
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M8.1 | Equipment Asset Catalog | P2 | ⬜ Chưa bắt đầu | |
| M8.2 | Maintenance & Calibration Scheduling | P2 | ⬜ Chưa bắt đầu | |
| M8.3 | Procurement & Vendor Management | P2 | ⬜ Chưa bắt đầu | |
| M8.4 | Facility & Incident Management | P2 | ⬜ Chưa bắt đầu | |

### M9 – Báo cáo & Thống kê
| Feature | Tên | Priority | Trạng thái | Ghi chú |
|---------|-----|----------|-----------|---------|
| M9.1 | Executive Operations Dashboard | P2 | ⬜ Chưa bắt đầu | |
| M9.2 | Internal Management Reports | P2 | ⬜ Chưa bắt đầu | |
| M9.3 | Regulatory Compliance Reports | P2 | ⬜ Chưa bắt đầu | |
| M9.4 | Report Export & Scheduling | P2 | ⬜ Chưa bắt đầu | |

---

## API Checklist — Tuần 1 ✅ HOÀN THÀNH

### M0 – Nền tảng
| Endpoint | Method | Trạng thái | Ngày xong | Ghi chú |
|----------|--------|-----------|----------|---------|
| `/api/v1/auth/login` | POST | ✅ Hoàn thành | 30/04 | JWT, bcrypt, lockout |
| `/api/v1/auth/logout` | POST | ✅ Hoàn thành | 30/04 | |
| `/api/v1/auth/refresh` | POST | ✅ Hoàn thành | 30/04 | |
| `/api/v1/auth/forgot-password` | POST | ✅ Hoàn thành | 30/04 | Mock |
| `/api/v1/auth/reset-password` | POST | ✅ Hoàn thành | 30/04 | Mock |
| `/api/v1/auth/profile` | GET | ✅ Hoàn thành | 30/04 | |
| RBAC middleware | — | ✅ Hoàn thành | 30/04 | rbac(), requirePermission() |
| `/api/v1/rbac/roles` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/rbac/permissions` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/rbac/my-permissions` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/master-data/departments` | CRUD | ✅ Hoàn thành | 30/04 | |
| `/api/v1/master-data/services` | CRUD | ✅ Hoàn thành | 30/04 | |
| `/api/v1/master-data/icd10/search` | GET | ✅ Hoàn thành | 30/04 | Vietnamese unaccented search |
| `/api/v1/master-data/icd10` | POST | ✅ Hoàn thành | 30/04 | |
| `/api/v1/master-data/doctors` | CRUD | ✅ Hoàn thành | 30/04 | |
| `/api/v1/audit-logs` | GET | ✅ Hoàn thành | 30/04 | Filter by user, date, action |
| `/api/v1/system-config` | GET/PUT | ✅ Hoàn thành | 30/04 | |

### M1 – Tiếp nhận & Hồ sơ BN
| Endpoint | Method | Trạng thái | Ngày xong | Ghi chú |
|----------|--------|-----------|----------|---------|
| `/api/v1/patients` | GET | ✅ Hoàn thành | 30/04 | Search, filter |
| `/api/v1/patients` | POST | ✅ Hoàn thành | 30/04 | PID auto-gen, duplicate detection |
| `/api/v1/patients/:id` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/patients/:id` | PUT | ✅ Hoàn thành | 30/04 | |
| `/api/v1/patients/:id` | DELETE | ✅ Hoàn thành | 30/04 | Soft delete |
| `/api/v1/patients/search-duplicates` | POST | ✅ Hoàn thành | 30/04 | Score-based matching |
| `/api/v1/patients/merge` | POST | ✅ Hoàn thành | 30/04 | |
| `/api/v1/appointments` | GET | ✅ Hoàn thành | 30/04 | Filter by date, doctor, status |
| `/api/v1/appointments` | POST | ✅ Hoàn thành | 30/04 | Conflict detection |
| `/api/v1/appointments/:id` | GET/PUT | ✅ Hoàn thành | 30/04 | |
| `/api/v1/appointments/available-slots` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/queue/tickets` | GET | ✅ Hoàn thành | 30/04 | Priority + date filter |
| `/api/v1/queue/tickets` | POST | ✅ Hoàn thành | 30/04 | Auto Q-number |
| `/api/v1/queue/call-next` | POST | ✅ Hoàn thành | 30/04 | Emergency priority |
| `/api/v1/queue/:id/complete` | PUT | ✅ Hoàn thành | 30/04 | |
| `/api/v1/queue/:id/skip` | PUT | ✅ Hoàn thành | 30/04 | |
| `/api/v1/queue/waiting-count` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/emr/patients/:id/history` | GET | ✅ Hoàn thành | 30/04 | Timeline view |
| `/api/v1/emr/patients/:id/summary` | GET | ✅ Hoàn thành | 30/04 | Quick summary card |

### M2 – Khám & Điều trị
| Endpoint | Method | Trạng thái | Ngày xong | Ghi chú |
|----------|--------|-----------|----------|---------|
| `/api/v1/encounters` | GET | ✅ Hoàn thành | 30/04 | Filter by patient, doctor, date |
| `/api/v1/encounters/:id` | GET | ✅ Hoàn thành | 30/04 | |
| `/api/v1/encounters` | POST | ✅ Hoàn thành | 30/04 | |
| `/api/v1/encounters/:id` | PUT | ✅ Hoàn thành | 30/04 | |
| `/api/v1/encounters/:id/vitals` | PUT | ✅ Hoàn thành | 30/04 | Add vitals record |
| `/api/v1/encounters/:id/diagnosis` | PUT | ✅ Hoàn thành | 30/04 | Add diagnosis |
| `/api/v1/encounters/:id/close` | PUT | ✅ Hoàn thành | 30/04 | Close encounter |

---

## Nhật ký tiến độ

```
[30/04] - Toàn - M0.1 - Hoàn thành auth: login, logout, refresh, forgot/reset password
[30/04] - Toàn - M0.2 - Hoàn thành RBAC: roles, permissions, middleware
[30/04] - Toàn - M0.3 - Hoàn thành Master Data: departments, services, ICD-10, doctors
[30/04] - Toàn - M0.4 - Hoàn thành Audit log + System config
[30/04] - Toàn - M1.1 - Hoàn thành Patient CRUD, PID auto-gen, duplicate detection
[30/04] - Toàn - M1.2 - Hoàn thành Appointment: CRUD, slot check, conflict detection
[30/04] - Toàn - M1.3 - Hoàn thành Queue: ticket, call-next, priority, skip
[30/04] - Toàn - M1.4 - Hoàn thành EMR: patient history timeline, summary card
[30/04] - Toàn - M2.1 - Hoàn thành Encounter: CRUD, vitals, diagnosis, close encounter
[01/05] - Toàn - Chuẩn hóa repo: ESLint, Prettier, EditorConfig, BRANCH_STRATEGY.md
[01/05] - Toàn - CI/CD: GitHub Actions (ci.yml, cd-staging.yml, cd-production.yml)
[01/05] - Toàn - Smoke test: 6 test suites (auth, patient, appointment, queue, encounter, masterData)
[01/05] - Toàn - API Spec: Hoàn thành API_SPEC.md đầy đủ (request/response, status codes, error codes)
[01/05] - Toàn - Setup - Mock DB in-memory, seed data (users, departments, services, ICD-10, patients)
```

---

## Tài khoản test (Mock DB)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `doctor01` | `password` | Doctor |
| `receptionist01` | `password` | Receptionist |

---

## Bug Tracker

| ID | Module | Mô tả | Mức độ | Ngày phát hiện | Trạng thái | Người fix |
|----|--------|-------|--------|---------------|-----------|-----------|
| — | — | — | — | — | — | — |

---

## Rủi ro & Issues

| ID | Module | Mô tả rủi ro | Mức độ | Biện pháp xử lý | Trạng thái |
|----|--------|-------------|--------|-----------------|-----------|
| R1 | Chung | Chưa có SQL Server thật | Cao | Dùng Mock DB tạm thời | Đang xử lý |
| R2 | M2 | Encounter cần liên kết với ICD-10 từ M0.3 | Thấp | ICD-10 đã sẵn sàng | Sẵn sàng |

---

## Dependencies chờ từ module khác

| Module chờ | Module phụ thuộc | Nội dung cần | Deadline | Trạng thái |
|------------|-----------------|-------------|----------|------------|
| M2 | M1, M0 | Patient API, ICD-10, Doctor ready | — | ✅ Sẵn sàng |
| M3 | M2 | Clinical orders from encounter | — | ⬜ Chờ M2 |
| M4 | M0, M2 | Drug interaction DB, Services price | — | ✅ M0 ready |
| M5 | M1, M3, M4 | Bills from encounters, BHYT config | — | ✅ M1 ready |
| M9 | Tất cả | All module APIs | — | ⬜ 40% complete |
