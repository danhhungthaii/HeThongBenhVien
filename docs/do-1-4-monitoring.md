# DO-1.4 - Monitoring, Logging, and Health Check

Repo hiện tại chưa có source backend để gắn trực tiếp vào app, nên phần này được chuẩn bị theo dạng tài liệu triển khai và mẫu code để backend team tích hợp ngay khi có source.

## Mục tiêu

- Có một endpoint `GET /health` để kiểm tra trạng thái server.
- Có cách xem log tập trung khi chạy local hoặc staging.
- Có cảnh báo khi server down bằng Uptime Robot hoặc công cụ tương đương.

## 1) Health check endpoint

Backend cần trả về trạng thái đơn giản, ví dụ:

```json
{
  "status": "ok",
  "timestamp": "2026-05-02T00:00:00.000Z"
}
```

### Mẫu Express route

Backend team có thể thêm route này vào app Express:

```js
// src/routes/health.js
const express = require('express');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
```

Gắn vào app chính:

```js
// src/app.js
const express = require('express');
const healthRoutes = require('./routes/health');

const app = express();

app.use(healthRoutes);

module.exports = app;
```

## 2) Log tập trung

### Phương án local / staging đơn giản

- Backend chạy bằng `morgan` để log request.
- `winston` dùng cho log ứng dụng và log lỗi.
- Docker logs dùng để xem nhanh khi chạy local.

### Cách kiểm tra log

```powershell
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f redis
```

### Nếu backend chạy bằng PM2

```bash
pm2 logs
pm2 monit
```

### Nếu muốn đẩy log ra dịch vụ ngoài

- Có thể dùng Logtail, Better Stack, hoặc dịch vụ log tương đương.
- Cấu hình agent trên staging server để gom log từ backend container.

## 3) Uptime monitoring

### Thiết lập Uptime Robot

1. Tạo monitor kiểu `HTTP(s)`.
2. URL trỏ vào `/health` của staging.
3. Kiểm tra mỗi 5 phút hoặc theo gói đang dùng.
4. Bật cảnh báo email khi endpoint trả lỗi hoặc không phản hồi.

### Ví dụ URL

```text
http://<staging-ip-or-domain>/health
```

## 4) Checklist hoàn thành DO-1.4

- [ ] Backend có endpoint `GET /health`.
- [ ] Endpoint trả về status `ok`.
- [ ] Dùng được để kiểm tra trên local và staging.
- [ ] Có cách xem log backend bằng Docker logs hoặc PM2 logs.
- [ ] Đã cấu hình cảnh báo uptime trỏ vào `/health`.

## 5) Ghi chú cho team

- File này là phần chuẩn bị cho DO-1.4 khi backend source được merge vào repo.
- Khi có source backend thật, chỉ cần copy mẫu route ở trên vào đúng cấu trúc `src/` của project.