# CampusEvent — Sistem Pendaftaran Event Kampus Berbasis Web

CampusEvent adalah platform web full-stack modern yang dibangun untuk memfasilitasi mahasiswa dalam menemukan kegiatan kampus, mendaftar event, mendapatkan e-tiket digital ber-QR Code, serta memudahkan administrator kampus dalam mengelola seluruh kegiatan, memindai check-in kehadiran secara instan, dan mengekspor laporan komprehensif ke format CSV.

---

## 🚀 Fitur Utama

### 1. Peran Mahasiswa
- **Autentikasi & Akun**: Pendaftaran akun mahasiswa menggunakan nama lengkap, NIM unik, program studi, fakultas, dan email.
- **Jelajahi Event**: Katalog interaktif dengan pencarian cepat nama event, filter kategori, status event, serta pengurutan tanggal.
- **Detail Event & Kontrol Kuota**: Informasi lengkap event, countdown batas pendaftaran, sisa kuota, dan validasi atomik (mencegah pendaftaran ganda dan kelebihan kuota).
- **Tiket Digital QR Code**: E-tiket resmi ber-token unik acak dengan visual QR Code beresolusi tinggi, siap ditunjukkan saat check-in atau dicetak langsung (`window.print`).
- **Dashboard Mahasiswa**: Ringkasan event yang diikuti, status kehadiran, daftar e-tiket aktif, serta manajemen data profil pribadi.

### 2. Peran Admin
- **Dashboard & Analitik Visual**: Kartu statistik utama (Total Event, Event Aktif, Mahasiswa, Pendaftaran, Hadir, Rasio Kehadiran) dan grafik interaktif (Recharts) perbandingan kuota vs kehadiran per event serta distribusi kategori.
- **CRUD Event Lengkap**: Tambah, edit, ubah status (Aktif, Pendaftaran Ditutup, Berlangsung, Selesai, Dibatalkan), atur kuota, jadwal, lokasi, banner, dan kelola peserta per event.
- **CRUD Kategori**: Manajemen klasifikasi kategori kegiatan kampus (Seminar, Workshop, Pelatihan, Kompetisi, dll) dengan proteksi integritas data.
- **Data Mahasiswa & Riwayat**: Monitoring seluruh akun mahasiswa terdaftar beserta riwayat keikutsertaan event.
- **Pendaftaran & Tiket**: Monitoring seluruh token tiket peserta di semua event beserta status check-in.
- **Pemindai QR Code Check-In**: Pemindaian otomatis menggunakan kamera perangkat (webcam/smartphone) via library `html5-qrcode` serta opsi alternatif input kode tiket manual jika kamera terkendala.
- **Laporan & Ekspor CSV**: Tabel rekapitulasi kehadiran per event dan ekspor instan ke format `.csv` dengan sekali klik.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Ikonografi**: Lucide React
- **QR Code Engine**: `qrcode` (generator SVG/Canvas) & `html5-qrcode` (kamera pemindai)
- **Visualisasi Data**: Recharts
- **Database & Autentikasi**: Supabase PostgreSQL & Row Level Security (RLS)
- **Deployment Platform**: Vercel

---

## 📁 Struktur Direktori

```
├── public/
│   └── assets/                  # Aset publik
├── src/
│   ├── assets/images/           # Gambar visual banner event
│   ├── components/
│   │   ├── admin/               # Modal Event, Kategori, QR Scanner, DB Settings
│   │   ├── auth/                # Modal Login & Registrasi Mahasiswa
│   │   ├── events/              # EventCard & EventDetailModal
│   │   ├── layout/              # Navbar & Footer
│   │   └── tickets/             # TicketModal dengan render QR & Print CSS
│   ├── lib/
│   │   └── supabase.ts          # Inisialisasi client Supabase & konfigurasi dinamis
│   ├── pages/
│   │   ├── AdminDashboard.tsx   # Panel pusat kontrol admin & analitik
│   │   ├── ExploreEventsPage.tsx# Halaman pencarian & filter event
│   │   ├── LandingPage.tsx      # Landing page utama publik
│   │   └── StudentDashboard.tsx # Portal dashboard & riwayat mahasiswa
│   ├── services/
│   │   └── db.ts                # Service layer database, seed, transaksi & check-in
│   ├── types/
│   │   └── database.ts          # Interface TypeScript skema data
│   ├── App.tsx                  # Root router & orchestrator
│   ├── index.css                # Konfigurasi Tailwind & print media styles
│   └── main.tsx                 # Entry point React
├── supabase/
│   ├── schema.sql               # Skema PostgreSQL lengkap, RLS, & stored procedure
│   └── seed.sql                 # Data awal kategori & petunjuk admin
├── .env.example                 # Contoh variabel lingkungan
├── vercel.json                  # Konfigurasi rewrite SPA & security headers untuk Vercel
└── package.json
```

