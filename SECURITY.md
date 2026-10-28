# Kebijakan Keamanan (Security Policy)

## Tanggung Jawab Keamanan & Privasi Data Pendidikan

AI Teacher Grader mematuhi prinsip kehati-hatian privasi data pendidikan dan Undang-Undang Perlindungan Data Pribadi (UU PDP):

1. **Pemisahan Identitas Siswa**: Identitas nama asli dan nomor induk siswa (NIS/NISN) tidak dikirimkan secara langsung ke penyedia model bahasa AI. Hanya konten teks jawaban, pertanyaan, dan rubrik guru yang diproses.
2. **Kunci Rahasia (Secrets)**: `GEMINI_API_KEY` dan `AUTH_SECRET` dikelola di sisi server melalui variabel lingkungan runtime dan tidak pernah terekspos ke bundel peramban (client).
3. **Penyimpanan Berkas LJK**: Berkas pindaian disimpan secara terenkripsi menggunakan UUID opaque identifier untuk mencegah enumerasi nama berkas asli.
4. **Validasi Citra Ketat**: Seluruh berkas yang diunggah divalidasi tanda tangan biner (magic bytes), batasan resolusi, dan batas ukuran maksimal (15MB).
5. **Jejak Audit Kekal (Immutable Audit Log)**: Setiap perubahan nilai manual oleh guru, penerbitan ujian, atau penghapusan data direkam dengan cap waktu dan identitas akun peninjau.

## Pelaporan Kerentanan

Jika Anda menemukan potensi celah keamanan:
1. Hubungi tim keamanan melalui email: `security@aiteachergrader.id`
2. Mohon sertakan detail langkah reproduksi kerentanan secara bertanggung jawab (Responsible Disclosure).
3. Tim teknis akan memberikan respon awal dalam waktu 2x24 jam.
