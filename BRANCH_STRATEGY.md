# Branch Strategy

> Quy tắc đặt tên branch, commit message, và quy trình review cho dự án HIS.

---

## 1. Branch naming convention

### Cấu trúc

```
<type>/<module>-<ticket-id>-<short-description>
```

### Type prefix

| Prefix | Dùng khi |
|--------|----------|
| `feat/` | Phát triển feature mới |
| `fix/` | Sửa bug |
| `hotfix/` | Fix gấp trên production |
| `refactor/` | Cải thiện code không đổi logic |
| `chore/` | Cập nhật config, dependency, docs |
| `test/` | Thêm/bổ sung test |
| `docs/` | Cập nhật tài liệu |

### Ví dụ

```
feat/m0-auth-jwt-token-refresh
feat/m1-patient-pid-auto-generation
fix/m1-appointment-slot-conflict-detection
hotfix/auth-login-session-expiry
refactor/common-error-handling-middleware
chore/update-eslint-config
test/m1-queue-priority-logic
docs/api-contract-v2
```

---

## 2. Commit message convention

### Format

```
<type>(<module>): <short summary>

[optional body — giải thích WHY, không phải WHAT]

[optional footer — ticket refs, breaking changes]
```

### Ví dụ

```
feat(auth): add JWT refresh token rotation

Refresh token được rotate sau mỗi lần sử dụng để phòng
tránh token replay attack.

Closes #M0.1-12
BREAKING CHANGE: /auth/refresh yêu cầu refresh_token thay vì access_token
```

### Type cho commit

| Type | Mô tả |
|------|--------|
| `feat` | Feature mới |
| `fix` | Fix bug |
| `refactor` | Refactor không thay đổi behavior |
| `perf` | Cải thiện performance |
| `test` | Thêm test |
| `docs` | Cập nhật docs |
| `chore` | Build, config, dependency |
| `revert` | Revert commit |

---

## 3. Pull Request workflow

### 3.1. Tạo branch

```bash
git checkout main
git pull origin main
git checkout -b feat/m1-patient-duplicate-detection
```

### 3.2. Commit & push

```bash
git add .
git commit -m "feat(patient): add duplicate patient detection"
git push -u origin feat/m1-patient-duplicate-detection
```

### 3.3. Tạo PR trên GitHub

- Điền đầy đủ: title, description, reviewers, labels
- Gắn ticket ID vào title
- Mô tả rõ: what, why, how
- Đính kèm screenshots nếu có UI

### 3.4. Review checklist

- [ ] Code tuân thủ `CLEAN_CODE_GUIDELINES.md`
- [ ] ESLint pass, không có warning
- [ ] Unit test coverage ≥ 70%
- [ ] API test (Postman) pass
- [ ] Không có secrets trong code
- [ ] Migration/seed script đi kèm (nếu có schema change)
- [ ] Có audit log cho mọi thao tác ghi (POST/PUT/DELETE)

### 3.5. Merge

- Squash and merge vào `develop`
- Merge `develop` → `main` khi release
- **Không được force-push** vào `main` và `develop`

---

## 4. Environment branches

| Branch | Mục đích | Auto-deploy |
|--------|----------|------------|
| `main` | Production code | ✅ Staging |
| `develop` | Integration branch | ✅ Staging |
| `feat/<name>` | Feature development | ❌ Manual |
| `hotfix/<name>` | Production hotfix | ❌ Manual |

---

## 5. Module prefix map

| Prefix | Module |
|--------|--------|
| `m0` | Nền tảng (auth, rbac, master data) |
| `m1` | Tiếp nhận & Hồ sơ BN |
| `m2` | Khám & Điều trị |
| `m3` | Cận lâm sàng |
| `m4` | Dược & Vật tư |
| `m5` | Viện phí & Thanh toán |
| `m6` | Nội trú |
| `m7` | Nhân sự & Phân công |
| `m8` | Thiết bị & Hậu cần |
| `m9` | Báo cáo & Thống kê |
| `infra` | Infrastructure, DevOps |
| `docs` | Documentation |

---

## 6. Ticket ID convention

```
M<module>.<feature>-<number>
M0.1-001    ← Feature 1, Module 0 (Auth)
M1.2-003    ← Feature 3, Module 1 (Appointment)
M2.3-012    ← Feature 12, Module 2 (e-Prescription)
```
