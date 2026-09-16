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
