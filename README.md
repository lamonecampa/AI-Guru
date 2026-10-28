# AI Teacher Grader 🇮🇩

Platform SaaS komersial untuk guru, sekolah, dan dinas pendidikan di Indonesia guna mengoreksi lembar jawaban siswa (pilihan ganda dan esai tulisan tangan) secara otomatis berbasis foto pindaian menggunakan kunci jawaban terverifikasi, rubrik berbasis Capaian Pembelajaran, dan integrasi Google Gemini API.

---

## 🌟 Fitur Utama

1. **Penilaian Pilihan Ganda Deterministik**:
   - Membandingkan arsiran pilihan ganda (A, B, C, D, E) terhadap kunci jawaban resmi di sisi server secara deterministik tanpa menyerahkan logika penilaian objektif pada AI.
   - Penanganan otomatis untuk lembar kosong (*unanswered*), arsiran ganda (*ambiguous*), dan penandaan verifikasi guru.

2. **Penilaian Esai Berbasis Rubrik & Multimodal Gemini AI**:
   - Mengekstrak tulisan tangan siswa menggunakan kapabilitas vision Gemini.
   - Menilai setiap butir esai berdasarkan kriteria rubrik yang ditetapkan guru (misal: Pemahaman Konsep, Sistematika, Bukti Ilmiah).
   - Menghasilkan bukti kutipan langsung dari tulisan siswa, penjelasan pedagogis, konsep korektif, dan rekomendasi remedial.
   - Output divalidasi ketat menggunakan skema Zod di sisi server.

3. **Verifikasi & Penyesuaian Nilai Manual oleh Guru**:
   - Guru memiliki kendali mutlak: dapat mengoreksi transkripsi teks, menyesuaikan skor, dan memberikan alasan profesional penyesuaian nilai.
   - Jejak audit (*audit trail*) kekal untuk akuntabilitas asesmen sekolah.

4. **Isolasi Data Multi-Tenant & Peran Pengguna (RBAC)**:
   - **Platform Administrator**: Pengelolaan seluruh institusi sekolah, kuota komersial, dan rekam jejak sistem.
   - **School Administrator (Kurikulum/Kepala Sekolah)**: Manajemen guru, rombel kelas, data siswa (NIS/NISN), dan pengaturan profil sekolah.
   - **Teacher (Guru Mata Pelajaran)**: Manajemen paket ujian, perumusan rubrik, pengunggahan foto LJK, dan tinjauan hasil koreksi.
   - Setiap kueri data dibatasi secara ketat oleh `orgId` untuk mencegah kebocoran data antar-sekolah.

5. **Prapemrosesan & Validasi Citra LJK**:
   - Validasi *magic bytes* (JPEG, PNG, WebP), batasan resolusi minimal (600x600 px), dan batas ukuran berkas (15MB).
   - Deteksi duplikasi pengunggahan menggunakan SHA-256 hash.
   - Fitur rotasi kanvas 90° langsung di peramban sebelum dikirim ke pipa pemrosesan.

6. **Analitika Butir Soal & Rekomendasi Pengayaan**:
   - Histogram distribusi rentang nilai siswa dan tingkat ketuntasan KKM.
   - Analisis tingkat kesukaran soal (Indeks P).
   - Identifikasi miskonsepsi umum siswa untuk rancangan materi remedial terarah.

7. **Laporan Resmi Berstandar KOP Surat Sekolah**:
   - Format cetak PDF ramah cetak lengkap dengan KOP Surat resmi dinas/sekolah dan kolom tanda tangan kepala sekolah.
   - Ekspor data nilai siswa ke format CSV dan lembar kerja Excel.

---

## 🛠️ Tumpukan Teknologi (Technology Stack)

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript runtime (`tsx`).
- **Database & ORM**: PostgreSQL, Prisma ORM (`prisma/schema.prisma`), skrip pembenihan data (`prisma/seed.ts`).
- **Validasi Data**: Zod untuk seluruh kontrak permintaan API dan keluaran terstruktur model AI.
- **AI Multimodal**: `@google/genai` TypeScript SDK (model `gemini-3.8-flash`) dieksekusi secara aman di sisi server.
- **Keamanan Otentikasi**: Hash sandi PBKDF2 dengan salt aman dan token sesi berbasis HMAC-SHA256.

