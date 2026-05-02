# DO-1.4 - Monitoring, Logging, and Health Check

Backend hiện đã có source thật và endpoint `GET /health` được implement trong `src/app.js`, nên phần này tập trung vào cách xác nhận, giám sát và tài liệu triển khai cho team.

## Mục tiêu

- Có một endpoint `GET /health` để kiểm tra trạng thái server.
- Có cách xem log tập trung khi chạy local hoặc staging.
- Có cảnh báo khi server down bằng Uptime Robot hoặc công cụ tương đương.

## 1) Health check endpoint

Backend hiện tại đã trả về trạng thái đơn giản, ví dụ:

```json
{
  "status": "ok",
  "timestamp": "2026-05-02T00:00:00.000Z"
}
```

### Vị trí hiện tại trong code

Endpoint đã được khai báo trực tiếp trong `src/app.js`:

```js
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
```

### Cần kiểm tra gì thêm

- Mở `GET /health` trên local và staging để xác nhận trả về `200 OK`.
- Dùng endpoint này cho Uptime Robot hoặc service monitor tương đương.

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

- [x] Backend có endpoint `GET /health`.
- [x] Endpoint trả về status `ok`.
- [ ] Dùng được để kiểm tra trên local và staging.
- [ ] Có cách xem log backend bằng Docker logs hoặc PM2 logs.
- [ ] Đã cấu hình cảnh báo uptime trỏ vào `/health`.

## 5) Ghi chú cho team

- File này là phần hướng dẫn triển khai và giám sát cho DO-1.4.
- Backend source đã có `/health` nên bước còn lại là xác nhận trên local/staging và cấu hình giám sát bên ngoài.