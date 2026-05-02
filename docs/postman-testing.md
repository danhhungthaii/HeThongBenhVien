# Testing Hospital Backend with Postman

## Quick Start

### 1. Start the Backend Server

```bash
npm run dev
```

**Expected output:**
```
✓ Using in-memory repository mode
{"timestamp":"2026-05-01T...","level":"info","message":"Server started","port":3000,"environment":"development"}
```

### 2. Open Postman

- Download: https://www.postman.com/downloads/
- Create new workspace or use existing

---

## Setup Environment in Postman

### Create Environment

1. Click **Environments** (left sidebar)
2. Click **+ Create New**
3. Name: `Hospital Backend Dev`

### Add Environment Variables

| Variable | Initial Value | Type |
|----------|---------------|------|
| `base_url` | `http://localhost:3000` | string |
| `api_url` | `http://localhost:3000/api` | string |
| `patient_id` | (leave empty) | string |

**Save** the environment

### Select Active Environment

- Top right dropdown → Select `Hospital Backend Dev`

---

## Test Collection

### Test 1: Health Check

**Setup:**
- Method: `GET`
- URL: `{{base_url}}/health`
- Headers: None required

**Send** → Should see:
```json
{
    "success": true,
    "message": "OK"
}
```

---

### Test 2: Create Patient

**Setup:**
- Method: `POST`
- URL: `{{api_url}}/patients`
- Headers: `Content-Type: application/json`

**Body (JSON):**
```json
{
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "123 Đường ABC, Hà Nội"
}
```

**Send** → Should see `201 Created`:
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "123 Đường ABC, Hà Nội",
    "status": "active",
    "pid": "BV-20260501-0001",
    "id": "b5220b08-a8a4-472c-89eb-94234ff8f23f",
    "createdAt": "2026-05-01T04:05:30.036Z"
  }
}
```

**Save Patient ID:**
- Click **Tests** tab
- Add script:
```javascript
pm.environment.set("patient_id", pm.response.json().data.id);
```
- Send request again
- Variable is now saved ✓

---

### Test 3: Get All Patients

**Setup:**
- Method: `GET`
- URL: `{{api_url}}/patients`

**Send** → Should see `200 OK`:
```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": [
    {
      "id": "b5220b08-a8a4-472c-89eb-94234ff8f23f",
      "pid": "BV-20260501-0001",
      "name": "Nguyễn Văn A",
      "phone": "0987654321",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "address": "123 Đường ABC, Hà Nội",
      "status": "active",
      "createdAt": "2026-05-01T04:05:30.036Z"
    }
  ]
}
```

---

### Test 4: Get Patient by ID

**Setup:**
- Method: `GET`
- URL: `{{api_url}}/patients/{{patient_id}}`

**Send** → Should see `200 OK`:
```json
{
  "success": true,
  "message": "Patient fetched successfully",
  "data": {
    "id": "b5220b08-a8a4-472c-89eb-94234ff8f23f",
    "pid": "BV-20260501-0001",
    "name": "Nguyễn Văn A",
    ...
  }
}
```

---

### Test 5: Update Patient

**Setup:**
- Method: `PUT`
- URL: `{{api_url}}/patients/{{patient_id}}`
- Headers: `Content-Type: application/json`

**Body (JSON):**
```json
{
  "address": "456 Đường XYZ, Đà Nẵng",
  "phone": "0912345678"
}
```

**Send** → Should see `200 OK`:
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "b5220b08-a8a4-472c-89eb-94234ff8f23f",
    "pid": "BV-20260501-0001",
    "name": "Nguyễn Văn A",
    "phone": "0912345678",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "456 Đường XYZ, Đà Nẵng",
    "status": "active",
    "createdAt": "2026-05-01T04:05:30.036Z",
    "updatedAt": "2026-05-01T04:10:00.123Z"
  }
}
```

---

### Test 6: Delete Patient (Soft Delete)

**Setup:**
- Method: `DELETE`
- URL: `{{api_url}}/patients/{{patient_id}}`

**Send** → Should see `200 OK`:
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

### Test 7: Verify Soft Delete (Patient Filtered Out)

**Setup:**
- Method: `GET`
- URL: `{{api_url}}/patients`

**Send** → Should see `200 OK` with empty data array:
```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": []
}
```

---

## Error Cases

### Test 8: Create Patient - Validation Error

**Setup:**
- Method: `POST`
- URL: `{{api_url}}/patients`