---

## 💻 Cara Menjalankan Proyek Secara Lokal

1. **Clone atau buka direktori proyek**:
   ```bash
   cd campusevent
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui browser di `http://localhost:3000`.

---

## 🗄️ Persiapan Supabase & Database PostgreSQL

1. Buka [https://supabase.com](https://supabase.com) dan buat proyek baru (*New Project*).
2. Masuk ke menu **SQL Editor** pada dashboard proyek Supabase Anda.
3. Buka file `supabase/schema.sql` dari proyek ini, salin seluruh kodenya, tempel ke SQL Editor Supabase, lalu jalankan (*Run*). File ini akan membuat:
   - Tipe data enum (`user_role`, `event_status`, `registration_status`).
   - Tabel `profiles`, `categories`, `events`, `registrations`.
   - Index pencarian performa tinggi.
   - Aturan *Row Level Security* (RLS) untuk mahasiswa dan admin.
   - Stored procedure `check_in_ticket` dengan row-locking atomik.
4. Buka file `supabase/seed.sql`, tempel ke SQL Editor Supabase, dan jalankan (*Run*) untuk menginisialisasi kategori event awal.

### 🔑 Membuat Akun Admin Pertama
1. Di dashboard Supabase, buka menu **Authentication** > **Users** > klik **Add User** (Create User).
2. Masukkan email, misalnya: `admin@campusevent.ac.id` dan password yang aman.
3. Buka **SQL Editor** dan jalankan query berikut untuk menetapkan role admin:
   ```sql
   UPDATE public.profiles
   SET role = 'admin', full_name = 'Dr. Hendra Gunawan, S.Kom., M.T.'
   WHERE email = 'admin@campusevent.ac.id';
   ```

---

## ⚙️ Konfigurasi Environment Variables

Buat file `.env` di root direktori berdasarkan `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

*Catatan: Anda juga dapat menghubungkan atau menguji kredensial Supabase secara langsung melalui tombol "Status Database" di navbar aplikasi.*

---

## ☁️ Panduan Deployment ke Vercel

1. **Push source code ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: CampusEvent release version"
   git push origin main
   ```
2. **Buka Vercel**:
   - Login ke [https://vercel.com](https://vercel.com) menggunakan akun GitHub Anda.
   - Klik **Add New...** > **Project**.
   - Pilih repository **CampusEvent** yang baru Anda push.
3. **Konfigurasi Project**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables di Vercel**:
   - Tambahkan `VITE_SUPABASE_URL` dengan URL Supabase Anda.
   - Tambahkan `VITE_SUPABASE_ANON_KEY` dengan Anon Key Supabase Anda.
5. **Klik Deploy**:
   - Vercel akan menjalankan proses build. File `vercel.json` yang disertakan telah mengonfigurasi rewrite SPA agar seluruh URL route (misalnya `/events` atau refresh browser) tidak menghasilkan error 404.
6. **Konfigurasi Domain di Supabase**:
   - Di dashboard Supabase > **Authentication** > **URL Configuration**, tambahkan domain Vercel Anda (misal `https://campusevent.vercel.app`) ke dalam daftar *Redirect URLs*.

---

## 🧪 Akun Demo Pengujian Cepat

Pada halaman login, tersedia tombol **"Uji Coba Cepat"** untuk login langsung tanpa perlu mengetik:

- **Mahasiswa Demo**:
  - Email: `budi.santoso@student.campusevent.ac.id`
  - NIM: `2201082001`
- **Admin Demo**:
  - Email: `admin@campusevent.ac.id`
  - Akses: Kelola seluruh event, kategori, data mahasiswa, scan QR check-in, dan ekspor laporan CSV.
