# Panduan Kontribusi (Contributing Guide)

Terima kasih atas ketertarikan Anda untuk berkontribusi pada pengembangan **AI Teacher Grader**!

## Alur Kerja Pengembangan

1. Fork repositori ini ke akun GitHub Anda.
2. Buat branch fitur baru:
   ```bash
   git checkout -b fitur/nama-fitur-baru
   ```
3. Lakukan instalasi dependensi:
   ```bash
   npm install
   ```
4. Jalankan pengujian otomatis untuk memastikan tidak ada regresi:
   ```bash
   npm test
   ```
5. Pastikan pemeriksaan tipe TypeScript lulus:
   ```bash
   npm run lint
   ```
6. Buat commit dengan pesan yang jelas dan deskriptif.
7. Buka Pull Request ke branch `main`.

## Standar Kode

- Gunakan TypeScript dengan tipe ketat (strict typing).
- Antarmuka pengguna untuk sekolah Indonesia wajib menggunakan Bahasa Indonesia baku yang santun dan profesional.
- Seluruh endpoint dan kueri data tenant wajib menyertakan filter organisasi (`orgId`) untuk menjaga isolasi data multi-sekolah.
