# DO-1.3 - CI/CD Pipeline

Tài liệu này mô tả cách dùng các workflow GitHub Actions đã tạo cho tuần 1.

## Workflow đã tạo

- `.github/workflows/backend-ci.yml`
- `.github/workflows/backend-cd-staging.yml`
- `.github/workflows/frontend-ci.yml`
- `.github/workflows/frontend-cd-staging.yml`

## Backend CI

Chạy khi có Pull Request vào các nhánh `develop` hoặc `develop/**`.

Các bước chính:

- checkout source
- setup Node.js 18
- cài dependencies bằng `npm ci` hoặc `npm install`
- chạy `npm run lint`
- chạy `npm test -- --runInBand`

## Backend CD Staging

Chạy khi push vào nhánh `develop` hoặc `develop/**`.

Workflow sẽ SSH vào staging server và chạy:

```bash
git fetch origin
git checkout <branch>
git pull origin <branch>
docker compose up -d --build
```

## Frontend CI/CD

Workflow frontend hoạt động tương tự backend, nhưng tìm source trong thư mục `frontend/`.

## GitHub Secrets cần tạo

Thiết lập các secret sau trong repository settings:

- `STAGING_HOST`: IP hoặc domain staging server
- `STAGING_USER`: user SSH trên staging server
- `STAGING_PORT`: cổng SSH, mặc định `22`
- `STAGING_SSH_KEY`: private key để GitHub Actions SSH vào server
- `STAGING_DEPLOY_PATH`: thư mục chứa source code trên staging server

## Yêu cầu trên staging server

- đã cài Docker
- đã cài Docker Compose hoặc Docker Compose plugin
- đã cài Nginx
- source code của repo đã được clone sẵn tại `STAGING_DEPLOY_PATH`
- branch deploy đã có trên server và có quyền pull từ origin

## Ghi chú

- Nếu frontend không nằm trong thư mục `frontend/`, cần sửa lại đường dẫn trong workflow frontend.
- Nếu backend đang ở thư mục khác, workflow backend cũng cần chỉnh tương tự.