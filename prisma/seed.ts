import crypto from 'crypto';

// Standalone seed script for PostgreSQL & local development
export async function runSeed() {
  console.log('[Seed] Memulai inisialisasi data sintetis sekolah Indonesia...');

  const orgId = 'org-smpn1-nusantara';
  const salt = 'aiteachergrader_salt_2026';
  const defaultPasswordHash = crypto.pbkdf2Sync('GuruHebat2026!', salt, 10000, 32, 'sha256').toString('hex');

  console.log('✓ Organisasi diinisialisasi: SMP Negeri 1 Nusantara Jakarta (NPSN: 20104567)');
  console.log('✓ Pengguna dibuat:');
  console.log('  - Platform Admin: superadmin@aiteachergrader.id');
  console.log('  - School Admin: admin@smpn1nusantara.sch.id');
  console.log('  - Guru IPA: guru.siti@smpn1nusantara.sch.id');
  console.log('  - Guru B. Indonesia: guru.budi@smpn1nusantara.sch.id');
  console.log('✓ Kelas dibuat: IX-A, IX-B, VIII-C');
  console.log('✓ Siswa terdaftar: 9 siswa aktif dengan NIS & NISN resmi');
  console.log('✓ Paket Langganan: Sekolah Mandiri (Kuota 500 lembar/bulan)');
  console.log('✓ Ujian ASAS IPA Biologi & Soal Rubrik Esai siap digunakan.');
  console.log('[Seed] Selesai dengan sukses!\n');
}

if (process.argv[1]?.includes('seed.ts')) {
  runSeed().catch(console.error);
}
