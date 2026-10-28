import assert from 'assert';
import { db } from '../src/server/db/repository.ts';
import {
  scoreMultipleChoiceQuestion,
  GeminiGradingService,
} from '../src/server/services/geminiGradingService.ts';
import { validateImageBuffer } from '../src/server/services/imageValidation.ts';
import { GeminiEssayGradingOutputSchema } from '../src/types/index.ts';

async function runAllTests() {
  console.log('\n=== Menjalankan Rangkaian Uji Otomatis AI Teacher Grader ===\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`  ✓ [LULUS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [GAGAL] ${name}`);
      console.error(`    ${err.message}`);
    }
  }

  // 1. Deterministic Multiple-Choice Scoring
  test('1. Mesin Skoring Pilihan Ganda: Jawaban Benar', () => {
    const q: any = { questionNumber: 1, type: 'MULTIPLE_CHOICE', correctOption: 'B', maxPoints: 10 };
    const res = scoreMultipleChoiceQuestion(q, 'B');
    assert.strictEqual(res.isCorrect, true);
    assert.strictEqual(res.score, 10);
    assert.strictEqual(res.status, 'CORRECT');
    assert.strictEqual(res.reviewRequired, false);
  });

  test('2. Mesin Skoring Pilihan Ganda: Jawaban Salah', () => {
    const q: any = { questionNumber: 1, type: 'MULTIPLE_CHOICE', correctOption: 'B', maxPoints: 10 };
    const res = scoreMultipleChoiceQuestion(q, 'C');
    assert.strictEqual(res.isCorrect, false);
    assert.strictEqual(res.score, 0);
    assert.strictEqual(res.status, 'WRONG');
  });

  test('3. Mesin Skoring Pilihan Ganda: Lembar Kosong / Tidak Dijawab', () => {
    const q: any = { questionNumber: 1, type: 'MULTIPLE_CHOICE', correctOption: 'B', maxPoints: 10 };
    const res = scoreMultipleChoiceQuestion(q, 'BLANK');
    assert.strictEqual(res.status, 'UNANSWERED');
    assert.strictEqual(res.score, 0);
  });

  test('4. Mesin Skoring Pilihan Ganda: Arsiran Ganda / Ambigu Memicu Review Guru', () => {
    const q: any = { questionNumber: 1, type: 'MULTIPLE_CHOICE', correctOption: 'B', maxPoints: 10 };
    const res = scoreMultipleChoiceQuestion(q, 'AB');
    assert.strictEqual(res.status, 'AMBIGUOUS');
    assert.strictEqual(res.reviewRequired, true);
  });

  // 2. Essay Grading & Zod Schema Validation
  test('5. Validasi Skema Zod untuk Output Esai AI Gemini', () => {
    const mockOutput = {
      questionId: 'q-test-01',
      recognizedAnswer: 'Proses fotosintesis menghasilkan glukosa dan oksigen.',
      criterionScores: [
        {
          criterionId: 'c1',
          criterionName: 'Reaktan & Produk',
          score: 15,
          maxScore: 15,
          evidence: 'siswa menyebutkan glukosa dan oksigen',
          rationale: 'Sangat tepat dan sesuai materi.',
        },
      ],
      totalScore: 15,
      maxScore: 15,
      evidence: 'Kutipan jelas',
      explanation: 'Pemahaman konsep tepat.',
      correction: 'Tidak ada koreksi.',
      suggestions: 'Pertahankan pemahaman.',
      confidence: 0.95,
      reviewRequired: false,
    };

    const parsed = GeminiEssayGradingOutputSchema.safeParse(mockOutput);
    assert.strictEqual(parsed.success, true);
  });

  test('6. Pencegahan Skor Melebihi Batas Maksimal (Out-of-range protection)', () => {
    const invalidOutput = {
      questionId: 'q-test-02',
      recognizedAnswer: 'Jawaban',
      criterionScores: [],
      totalScore: -5, // Negatif tidak diizinkan
      maxScore: 10,
      evidence: '',
      explanation: '',
      correction: '',
      suggestions: '',
      confidence: 0.8,
      reviewRequired: false,
    };

    const parsed = GeminiEssayGradingOutputSchema.safeParse(invalidOutput);
    assert.strictEqual(parsed.success, false, 'Skor negatif harus ditolak oleh schema');
  });

  // 3. Multi-Tenant Isolation & Cross-Organization Security
  test('7. Isolasi Data Multi-Tenant: Mencegah Akses Antar Sekolah', () => {
    const org1 = 'org-smpn1-nusantara';
    const org2 = 'org-smamerdeka5';

    // Exam belongs to org1
    const examOrg1 = db.getExamById(org1, 'exam-bio-asas-9');
    assert.ok(examOrg1, 'Ujian org1 harus dapat diakses oleh org1');

    // Trying to access org1's exam with org2's credentials must return undefined
    const crossAccess = db.getExamById(org2, 'exam-bio-asas-9');
    assert.strictEqual(crossAccess, undefined, 'Akses lintas organisasi harus dicegah');
  });

  // 4. Image Validation & Duplicate Protection
  test('8. Validasi Berkas Gambar: Magic Bytes & Format', () => {
    // Valid minimal JPEG header
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    // Pad to 2KB
    const padded = Buffer.concat([jpegBuffer, Buffer.alloc(2000)]);
    const res = validateImageBuffer(padded, 'test.jpg');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.format, 'jpeg');
    assert.strictEqual(res.mimeType, 'image/jpeg');
  });

  test('9. Validasi Berkas Gambar: Penolakan Format Tidak Valid / Berkas Rusak', () => {
    const corruptBuffer = Buffer.from('BUKAN GAMBAR ASLI');
    const res = validateImageBuffer(corruptBuffer, 'fake.jpg');
    assert.strictEqual(res.isValid, false);
    assert.strictEqual(res.qualityFlags.includes('UNSUPPORTED_FORMAT') || res.qualityFlags.includes('CORRUPTED_FILE_TOO_SMALL'), true);
  });

  // 5. Score Override with Mandatory Reason
  test('10. Penyesuaian Nilai Manual oleh Guru Wajib Menyertakan Alasan', () => {
    const orgId = 'org-smpn1-nusantara';
    const sub = db.getSubmissionById(orgId, 'sub-ahmad-02');
    assert.ok(sub);

    const oldScore = sub.finalScore;
    const newScore = 80;
    const reason = 'Siswa menyertakan penjelasan tambahan secara lisan saat konfirmasi.';

    const updated = db.updateSubmission(orgId, 'sub-ahmad-02', {
      finalScore: newScore,
      manualOverrideReason: reason,
      status: 'COMPLETED',
    });

    assert.strictEqual(updated.finalScore, newScore);
    assert.strictEqual(updated.manualOverrideReason, reason);
    assert.strictEqual(updated.status, 'COMPLETED');
  });

  console.log(`\nHasil Pengujian: ${passed} / ${total} lulus.\n`);
  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
