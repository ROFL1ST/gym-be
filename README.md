# Smart Gym - Backend API 🏋️‍♂️

Backend RESTful API untuk proyek **Smart Gym** (Lomba Kompress / Hackathon 2026).
Dibangun dengan Node.js, Express, TypeScript, Prisma ORM, dan PostgreSQL.

> **Tema Lomba**: *"Pemberdayaan Inovasi Melalui Kecerdasan Artifisial: Membangun Solusi Cerdas untuk Masa Depan"*

---

## 👥 Tim Pengembang
- **Backend (BE)**: Danen
- **Frontend (FE)**: Rafly
- **Artificial Intelligence (AI)**: Adam & Bima

---

## 🚀 Fitur Utama

1. **Autentikasi & Akun**: Register, Login dengan JWT Stateless Token, Hash password bcrypt.
2. **Profil Pengguna**: Manajemen data fisik (Gender, Usia, Berat, Tinggi) serta preferensi (Fitness Level: `easy`, `medium`, `intermediate`; Fitness Goal: `lose`, `gain`, `healthy`).
3. **Streak & Gamifikasi**: Pelacakan check-in aktivitas harian secara otomatis.
4. **Penjadwalan (Schedules) & Kalender**: Pengelolaan jadwal latihan harian/bulanan dengan dukungan penanda rekomendasi AI (`is_ai_generated`).
5. **Histori Latihan**: Pencatatan latihan selesai, terintegrasi langsung dengan pembaruan status jadwal dan pertambahan streak.
6. **Pola Makan (Meal Plans) & Nutrisi**: Target kalori harian (`breakfast`, `lunch`, `dinner`, `snack`), pencatatan item makanan custom ataupun dari database master dengan akumulasi makronutrien (Protein, Karbo, Lemak).
7. **Master Data Makanan**: Katalog makanan sehat gym dengan pencarian nama & filter kategori.
8. **Rekomendasi Cerdas AI**:
   - `POST /api/ai/recommend-workout`: Analisis level, goal, dan histori otot terakhir untuk merekomendasikan focus muscle dan variasi gerakan.
   - `POST /api/ai/recommend-meal`: Kalkulasi BMR & TDEE (Mifflin-St Jeor), penyesuaian kalori sesuai target (surplus/defisit), serta rekomendasi pembagian makro nutrisi.

---

## 📦 Menjalankan Proyek

### 1. Prasyarat
- Node.js v18+ (Disarankan v20+)
- PostgreSQL sudah berjalan di port `5432`

### 2. Setup Environment
Pastikan file `.env` sudah dikonfigurasi:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_gym_db?schema=public"
JWT_SECRET="smart_gym_super_secret_jwt_key_2026"
JWT_EXPIRES_IN="7d"
```

### 3. Migrasi & Seeder Database
```powershell
# Sinkronkan skema ke database PostgreSQL
npm run prisma:migrate

# Isi data awal master makanan bergizi
npm run prisma:seed
```

### 4. Menjalankan Server
```powershell
# Mode Development (Hot-Reload)
npm run dev

# Mode Production Build
npm run build
npm start
```
Server aktif di: `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

### 5. Membuka Database Visual (Prisma Studio)
```powershell
npm run prisma:studio
```
Buka browser di `http://localhost:5555` untuk melihat dan mengedit data tabel secara langsung.

---

## 📮 Dokumentasi Postman

Gunakan file [`postman_collection.json`](./postman_collection.json) untuk langsung menguji seluruh endpoint. Cukup import ke Postman, lakukan login sekali, dan token akan otomatis tersimpan untuk seluruh request berikutnya!
