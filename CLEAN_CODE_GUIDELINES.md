# Clean Code Guidelines

> File gốc: chỉ đọc và tuân thủ. Cập nhật sau mỗi milestone/feature hoàn thành.

---

## 1. Đặt tên (Naming)

### Nguyên tắc chung
- Tên phải **mô tả đúng chức năng**, tránh tên mơ hồ, tên viết tắt không rõ nghĩa.
- Đặt theo convention: **camelCase** cho biến/hàm, **PascalCase** cho class/type, **SCREAMING_SNAKE_CASE** cho hằng số.

### Ví dụ

```js
// ❌ Tên mơ hồ
function calc(a, b) { ... }
const x = getData();
const flag = true;

// ✅ Tên mô tả đúng chức năng
function calculateBillTotal(basePrice, bhytAmount) { ... }
const patientPrescriptions = getPrescriptionsByPatientId(patientId);
const isAppointmentConfirmed = true;
```

### File & Folder
- File: `kebab-case` hoặc `PascalCase` tùy ngữ cảnh
  - `patient.service.js`, `auth.middleware.js`
  - `AuthController.js`, `UserController.js`
- Folder: `kebab-case`, tên số nhiều khi chứa nhiều file cùng loại
  - `src/services/`, `src/controllers/patient.controller.js`

---

## 2. Hàm (Functions)

### Nguyên tắc: Một hàm = Một nhiệm vụ duy nhất

```js
// ❌ Một hàm làm quá nhiều việc
async function handleAppointment(req, res) {
  const data = req.body;
  const appointment = await db.query("INSERT ...");
  await sendSmsReminder(appointment.patientPhone);
  await updateDoctorSchedule(appointment.doctorId);
  res.json(appointment);
}

// ✅ Tách thành các hàm chuyên biệt, mỗi hàm 1 nhiệm vụ
async function createAppointment(data) {
  return db.query("INSERT INTO Appointments ...", [data]);
}

async function sendAppointmentReminder(appointment) {
  return smsService.send(appointment.patientPhone, message);
}

async function updateDoctorSchedule(doctorId) {
  return db.query("UPDATE DoctorSchedules ...");
}

async function handleAppointment(req, res) {
  const appointment = await createAppointment(req.body);
  await Promise.all([
    sendAppointmentReminder(appointment),
    updateDoctorSchedule(appointment.doctorId),
  ]);
  res.json(appointment);
}
```

### Giới hạn
- Hàm tối đa **30-40 dòng** (logic chính)
- Tối đa **3 tham số** cho function — dùng object destructuring nếu cần nhiều hơn
- Tránh hàm có **side-effect** không mong muốn

---

## 3. Tránh lặp lại mã (DRY)

```js
// ❌ Lặp lại cùng một đoạn query validation
async function getPatient(req, res) {
  const { id } = req.params;
  const patient = await db.query("SELECT * FROM Patients WHERE id = ?", [id]);
  if (!patient) return res.status(404).json({ error: "Not found" });
}

async function updatePatient(req, res) {
  const { id } = req.params;
  const patient = await db.query("SELECT * FROM Patients WHERE id = ?", [id]);
  if (!patient) return res.status(404).json({ error: "Not found" });
}

// ✅ Tái sử dụng qua service hoặc helper
async function findPatientOrThrow(id) {
  const patient = await PatientModel.findById(id);
  if (!patient) throw new NotFoundError(`Patient ${id} not found`);
  return patient;
}
```

---

## 4. Dễ đọc (Readability)

```js
// ❌ Logic phức tạp không chú thích, khó hiểu
const r = items.filter(i => i.s === 'active').map(i => ({ id: i.id, n: i.n }));

// ✅ Dễ đọc, có comment chỉ khi cần
const activeItems = items.filter(item => item.status === 'active');
const itemSummaries = activeItems.map(item => ({
  id: item.id,
  name: item.name,
}));
```

### Thứ tự trong file
1. Imports
2. Constants / Config
3. Types / Interfaces
4. Helper functions (private)
5. Main logic functions
6. Routes / Controller bindings

---

## 5. Chú thích (Comments)

### Khi nào cần comment
- **Logic phức tạp** khó hiểu (thuật toán, regex, điều kiện nghiệp vụ)
- **Trade-off** hoặc quyết định thiết kế không hiển nhiên
- **Workaround** — mã tạm thời cần fix sau
- **Business rule** không thể suy ra từ code

### Khi KHÔNG cần comment
- Comment mô tả điều hiển nhiên: `// tăng biến đếm`
- Comment lỗi thời: `// TODO: xóa sau`
- Comment thay cho code rõ ràng — hãy viết code rõ ràng hơn

```js
// ✅ Cần comment: business rule phức tạp
// BHYT chi trả 80% cho dịch vụ khám thông thường,
// 95% cho trẻ em <6 tuổi, 100% cho hộ nghèo
const bhytCoverage = calculateBhytCoverage(patient, service);

// ✅ Cần comment: workaround tạm thời
// TODO [2026-05-10]: Xóa delay sau khi tích hợp webhook thật
await new Promise(resolve => setTimeout(resolve, 2000));
```

---

## 6. Tránh mã phức tạp (Complexity)

### Phương pháp
- Đặt logic phức tạp vào **service** riêng, không nhồi nhét trong controller
- Dùng **early return** để giảm nesting
- Thay if/else dài bằng **strategy pattern** hoặc **map/lookup table**