---

## 🚀 Panduan Memulai Cepat (Local Setup)

### 1. Prasyarat Sistem
- Node.js versi 20 atau 22 LTS
- npm versi 10+
- (Opsional) Docker & Docker Compose untuk menjalankan database PostgreSQL lokal.

### 2. Pemasangan Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin berkas contoh:
```bash
cp .env.example .env
```
Isi konfigurasi berikut sesuai kebutuhan:
```env
# Port server aplikasi (default 3000)
PORT=3000

# Kunci API Google Gemini (disediakan otomatis pada lingkungan AI Studio Secrets)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-3.8-flash"

# Kunci rahasia token otentikasi
AUTH_SECRET="kuncirahasia_aiteachergrader_2026"

# URL Koneksi PostgreSQL (opsional untuk Docker lokal)
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/aiteachergrader_db?schema=public"
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 🧪 Rangkaian Pengujian Otomatis

Aplikasi dilengkapi dengan rangkaian pengujian komprehensif yang memvalidasi logika inti:
```bash
npm test
```
Kasus uji yang diverifikasi meliputi:
1. Skoring pilihan ganda deterministik (jawaban benar, salah, dan lembar kosong).
2. Penanganan arsiran ganda / ambigu yang memicu *human review*.
3. Validasi skema Zod keluaran esai AI.
4. Proteksi *out-of-range* (skor negatif atau melebihi bobot soal).
5. Isolasi multi-tenant antar-organisasi sekolah.
6. Validasi integritas berkas citra (*magic bytes* & deteksi korupsi berkas).
7. Penyesuaian nilai manual oleh guru wajib menyertakan alasan audit.

Untuk memeriksa konsistensi tipe TypeScript:
```bash
npm run lint
```

---

## 🎭 Mode Demonstrasi (Demo Mode)

Aplikasi telah dilengkapi data sintetis realistis kurikulum Indonesia sehingga dapat diuji langsung tanpa perlu API key berbayar:
- **Akun Guru IPA**: `guru.siti@smpn1nusantara.sch.id`
- **Akun Guru Bahasa Indonesia**: `guru.budi@smpn1nusantara.sch.id`
- **Akun Admin Kurikulum Sekolah**: `admin@smpn1nusantara.sch.id`
- **Akun Superadmin Platform**: `superadmin@aiteachergrader.id`
- **Kata Sandi Demo**: `GuruHebat2026!`

Tersedia bilah *Mode Uji Coba* di bagian atas layar untuk beralih peran dalam satu klik. Pada halaman *Pindai & Unggah LJK*, Anda dapat menekan tombol **Gunakan Contoh Lembar Jawaban Biologi (Demo)** untuk langsung menguji alur OCR dan koreksi tanpa memotret kertas fisik.

---

## 🐳 Menjalankan dengan Docker & Docker Compose

Jalankan database PostgreSQL dan aplikasi AI Teacher Grader sekaligus:
```bash
docker-compose up --build
```
Aplikasi akan tersedia di `http://localhost:3000`. Endpoint kesehatan: `http://localhost:3000/health`.

---

## 📤 Menghubungkan dan Mendorong ke GitHub

Untuk menyimpan kode ini ke repositori GitHub Anda:

```bash
# 1. Inisialisasi git jika belum ada
git init

# 2. Tambahkan seluruh berkas
git add .

# 3. Lakukan commit pertama
git commit -m "feat: inisialisasi lengkap AI Teacher Grader untuk sekolah Indonesia"

# 4. Buat branch utama
git branch -M main

# 5. Hubungkan ke repositori remote GitHub Anda
git remote add origin https://github.com/USERNAME_ANDA/ai-teacher-grader.git

# 6. Dorong ke GitHub
git push -u origin main
```

---

## 📜 Lisensi
Aplikasi ini dilisensikan di bawah lisensi [Apache 2.0](LICENSE).
