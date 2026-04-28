# Week 1 Backend API Spec

## 1. Tổng Quan

- Base URL: `http://localhost:3000/api`
- Health check: `http://localhost:3000/health`
- Format response chuẩn:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

```json
{
  "success": false,
  "message": "...",
  "details": {}
}
```

## 2. Quy Ước Chung

- `id` do backend sinh ra.
- Các module dùng RESTful cơ bản: `GET`, `POST`, `PUT`, `DELETE`.
- Queue là module nghiệp vụ nên có thêm endpoint thao tác riêng: `POST /next`, `PATCH /:id/complete`.
- Dữ liệu hiện tại lưu tạm bằng in-memory repository, restart server sẽ mất dữ liệu.

## 3. Module Patient

### 3.1 DTO

| Field | Type | Required | Ghi chú |
|---|---|---:|---|
| id | string | - | Backend sinh |
| name | string | Yes | 2-100 ký tự |
| phone | string | Yes | Chỉ số, `+`, `(`, `)`, `-`, khoảng trắng |
| dateOfBirth | string | No | Định dạng `YYYY-MM-DD` |
| gender | string | No | `male` / `female` / `other` |
| address | string | No | Tối đa 255 ký tự |
| status | string | No | `active` / `inactive` |

### 3.2 Endpoints

| Method | URL | Request Body | Response mẫu | Status |
|---|---|---|---|---|
| GET | `/api/patients` | - | `[{ "id": "p1", "name": "Nguyen Van A" }]` | 200 |
| GET | `/api/patients/:id` | - | `{ "id": "p1", "name": "Nguyen Van A" }` | 200, 404 |
| POST | `/api/patients` | `{ "name": "Nguyen Van A", "phone": "0901234567", "dateOfBirth": "1990-01-01", "gender": "male", "address": "Hanoi", "status": "active" }` | `{ "id": "...", "name": "Nguyen Van A" }` | 201, 400 |
| PUT | `/api/patients/:id` | `{ "name": "Nguyen Van B" }` | `{ "id": "p1", "name": "Nguyen Van B" }` | 200, 400, 404 |
| DELETE | `/api/patients/:id` | - | `{ "success": true, "message": "Patient deleted successfully" }` | 200, 404 |

### 3.3 Response Mẫu

```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": [
    {
      "id": "p1",
      "name": "Nguyen Van A",
      "phone": "0901234567",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "address": "Hanoi",
      "status": "active"
    }
  ]
}
```

## 4. Module Appointment

### 4.1 DTO

| Field | Type | Required | Ghi chú |
|---|---|---:|---|
| id | string | - | Backend sinh |
| patientId | string | Yes | Mã bệnh nhân |
| doctorId | string | Yes | Mã bác sĩ |
| appointmentDate | string | Yes | `YYYY-MM-DD` |
| appointmentTime | string | No | `HH:mm` |
| reason | string | No | Lý do khám |
| status | string | No | `scheduled` / `completed` / `cancelled` / `no_show` |

### 4.2 Endpoints

| Method | URL | Request Body | Response mẫu | Status |
|---|---|---|---|---|
| GET | `/api/appointments` | - | `[]` | 200 |
| GET | `/api/appointments/:id` | - | `{ "id": "a1", "patientId": "p1" }` | 200, 404 |
| POST | `/api/appointments` | `{ "patientId": "p1", "doctorId": "d1", "appointmentDate": "2026-04-28", "appointmentTime": "09:30", "reason": "Kham tong quat", "status": "scheduled" }` | `{ "id": "a1", "patientId": "p1" }` | 201, 400 |
| PUT | `/api/appointments/:id` | `{ "status": "completed" }` | `{ "id": "a1", "status": "completed" }` | 200, 400, 404 |
| DELETE | `/api/appointments/:id` | - | `{ "success": true, "message": "Appointment deleted successfully" }` | 200, 404 |

### 4.3 Response Mẫu

```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "id": "a1",
    "patientId": "p1",
    "doctorId": "d1",
    "appointmentDate": "2026-04-28",
    "appointmentTime": "09:30",
    "reason": "Kham tong quat",
    "status": "scheduled"
  }
}
```

## 5. Module Queue

### 5.1 DTO

| Field | Type | Required | Ghi chú |
|---|---|---:|---|
| id | string | - | Backend sinh |
| patientId | string | Yes | Mã bệnh nhân |
| queueNumber | number | Yes | Số thứ tự |
| status | string | No | `waiting` / `serving` / `done` / `cancelled` |
| createdAt | string | Yes | ISO datetime |

### 5.2 Endpoints

| Method | URL | Request Body | Response mẫu | Status |
|---|---|---|---|---|
| GET | `/api/queues` | - | `[]` | 200 |
| GET | `/api/queues/:id` | - | `{ "id": "q1", "queueNumber": 1 }` | 200, 404 |
| POST | `/api/queues` | `{ "patientId": "p1" }` | `{ "id": "q1", "patientId": "p1", "queueNumber": 1, "status": "waiting" }` | 201, 400 |
| POST | `/api/queues/next` | - | `{ "id": "q1", "status": "serving" }` | 200, 404 |
| PATCH | `/api/queues/:id/complete` | - | `{ "id": "q1", "status": "done" }` | 200, 404 |

### 5.3 Endpoint Đề Xuất Thêm Cho Queue

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/queues?status=waiting` | Lấy danh sách đang chờ |
| GET | `/api/queues?status=serving` | Lấy danh sách đang được gọi |
| POST | `/api/queues/:id/cancel` | Hủy số thứ tự |

## 6. Các Endpoint Hiện Tại Có Test Bằng Postman

Có. Hiện tại project đã có thể test ngay bằng Postman cho các route sau:

- `GET /health`
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/queues`
- `POST /api/queues`
- `POST /api/queues/next`
- `PATCH /api/queues/:id/complete`

## 7. Cách Test Nhanh Bằng Postman

1. Chạy backend: `npm run dev`
2. Tạo request `GET http://localhost:3000/health`
3. Tạo request `POST http://localhost:3000/api/patients` với body `raw / JSON`
4. Tạo request `POST http://localhost:3000/api/appointments` với body `raw / JSON`
5. Tạo request `POST http://localhost:3000/api/queues` với body `raw / JSON`
6. Gọi `POST http://localhost:3000/api/queues/next`
7. Gọi `PATCH http://localhost:3000/api/queues/:id/complete`

### Body mẫu cho Postman

```json
{
  "name": "Nguyen Van A",
  "phone": "0901234567",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "Hanoi",
  "status": "active"
}
```

```json
{
  "patientId": "p1",
  "doctorId": "d1",
  "appointmentDate": "2026-04-28",
  "appointmentTime": "09:30",
  "reason": "Kham tong quat",
  "status": "scheduled"
}
```

```json
{
  "patientId": "p1"
}
```

## 8. Gợi Ý Trình Bày Trong Báo Cáo Cuối Tuần

- Mục tiêu tuần 1: dựng backend nền tảng và chuẩn hóa API spec.
- Kết quả đã làm:
  - Tạo cấu trúc clean architecture
  - Hoàn thiện DTO + validation
  - Có logging và global error handling
  - Chuẩn hóa endpoint Patient, Appointment, Queue
  - Có spec để BA/FE xác nhận
- Trạng thái hiện tại: endpoint có thể test bằng Postman, chưa cần business logic phức tạp.
- Hướng phát triển tuần sau:
  - Kết nối database
  - Thêm Doctor, Billing, MedicalRecord
  - Viết OpenAPI/Swagger nếu cần