```js
// ❌ if/else lồng nhau quá sâu
if (role === 'admin') {
  if (department) {
    if (status === 'active') {
      // ...
    }
  }
}

// ✅ Early return + lookup table
if (role === 'admin') {
  return handleAdminAccess(department, status);
}
const accessLevel = ROLE_ACCESS_MAP[role]?.[status];
if (!accessLevel) return res.status(403).json({ error: 'Forbidden' });
```

---

## 7. Tránh Magic Number

```js
// ❌ Magic numbers
if (age > 18 && score > 60) {
  // ...
}

// ✅ Đặt tên hằng số rõ ràng
const MIN_ADULT_AGE = 18;
const PASSING_SCORE = 60;
if (age > MIN_ADULT_AGE && score > PASSING_SCORE) {
  // ...
}
```

### Các hằng số phổ biến cần đặt tên
- Thời gian: `TOKEN_EXPIRY_MS`, `SESSION_TIMEOUT_HOURS`, `MAX_LOGIN_ATTEMPTS`
- Giới hạn: `MAX_PAGE_SIZE`, `DEFAULT_PAGE`, `MIN_PASSWORD_LENGTH`
- Trạng thái: `APPOINTMENT_STATUS`, `ORDER_STATUS`, `PAYMENT_METHODS`
- Cấu hình: `DEFAULT_LANGUAGE`, `BHYT_COVERAGE_RATES`

---

## 8. Tránh vòng lặp quá sâu (Nesting)

### Nguyên tắc
- Tối đa **2 cấp vòng lặp lồng nhau** — nếu cần 3+, tách thành hàm riêng
- Thay vòng lặp phức tạp bằng `map`, `filter`, `reduce`, `flatMap`

```js
// ❌ Vòng lặp lồng 3 cấp
for (const dept of departments) {
  for (const doctor of dept.doctors) {
    for (const schedule of doctor.schedules) {
      totalSlots += schedule.slotCount;
    }
  }
}

// ✅ Tách hàm, giảm nesting
function sumSlotsByDepartment(departments) {
  return departments.reduce((total, dept) =>
    total + sumSlotsByDoctor(dept.doctors), 0);
}

function sumSlotsByDoctor(doctors) {
  return doctors.reduce((total, doctor) =>
    total + doctor.schedules.reduce((s, sch) => s + sch.slotCount, 0), 0);
}
```

---

## 9. Error Handling

```js
// ✅ Nên dùng custom error class
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// ✅ Middleware xử lý tập trung
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ code: err.code, message: err.message });
  }
  // ...
});
```

---

## 10. Validation

```js
// ✅ Validate ngay tại tầng Controller hoặc DTO
const createAppointmentSchema = {
  patient_id: { type: 'number', required: true },
  doctor_id: { type: 'number', required: true },
  appointment_date: { type: 'date', required: true },
  slot_time: { type: 'string', required: true },
};

function validate(schema, data) {
  const errors = Object.entries(schema)
    .filter(([key, rule]) => rule.required && !data[key])
    .map(([key]) => `Missing required field: ${key}`);
  if (errors.length) throw new ValidationError(errors.join('; '));
  return data;
}
```

---

## 11. SQL Server — Quy tắc truy vấn

```js
// ✅ Dùng parameterized query, không nối chuỗi
const patient = await sql.query(
  'SELECT * FROM Patients WHERE id = @patientId',
  { patientId: req.params.id }
);

// ❌ SQL Injection nguy hiểm
const patient = await sql.query(
  `SELECT * FROM Patients WHERE id = ${req.params.id}`
);

// ✅ Đặt tên rõ ràng cho cột trả về
const result = await sql.query(`
  SELECT
    p.patient_id    AS id,
    p.full_name     AS name,
    p.phone         AS phone,
    ins.bhyt_number AS insuranceNumber
  FROM Patients p
  LEFT JOIN Insurance ins ON ins.patient_id = p.patient_id
  WHERE p.patient_id = @patientId
`, { patientId });

// ✅ Transaction cho các thao tác nhiều bước
const transaction = new sql.Transaction();
await transaction.begin();
try {
  await transaction.query('INSERT Appointments ...', data);
  await transaction.query('UPDATE DoctorSchedules ...', scheduleData);
  await transaction.commit();
} catch (err) {
  await transaction.rollback();
  throw err;
}
```

---

## 12. Giới hạn dòng & Module

| Thành phần | Giới hạn |
|-----------|----------|
| Hàm (function body) | 30–40 dòng |
| File source | 200–300 dòng |
| Controller | 50–80 dòng (chỉ routing + call service) |
| Vòng lặp lồng nhau | Tối đa 2 cấp |
| Số tham số/hàm | ≤ 3 (dùng object nếu cần nhiều hơn) |

---

## Checklist trước khi commit

- [ ] Tên hàm mô tả đúng chức năng?
- [ ] Hàm chỉ làm 1 nhiệm vụ duy nhất?
- [ ] Không có Magic Number (thay bằng hằng số)?
- [ ] Không lặp lại đoạn mã giống nhau?
- [ ] Comment cho logic phức tạp/chỗ khó hiểu?
- [ ] Không có vòng lặp lồng quá 2 cấp?
- [ ] Không có SQL Injection (dùng parameterized query)?
- [ ] Có validate dữ liệu đầu vào?
- [ ] Có handle error rõ ràng?
- [ ] Tên biến/hàm theo convention?