**Body (missing required fields):**
```json
{
  "name": "Test"
}
```

**Send** → Should see `400 Bad Request`:
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 10,
      "type": "string",
      "path": ["phone"],
      "message": "String must contain at least 10 character(s)"
    }
  ]
}
```

---

### Test 9: Get Non-Existent Patient

**Setup:**
- Method: `GET`
- URL: `{{api_url}}/patients/non-existent-id`

**Send** → Should see `404 Not Found`:
```json
{
  "success": false,
  "error": "Patient not found"
}
```

---

### Test 10: Update Deleted Patient

**Setup:**
- Method: `PUT`
- URL: `{{api_url}}/patients/{{patient_id}}` (after deleting in Test 6)

**Body:**
```json
{
  "address": "Should fail"
}
```

**Send** → Should see `404 Not Found`:
```json
{
  "success": false,
  "error": "Patient not found"
}
```

---

## Test Scenarios

### Scenario 1: Full CRUD Lifecycle

```
1. Create patient → Get 201 Created, save ID
2. Get all → See patient in list
3. Get by ID → See patient details
4. Update → Change address, get 200 OK
5. Get by ID → See updated address
6. Delete → Get 200 OK
7. Get all → Patient not in list (soft deleted)
8. Try to get deleted → Get 404 Not Found
```

### Scenario 2: Batch Create Multiple Patients

1. Create Patient A (name: "Nguyễn Văn A")
   - Expected PID: `BV-YYYYMMDD-0001`

2. Create Patient B (name: "Trần Thị B")
   - Expected PID: `BV-YYYYMMDD-0002`

3. Create Patient C (name: "Phạm Văn C")
   - Expected PID: `BV-YYYYMMDD-0003`

4. Get all → See 3 patients with incrementing PIDs

5. Delete Patient B

6. Get all → See Patients A and C (Patient B filtered out)

---

## Advanced Testing: Postman Scripts

### Save Response Data

In **Tests** tab:

```javascript
// Save patient ID
pm.environment.set("patient_id", pm.response.json().data.id);

// Save patient PID
pm.environment.set("patient_pid", pm.response.json().data.pid);

// Log response
console.log("Response:", pm.response.json());
```

### Validate Response

```javascript
// Check status code
pm.test("Status is 201 Created", () => {
  pm.response.to.have.status(201);
});

// Check response structure
pm.test("Response contains patient ID", () => {
  pm.expect(pm.response.json().data).to.have.property("id");
});

// Check PID format
pm.test("PID format is correct", () => {
  const pid = pm.response.json().data.pid;
  pm.expect(pid).to.match(/^BV-\d{8}-\d{4}$/);
});
```

---

## Database Mode Verification

### Check Which Repository Mode is Active

1. Start server: `npm run dev`
2. Look at console output:
   - ✓ `Using in-memory repository mode` → In-memory (default)
   - ⚠️ `Using SQL Server mode` → SQL Server (not yet fully implemented)

### Switch to SQL Server Mode (When Ready)

```bash
DB_MODE=sql npm run dev
```

**Note:** SQL Server mode requires:
- `mssql` package installed
- SQL Server instance running
- Environment variables set for connection
- SqlPatientRepository fully implemented

---

## Troubleshooting

### Q: Getting "Connection refused"?

**A:** Make sure backend is running:
```bash
npm run dev
```

### Q: Getting validation error on create?

**A:** Check required fields:
- `name` (min 3 chars)
- `phone` (min 10 chars)
- `dateOfBirth` (valid ISO date)
- `gender` ('male' or 'female')
- `address` (min 5 chars)

### Q: Patient ID not saving to environment?

**A:** 
1. Go to **Tests** tab before sending
2. Add the save script
3. Send request
4. Check environment variables updated (top right)

### Q: Getting 404 even though I have the ID?

**A:** Patient might be soft-deleted. In Postman:
1. Get all patients: `GET /api/patients`
2. Verify patient is in the list
3. Try get by ID again

---

## Performance Tips

- Use environment variables instead of hardcoding URLs
- Save IDs/PIDs from responses for reuse
- Use folder organization (Create, Read, Update, Delete, etc.)
- Add pre-request scripts to generate test data
- Use collections for batch testing

---

## See Also

- [sql-server-integration.md](./sql-server-integration.md) - Repository pattern & SQL Server setup
- [README.md](../README.md) - Project overview
