# Week 1 API Spec

## Base

- Base URL: `http://localhost:3000/api`
- Health: `GET /health`

## Common Response

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

## M1 - Patient

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/patients` | - | 200 | List patient, ẩn bản ghi đã soft delete |
| GET | `/api/patients/:id` | - | 200, 404 | Detail patient |
| POST | `/api/patients` | `{ "name": "Nguyen Van A", "phone": "0901234567", "dateOfBirth": "1990-01-01", "gender": "male", "address": "Hanoi" }` | 201, 400 | Auto PID `BV-YYYYMMDD-XXXX` |
| PUT | `/api/patients/:id` | Partial JSON | 200, 400, 404 | Update patient |
| DELETE | `/api/patients/:id` | - | 200, 404 | Soft delete |

## M1 - Appointment

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/appointments` | - | 200 | List appointment |
| GET | `/api/appointments/:id` | - | 200, 404 | Detail appointment |
| POST | `/api/appointments` | `{ "patientId": "p1", "doctorId": "d1", "appointmentDate": "2026-04-29", "appointmentTime": "09:30", "reason": "Kham tong quat" }` | 201, 400, 409 | Mock slot check |
| PUT | `/api/appointments/:id` | Partial JSON | 200, 400, 404, 409 | Update appointment |
| DELETE | `/api/appointments/:id` | - | 200, 404 | Delete appointment |

## M1 - Queue

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/queues` | - | 200 | List queue |
| GET | `/api/queues/:id` | - | 200, 404 | Detail queue |
| POST | `/api/queues` | `{ "patientId": "p1" }` | 201, 400 | Create queue number |
| POST | `/api/queues/next` | - | 200, 404 | Next waiting patient -> serving |
| PATCH | `/api/queues/:id/complete` | - | 200, 404, 409 | Only complete when status = serving |

Flow: `create -> next -> complete`

## M2 - Encounter

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/encounters` | - | 200 | List encounter |
| GET | `/api/encounters/:id` | - | 200, 404 | Detail encounter |
| POST | `/api/encounters` | `{ "patientId": "p1", "encounterDate": "2026-04-29", "chiefComplaint": "Sot" }` | 201, 400 | Basic skeleton |

## M2 - Diagnosis

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/diagnoses` | - | 200 | List diagnosis |
| POST | `/api/diagnoses` | `{ "encounterId": "e1", "code": "J11", "name": "Influenza" }` | 201, 400 | Basic skeleton |

## M2 - Prescription

| Method | URL | Request Body | Status | Notes |
|---|---|---|---|---|
| GET | `/api/prescriptions` | - | 200 | List prescription |
| POST | `/api/prescriptions` | `{ "encounterId": "e1", "items": [{ "medicineName": "Paracetamol", "dosage": "500mg" }] }` | 201, 400 | Basic skeleton |

## Postman Quick Test

1. `GET http://localhost:3000/health`
2. `POST http://localhost:3000/api/patients`
3. `POST http://localhost:3000/api/appointments`
4. `POST http://localhost:3000/api/queues`
5. `POST http://localhost:3000/api/queues/next`
6. `PATCH http://localhost:3000/api/queues/:id/complete`
7. `POST http://localhost:3000/api/encounters`
8. `POST http://localhost:3000/api/diagnoses`
9. `POST http://localhost:3000/api/prescriptions`

