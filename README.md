# Tuần 1 - Local Development Setup

Repository này đang được dùng để chuẩn bị môi trường phát triển local cho tuần 1.

## Thành phần hiện có

- `docker-compose.yml`: dựng backend Node.js, SQL Server, Redis và Nginx.
- `.env.example`: file mẫu để tạo `.env` trên từng máy.
- `nginx/default.conf`: reverse proxy cho backend.

## Yêu cầu trước khi chạy

- Docker Desktop hoặc Docker Engine đã cài sẵn.
- Git đã cài trên máy.
- Repo đang ở nhánh làm việc của bạn, ví dụ `develop/MinhDung`.

## Cách cấu hình

1. Copy file môi trường mẫu thành file thật:

```powershell
Copy-Item .env.example .env
```

2. Mở file `.env` và chỉnh lại các giá trị cần thiết:
- `DB_PASSWORD`
- `JWT_SECRET`
- `DB_NAME` phải để là `QLBV`
- `PORT`, `DB_PORT`, `REDIS_PORT`, `NGINX_PORT` nếu bị trùng cổng trên máy của bạn

## Cách chạy

```powershell
docker-compose up -d
```

## Truy cập sau khi chạy

- Nginx: `http://localhost:8080`
- Backend API: `http://localhost:3000` nếu cần truy cập trực tiếp
- SQL Server: `localhost,1433`
- Redis: `localhost:6379`

## Kiểm tra nhanh

```powershell
docker-compose ps
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f redis
```

## Ghi chú quan trọng

- Backend container đang được cấu hình để chạy bằng `npm run dev` và đọc các biến môi trường ở file `.env`.
- Backend source code phải có trong repo để service `backend` chạy thành công.
- Nếu source frontend có trong cùng repo, có thể thêm service frontend và route qua Nginx theo cùng cách.

## Mục tiêu tuần 1

- Team có thể dựng toàn bộ stack bằng một lệnh.
- Khánh kiểm tra database.
- Toàn kiểm tra API.
- Thiên kiểm tra frontend trên cùng môi trường local khi source frontend đã được thêm vào.

## DO-1.4 - Monitoring và Health Check

- Tài liệu triển khai monitoring: [docs/do-1-4-monitoring.md](docs/do-1-4-monitoring.md)
- Endpoint `/health` sẽ được backend team tích hợp vào source Express khi code backend được merge vào repo.