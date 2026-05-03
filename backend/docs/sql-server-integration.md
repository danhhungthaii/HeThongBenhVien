# SQL Server Integration Guide

## Architecture Overview

The Patient module now uses a **dual-repository pattern** to support both in-memory and SQL Server storage.

### Repository Pattern

```
PatientRepository (Abstract Base)
├── InMemoryPatientRepository (Development/Testing)
└── SqlPatientRepository (Production with SQL Server)
```

**Benefits:**
- ✅ No breaking changes to existing code
- ✅ Seamless switching between storage layers
- ✅ Easy to test with in-memory mode
- ✅ Ready for SQL Server when database is configured

---

## Configuration

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `DB_MODE` | `memory` | `memory` = in-memory, `sql` = SQL Server |
| `SQL_SERVER` | `localhost` | SQL Server hostname/IP |
| `SQL_PORT` | `1433` | SQL Server port |
| `SQL_DATABASE` | `HeThongBenhVien` | Database name |
| `SQL_USERNAME` | `sa` | Database user |
| `SQL_PASSWORD` | (empty) | Database password |
| `SQL_ENCRYPT` | `true` | Enable encrypted connection |
| `SQL_TRUST_CERT` | `false` | Trust self-signed certificate |

### Running with In-Memory Mode (Default)

```bash
npm run dev
# or
DB_MODE=memory npm run dev
```

**Output:**
```
✓ Using in-memory repository mode
```

### Running with SQL Server Mode (Not Yet Implemented)

```bash
DB_MODE=sql \
SQL_SERVER=your-server \
SQL_USERNAME=sa \
SQL_PASSWORD=your-password \
npm run dev
```

**Note:** SqlPatientRepository is currently a skeleton. Full implementation requires:
- Connection pool setup
- SQL queries for CRUD operations
- Field mapping (id ↔ Patient_ID, name ↔ Full_Name)
- Soft-delete logic (Status = 'inactive', DeletedAt = now)

---

## File Structure

```
src/
├── common/repositories/
│   ├── patient.repository.base.js     ← Abstract base class (interface)
│   └── implementations/
│       ├── in-memory-patient.repository.js  ← In-memory implementation
│       └── sql-patient.repository.js        ← SQL implementation (skeleton)
│
└── modules/patient/
    ├── patient.repository.js  ← Factory (creates appropriate repository)
    ├── patient.service.js     ← Business logic (uses repository)
    └── ...
```

---

## CRUD Operations

All operations are identical regardless of storage backend:

### Create Patient

```http
POST /api/patients
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0987654321",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "123 Đường ABC, Hà Nội"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
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
}
```

### Get All Patients

```http
GET /api/patients
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": [
    { /* patient objects */ }
  ]
}
```

### Get Patient by ID

```http
GET /api/patients/:id
```

### Update Patient

```http
PUT /api/patients/:id
Content-Type: application/json

{
  "address": "456 Đường XYZ, Đà Nẵng"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "id": "...",
    "address": "456 Đường XYZ, Đà Nẵng",
    "updatedAt": "2026-05-01T04:05:50.415Z",
    ...
  }
}
```

### Delete Patient (Soft Delete)

```http
DELETE /api/patients/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Patient deleted successfully"
}
```

---

## Testing with Postman

### 1. Set Base URL Variable

In Postman:
- Click **Environments** → **Create**
- Name: `Hospital Backend`
- Add variable:
  - **Key:** `base_url`
  - **Value:** `http://localhost:3000`

### 2. Create Patient

**Request:**
```
POST {{base_url}}/api/patients
```

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

**Save the returned `id` as variable:**
- In Tests tab:
```javascript
pm.environment.set("patient_id", pm.response.json().data.id);
```

### 3. Get All Patients

```
GET {{base_url}}/api/patients
```

### 4. Get Patient by ID

```
GET {{base_url}}/api/patients/{{patient_id}}
```

### 5. Update Patient

```
PUT {{base_url}}/api/patients/{{patient_id}}
```

**Body:**
```json
{
  "address": "456 Đường XYZ, Đà Nẵng"
}
```

### 6. Delete Patient

```
DELETE {{base_url}}/api/patients/{{patient_id}}
```

### 7. Verify Soft Delete (List should be empty)

```
GET {{base_url}}/api/patients
```

---

## Next Steps: SQL Server Implementation

To complete the SQL Server integration:

### 1. Install SQL Server Connection Library

```bash
npm install mssql
```

### 2. Update `env.js`

Already done ✓

### 3. Create Connection Pool (`src/common/db/sql-pool.js`)

```javascript
const sql = require('mssql');
const { env } = require('../config/env');

let pool = null;

async function initPool() {
  pool = new sql.ConnectionPool({
    server: env.sqlServer.server,
    port: env.sqlServer.port,
    database: env.sqlServer.database,
    user: env.sqlServer.username,
    password: env.sqlServer.password,
    encrypt: env.sqlServer.encrypt,
    trustServerCertificate: env.sqlServer.trustServerCertificate,
  });

  await pool.connect();
  return pool;
}

function getPool() {
  return pool;
}

module.exports = { initPool, getPool };
```

### 4. Update `src/common/repositories/implementations/sql-patient.repository.js`

Implement the CRUD methods with SQL queries:

```javascript
async create(data) {
  const pool = getPool();
  const request = new pool.Request();
  
  request.input('patient_id', sql.VarChar(36), data.id);
  request.input('full_name', sql.NVarChar(255), data.name);
  request.input('phone', sql.VarChar(20), data.phone);
  // ... more fields
  
  const result = await request.query(`
    INSERT INTO Patients (Patient_ID, Full_Name, Phone, ...)
    VALUES (@patient_id, @full_name, @phone, ...)
  `);
  
  return data;
}
```

### 5. Create Database Schema

```sql
CREATE TABLE Patients (
    Patient_ID VARCHAR(36) PRIMARY KEY,
    Full_Name NVARCHAR(255) NOT NULL,
    Phone VARCHAR(20),
    DateOfBirth DATE,
    Gender VARCHAR(10),
    Address NVARCHAR(500),
    Status VARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    DeletedAt DATETIME,
    INDEX idx_status (Status)
);
```

### 6. Update `src/app.js` Startup

```javascript
async function startApp() {
  if (env.dbMode === 'sql') {
    const { initPool } = require('./common/db/sql-pool');
    await initPool();
    console.log('✓ SQL Server connected');
  }
  // ... rest of setup
}
```

---

## Current Status

| Feature | Status |
|---------|--------|
| Repository Pattern | ✅ Done |
| InMemoryPatientRepository | ✅ Done |
| SqlPatientRepository Skeleton | ✅ Done |
| Config-based Switching | ✅ Done |
| All CRUD Operations (In-Memory) | ✅ Tested |
| SQL Server Implementation | 🔄 Ready to implement |
| Connection Pool | 📋 Planned |
| SQL Queries | 📋 Planned |
| Schema Migration | 📋 Planned |

---

## Troubleshooting

### Q: How do I verify which mode is active?

**A:** Check server startup logs:
- `✓ Using in-memory repository mode` → Memory mode
- `⚠️ Using SQL Server mode` → SQL mode (not yet implemented)

### Q: Can I use in-memory mode for testing?

**A:** Yes! In-memory is the default and perfect for:
- Development
- Unit testing
- Integration testing
- Demo/POC

### Q: What happens if SQL connection fails?

**A:** Currently, SqlPatientRepository throws errors because implementation is incomplete. Once implemented, add proper error handling and connection retry logic.

---

## See Also

- [postman-README.md](./postman-README.md) - Postman testing guide
