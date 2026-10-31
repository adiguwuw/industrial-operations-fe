# Industrial Operations — Frontend

Industrial Operations (IndOps) adalah platform internal yang dikembangkan untuk membantu perusahaan industri mengelola proses operasional secara terintegrasi.

Repository ini berisi **Frontend Web Application** dari IndOps yang dibangun menggunakan React dan TypeScript.

## 🎯 Project Overview

IndOps dirancang sebagai platform internal yang dapat dikembangkan untuk menangani berbagai kebutuhan operasional industri.

Fokus pengembangan saat ini adalah **K3 Incident Management**, dengan pengembangan bertahap menuju platform yang mencakup:

- K3 Management
- Operational Management
- Workforce Management
- HRIS
- Payroll
- Analytics

Frontend berfungsi sebagai antarmuka utama bagi pengguna untuk berinteraksi dengan sistem melalui REST API Backend.

## 🚀 Current Features

### 🔐 Authentication

- Login
- Logout
- Persistent authentication menggunakan token
- Role-based navigation
- Protected routes
- Automatic handling ketika session tidak lagi valid

### 👥 User Management

Admin dapat mengelola pengguna melalui:

- User list
- Search user
- Filter berdasarkan role
- Create user
- Edit user
- Delete user
- Role assignment
- Profile photo

### 👤 Profile

Pengguna dapat melihat informasi profil:

- Nama
- Email
- Role
- Profile photo

Profile photo menggunakan authenticated API request sehingga data pengguna tetap terlindungi.

### 🚨 Incident Management

Pengguna dapat:

- Melihat incident
- Melaporkan incident
- Menentukan kategori
- Menentukan severity
- Menambahkan lokasi
- Menambahkan foto
- Melihat status incident
- Menambahkan komentar
- Melakukan investigasi
- Menyelesaikan incident

### 📊 Dashboard

Dashboard menyediakan visualisasi informasi operasional seperti:

- Total incident
- Incident berdasarkan status
- Incident berdasarkan severity
- Incident berdasarkan kategori
- Incident trends

Akses dashboard disesuaikan dengan role pengguna.

### 🔔 Notifications

Frontend menyediakan notification interface untuk menampilkan informasi aktivitas sistem.

## 👥 User Roles

Sistem saat ini menggunakan beberapa role utama:

| Role | Access |
|------|--------|
| Admin | Full system management |
| K3 Officer | K3 & incident management |
| Supervisor | Operational monitoring |
| Employee | Incident reporting & user functions |

Hak akses setiap role dikontrol oleh backend melalui role dan permission.

## 🏗️ Application Architecture

Frontend dan backend dikembangkan sebagai aplikasi yang terpisah.

```text
                    Industrial Operations
                            │
              ┌─────────────┴─────────────┐
              │                           │
        React Frontend              Laravel Backend
              │                           │
        TypeScript + Vite             REST API
              │                           │
        Tailwind CSS                   MySQL
```

## Local development

Install dependencies and start Vite:

~~~bash
npm ci
npm run dev
~~~

The Vite development server proxies API and public storage requests to the Laravel development server at http://127.0.0.1:8000. Set VITE_API_PROXY_TARGET if the backend uses a different address. The frontend uses the same-origin /api path, so browser CORS configuration is not needed for this setup.

## Docker

The multi-stage Dockerfile builds the React application and serves the static files with Nginx. The Nginx container also forwards /api requests to the backend PHP-FPM service and serves public files from the shared storage volume.

Build and run the complete stack from the backend repository directory. The Compose configuration builds this repository from its sibling folder:

~~~bash
docker compose -f compose.yaml --env-file .env.docker up -d --build
~~~

For local browser access, open http://localhost:8080. The published port is bound to the local machine only. In production, configure Nginx Proxy Manager to forward the application domain to the frontend service on port 80.

## Deployment to Vercel

The `vercel.json.example` file contains Vercel rewrites for this SPA. After the backend Vercel project has a URL, copy this file to `vercel.json` and replace `YOUR-VERCEL-API` with the backend hostname (without a trailing slash). The rewrites send `/api/*`, profile-photo requests, and `/storage/*` to Laravel; React Router routes fall back to `index.html`. The backend currently stores uploads in temporary Vercel storage, so uploaded photos can disappear when an instance is recycled.

Import this repository as a Vite project in Vercel. Use `npm run build` as the build command and `dist` as the output directory. The app already uses same-origin `/api` requests, so it does not need a `VITE_API_BASE_URL` variable in production.


The Vercel Function request body limit is 4.5 MB total. The task submission form sends two photos together, so keep each image around 2 MB or less. Larger uploads need direct object-storage uploads.
