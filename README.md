# Hệ Thống Quản Lý Bệnh Viện (HIS)

Dự án này bao gồm hai phần chính: **Frontend** (giao diện người dùng) và **Backend** (hệ thống API và xử lý dữ liệu). Cấu trúc dự án được tổ chức theo dạng Monorepo.

## 📂 Cấu trúc thư mục

```text
HeThongBenhVien/
├── backend/    # Chứa source code Node.js/Express cho API
├── frontend/   # Chứa source code Vite/React cho UI
└── README.md   # File hướng dẫn này
```

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

Bạn cần mở **2 cửa sổ Terminal** riêng biệt: một cho Backend và một cho Frontend.

### 1. Chạy Backend (Node.js/Express)

**Bước 1:** Mở cửa sổ Terminal thứ nhất và di chuyển vào thư mục backend:
```bash
cd backend
```

**Bước 2:** Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

**Bước 3:** (Tùy chọn) Cấu hình biến môi trường bằng cách tạo file `.env` dựa trên `.env.example` nếu có.

**Bước 4:** Khởi động server backend:
```bash
npm run dev
```
*(Backend sẽ mặc định chạy trên cổng đã cấu hình trong file `.env` hoặc cổng 3000/5000 tùy thuộc vào mã nguồn của bạn)*.

---

### 2. Chạy Frontend (React/Vite)

**Bước 1:** Mở cửa sổ Terminal thứ hai và di chuyển vào thư mục frontend:
```bash
cd frontend
```

**Bước 2:** Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

**Bước 3:** Khởi động giao diện frontend:
```bash
npm run dev
```
*(Vite sẽ hiển thị đường dẫn localhost với cổng mặc định, ví dụ: `http://localhost:5173`. Bạn nhấn Ctrl + Click vào link đó để mở trên trình duyệt)*.

---

## 🛠 Công nghệ sử dụng

- **Frontend:** React 18, Vite, TailwindCSS
- **Backend:** Node.js, Express, Jest
