Hướng dẫn nhanh: test API với Postman

1) Tạo Environment
- Name: `local`
- Variable: `base_url` = `http://localhost:3000`

2) Tạo Collection (ví dụ tên: `HeThongBenhVien API`)
- Thêm request `Health`
  - Method: GET
  - URL: {{base_url}}/health
  - Tests (optional): `pm.test("status 200", () => pm.response.code === 200);`

- Thêm request `List Patients`
  - Method: GET
  - URL: {{base_url}}/api/patients

- Thêm request `Create Patient`
  - Method: POST
  - URL: {{base_url}}/api/patients
  - Header: `Content-Type: application/json`
  - Body (raw JSON):
    {
      "name": "Nguyen Van A",
      "phone": "0901234567",
      "dateOfBirth": "1990-01-01",
      "gender": "male",
      "address": "Hanoi"
    }
  - Tests (optional):
    ```js
    pm.test("created", () => pm.response.code === 201);
    const json = pm.response.json();
    pm.environment.set("lastPatientId", json.data.id);
    ```

- Thêm request `Create Appointment`
  - Method: POST
  - URL: {{base_url}}/api/appointments
  - Header: `Content-Type: application/json`
  - Body (raw JSON):
    {
      "patientId": "{{lastPatientId}}",
      "doctorId": "doc-1",
      "appointmentDate": "2026-05-01",
      "appointmentTime": "09:30",
      "reason": "Kham tong quat"
    }
  - Notes: nếu API của bạn dùng tên trường khác (ví dụ `date` + `time`), chỉnh theo `docs/backend-api-spec.md`.

- Thêm request `Create Queue`
  - Method: POST
  - URL: {{base_url}}/api/queues
  - Header: `Content-Type: application/json`
  - Body (raw JSON):
    {
      "patientId": "{{lastPatientId}}"
    }
  - Tests (optional): set queue id
    ```js
    pm.environment.set("lastQueueId", pm.response.json().data.id);
    ```

- Thêm request `Call Next`
  - Method: POST
  - URL: {{base_url}}/api/queues/next

- Thêm request `Complete Queue`
  - Method: PATCH
  - URL: {{base_url}}/api/queues/{{lastQueueId}}/complete

3) Chạy bằng Collection Runner
- Chọn collection `HeThongBenhVien API`, environment `local`.
- (Optional) Sắp xếp thứ tự: Create Patient -> Create Appointment -> Create Queue -> Call Next -> Complete Queue.
- Nhấn `Run`.

4) Ghi chú và debug
- Kiểm tra `Console` trong Postman để xem body/response chi tiết.
- Nếu validation lỗi, so sánh payload với `docs/backend-api-spec.md`.
- Nếu muốn tự động assertion, thêm `Tests` trên mỗi request (ví dụ kiểm tra `status`, hoặc `pm.expect(pm.response.json().success).to.be.true`).

5) Muốn tôi export collection?
- Tôi có thể tạo file JSON Postman collection (v2.1) và để tại `docs/postman-collection.json` để bạn import trực tiếp. Hãy confirm nếu muốn.