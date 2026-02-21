# 🚀 IELTS Helper — Hướng dẫn sử dụng từ đầu (cho người mới)

> Tài liệu này hướng dẫn bạn chạy dự án IELTS Helper từ con số 0 trên máy tính cá nhân.

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Clone dự án](#2-clone-dự-án)
3. [Khởi động Database & Redis](#3-khởi-động-database--redis)
4. [Cài đặt Backend](#4-cài-đặt-backend)
5. [Cài đặt Frontend](#5-cài-đặt-frontend)
6. [Kiểm tra hệ thống](#6-kiểm-tra-hệ-thống)
7. [Sử dụng ứng dụng](#7-sử-dụng-ứng-dụng)
8. [Các lệnh thường dùng](#8-các-lệnh-thường-dùng)
9. [Xử lý lỗi thường gặp](#9-xử-lý-lỗi-thường-gặp)
10. [Kiến trúc tổng quan](#10-kiến-trúc-tổng-quan)

---

## 1. Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:

| Phần mềm | Phiên bản tối thiểu | Kiểm tra bằng lệnh | Link tải |
|-----------|---------------------|---------------------|----------|
| **Node.js** | 20+ | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | 10+ | `npm -v` | Cài kèm Node.js |
| **Docker Desktop** | 4.x | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop) |
| **Git** | 2.x | `git --version` | [git-scm.com](https://git-scm.com) |

> 💡 **Tip:** Nếu dùng Windows, nên dùng **PowerShell** hoặc **Git Bash** để chạy lệnh.

---

## 2. Clone dự án

```bash
# Clone dự án về máy
git clone https://github.com/Ttuandatt/IELTS_Instructor.git

# Di chuyển vào thư mục dự án
cd IELTS_Instructor
```

---

## 3. Khởi động Database & Redis

Dự án sử dụng **PostgreSQL 15** (database) và **Redis 7** (cache) chạy qua Docker.

```bash
# Khởi động cả 2 service (chạy ngầm)
docker compose up -d
```

Kiểm tra đã chạy thành công:

```bash
docker compose ps
```

Kết quả mong đợi — cả 2 container đều **healthy**:

```
NAME             STATUS                  PORTS
ielts-postgres   Up ... (healthy)        0.0.0.0:5434->5432/tcp
ielts-redis      Up ... (healthy)        0.0.0.0:6380->6379/tcp
```

> ⚠️ **Lưu ý:** Port mặc định là **5434** (Postgres) và **6380** (Redis), KHÔNG phải 5432/6379 tiêu chuẩn. Điều này tránh xung đột với các dự án khác.

---

## 4. Cài đặt Backend

### 4.1. Cài dependencies

```bash
cd apps/backend
npm install
```

### 4.2. Kiểm tra file .env

File `.env` đã có sẵn với cấu hình mặc định cho development. Kiểm tra nội dung:

```bash
cat .env
```

Các giá trị quan trọng:

| Biến | Giá trị mặc định | Mô tả |
|------|-------------------|-------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5434/ielts_helper` | Kết nối PostgreSQL |
| `REDIS_URL` | `redis://localhost:6380` | Kết nối Redis |
| `JWT_SECRET` | `dev-jwt-secret-...` | Secret key cho JWT |
| `ADMIN_EMAIL` | `admin@ieltshelper.local` | Email tài khoản admin |
| `ADMIN_PASSWORD` | `Admin1234!` | Mật khẩu tài khoản admin |

> ⚠️ Không cần chỉnh gì cho môi trường dev. Chỉ thay đổi khi deploy production.

### 4.3. Chạy Prisma migration (tạo bảng trong database)

```bash
npx prisma migrate deploy
```

Kết quả mong đợi:

```
1 migration found in prisma/migrations
...
The following migration have been applied:
  20260221151309_init_users
```

### 4.4. Generate Prisma Client

```bash
npx prisma generate
```

### 4.5. Tạo tài khoản Admin (seed)

```bash
npm run seed
```

Kết quả:

```
✅ Admin user created: admin@ieltshelper.local
```

### 4.6. Khởi động Backend server

```bash
npm run start:dev
```

Kết quả mong đợi:

```
[Nest] LOG [NestApplication] Nest application successfully started
```

Backend chạy tại: **http://localhost:3001**

> 💡 Ở chế độ `start:dev`, code tự động reload khi bạn chỉnh sửa file.

---

## 5. Cài đặt Frontend

Mở **terminal mới** (giữ backend chạy ở terminal cũ):

```bash
cd apps/frontend
npm install
npm run dev
```

Frontend chạy tại: **http://localhost:3000**

---

## 6. Kiểm tra hệ thống

Mở **terminal mới** (terminal thứ 3):

### 6.1. Health check

```bash
curl http://localhost:3001/api/health
```

Kết quả mong đợi:

```json
{
  "status": "ok",
  "timestamp": "2026-02-21T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

Nếu thấy `"status": "ok"` → hệ thống hoạt động bình thường ✅

### 6.2. Kiểm tra đăng nhập Admin

```bash
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ieltshelper.local","password":"Admin1234!"}'
```

Nếu trả về JSON có `access_token` → đăng nhập thành công ✅

---

## 7. Sử dụng ứng dụng

### 7.1. Truy cập giao diện web

Mở trình duyệt → **http://localhost:3000**

### 7.2. Đăng nhập tài khoản Admin

- **Email:** `admin@ieltshelper.local`
- **Mật khẩu:** `Admin1234!`

### 7.3. Đăng ký tài khoản mới

Tại trang Register, bạn có thể tạo tài khoản với 3 vai trò:

| Vai trò | Mô tả |
|---------|-------|
| **Learner** (mặc định) | Học viên — làm bài Reading & Writing |
| **Instructor** | Giảng viên — quản lý bài thi, xem kết quả học viên |
| **Admin** | Quản trị — toàn quyền hệ thống |

### 7.4. Xem database trực quan (Prisma Studio)

```bash
cd apps/backend
npx prisma studio
```

Mở trình duyệt → **http://localhost:5555** → xem và chỉnh sửa dữ liệu trực tiếp.

---

## 8. Các lệnh thường dùng

### Quản lý Docker

| Lệnh | Mô tả |
|-------|-------|
| `docker compose up -d` | Khởi động Postgres + Redis |
| `docker compose down` | Tắt containers (giữ data) |
| `docker compose down -v` | Tắt containers + **xoá toàn bộ data** |
| `docker compose ps` | Kiểm tra trạng thái containers |
| `docker compose logs postgres` | Xem log PostgreSQL |
| `docker compose logs redis` | Xem log Redis |

### Backend (chạy trong `apps/backend/`)

| Lệnh | Mô tả |
|-------|-------|
| `npm run start:dev` | Chạy backend (hot reload) |
| `npm run build` | Build production |
| `npm run seed` | Tạo tài khoản admin |
| `npm test` | Chạy unit test |
| `npx prisma migrate dev --name TenMigration` | Tạo migration mới |
| `npx prisma migrate deploy` | Chạy các migration chưa áp dụng |
| `npx prisma migrate reset` | **Reset toàn bộ DB** + chạy lại migration |
| `npx prisma generate` | Cập nhật Prisma Client sau khi sửa schema |
| `npx prisma studio` | Mở giao diện xem database |

### Frontend (chạy trong `apps/frontend/`)

| Lệnh | Mô tả |
|-------|-------|
| `npm run dev` | Chạy frontend (hot reload) |
| `npm run build` | Build production |
| `npm run lint` | Kiểm tra lỗi code |

---

## 9. Xử lý lỗi thường gặp

### ❌ "Cannot connect to database"

```
Nguyên nhân: Docker chưa chạy hoặc container bị tắt.
Cách sửa:
  1. Mở Docker Desktop
  2. docker compose up -d
  3. docker compose ps  (kiểm tra healthy)
```

### ❌ "Port 3001 already in use"

```
Nguyên nhân: Có process cũ đang dùng port 3001.
Cách sửa (Windows PowerShell):
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
  Stop-Process -Id <PID> -Force
  
Cách sửa (nhanh):
  npx kill-port 3001
```

### ❌ "Migration failed"

```
Nguyên nhân: Database schema không đồng bộ.
Cách sửa:
  npx prisma migrate reset    # Reset DB + chạy lại migration
  npm run seed                 # Tạo lại admin
```

### ❌ "PrismaClient not generated"

```
Nguyên nhân: Chưa generate client sau khi cài dependencies.
Cách sửa:
  npx prisma generate
```

### ❌ "Redis connection refused"

```
Nguyên nhân: Redis container chưa chạy.
Cách sửa:
  docker compose up -d redis
  docker compose ps
```

### ❌ Frontend hiện trang trắng / lỗi fetch

```
Nguyên nhân: Backend chưa chạy hoặc sai API URL.
Cách sửa:
  1. Đảm bảo backend đang chạy (terminal riêng)
  2. Kiểm tra file apps/frontend/.env.local có dòng:
     NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 10. Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────┐
│                    Trình duyệt                      │
│               http://localhost:3000                  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP (REST API)
                       ▼
┌──────────────────────────────────────────────────────┐
│              Frontend (Next.js 14)                   │
│              Port: 3000                              │
│  ┌────────────┬───────────┬────────────────────────┐ │
│  │  Login     │ Register  │  Dashboard / Settings  │ │
│  └────────────┴───────────┴────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │ Axios → /api/*
                       ▼
┌──────────────────────────────────────────────────────┐
│              Backend (NestJS 10)                     │
│              Port: 3001   Prefix: /api               │
│  ┌─────────────────────────────────────────────────┐ │
│  │  AuthModule  │  (Future: Reading, Writing...)   │ │
│  │  ├─ Register (POST /api/auth/register)          │ │
│  │  ├─ Login    (POST /api/auth/login)             │ │
│  │  ├─ Refresh  (POST /api/auth/refresh)           │ │
│  │  ├─ Profile  (GET  /api/auth/profile)           │ │
│  │  └─ Update   (PATCH /api/auth/profile)          │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────────┐               │
│  │ PrismaModule│  │ JWT + RBAC Guard │               │
│  └──────┬──────┘  └──────────────────┘               │
└─────────┼────────────────────────────────────────────┘
          │                          │
          ▼                          ▼
┌──────────────────┐    ┌──────────────────┐
│   PostgreSQL 15  │    │     Redis 7      │
│   Port: 5434     │    │   Port: 6380     │
│                  │    │                  │
│  users table:    │    │  Cache, Queue,   │
│  - id (UUID)     │    │  Rate Limiting   │
│  - email         │    │                  │
│  - password_hash │    │                  │
│  - display_name  │    │                  │
│  - role          │    │                  │
│  - language      │    │                  │
│  - theme         │    │                  │
└──────────────────┘    └──────────────────┘
```

### Flow xác thực (Authentication)

```
1. Người dùng nhập email + password tại /register hoặc /login
2. Frontend gửi POST request đến Backend
3. Backend xác thực → trả về access_token (15 phút) + refresh_token (7 ngày)
4. Frontend lưu token vào localStorage
5. Mỗi request sau đó gửi kèm header: Authorization: Bearer <access_token>
6. Khi access_token hết hạn → Frontend tự gọi /auth/refresh để lấy token mới
```

### Cấu trúc thư mục

```
IELTS_Instructor/
├── docker-compose.yml          # Cấu hình Postgres + Redis
├── README.md                   # Giới thiệu dự án
├── GETTING_STARTED.md          # 📌 File này
│
├── apps/
│   ├── backend/                # NestJS 10 (TypeScript)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Định nghĩa database schema
│   │   │   └── migrations/     # Lịch sử thay đổi database
│   │   ├── src/
│   │   │   ├── auth/           # Module xác thực (login, register, JWT)
│   │   │   ├── prisma/         # PrismaService (kết nối database)
│   │   │   ├── seeds/          # Script tạo dữ liệu mẫu
│   │   │   ├── app.module.ts   # Module gốc
│   │   │   └── main.ts         # Entry point
│   │   ├── .env                # Biến môi trường (dev)
│   │   └── package.json
│   │
│   └── frontend/               # Next.js 14 (TypeScript + Tailwind)
│       ├── src/app/
│       │   ├── login/          # Trang đăng nhập
│       │   ├── register/       # Trang đăng ký
│       │   ├── dashboard/      # Trang chính sau đăng nhập
│       │   ├── settings/       # Trang cài đặt
│       │   └── providers.tsx   # AuthProvider, QueryProvider
│       ├── .env.local          # Biến môi trường frontend
│       └── package.json
│
└── docs/                       # Tài liệu thiết kế (30 files)
    ├── step1_business_idea/    # Ý tưởng kinh doanh
    ├── step2_lowcode/          # Thiết kế màn hình, luồng dữ liệu
    ├── step3_prd/              # PRD chi tiết (17 files + API spec)
    └── step4_implementation_plan/  # Kế hoạch triển khai
```

---

## ⚡ TL;DR — Chạy nhanh trong 2 phút

```bash
# 1. Clone
git clone https://github.com/Ttuandatt/IELTS_Instructor.git
cd IELTS_Instructor

# 2. Docker (Postgres + Redis)
docker compose up -d

# 3. Backend
cd apps/backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run seed
npm run start:dev          # Giữ terminal này mở

# 4. Frontend (terminal mới)
cd apps/frontend
npm install
npm run dev                # Giữ terminal này mở

# 5. Mở trình duyệt
#    → http://localhost:3000
#    → Đăng nhập: admin@ieltshelper.local / Admin1234!
```

---

> 📚 **Tài liệu thêm:** Xem thư mục `docs/` để đọc chi tiết về PRD, API spec, và kế hoạch triển khai.
