import crypto from 'crypto';
import {
  AuditLogModel,
  ClassModel,
  ExamModel,
  GradingJobModel,
  OrganizationModel,
  QuestionModel,
  StudentModel,
  SubmissionModel,
  UserRole,
} from '../../types/index.ts';

export interface UserRecord {
  id: string;
  orgId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  nip?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export class SchoolRepository {
  private organizations: Map<string, OrganizationModel> = new Map();
  private users: Map<string, UserRecord> = new Map();
  private classes: Map<string, ClassModel> = new Map();
  private students: Map<string, StudentModel> = new Map();
  private exams: Map<string, ExamModel> = new Map();
  private questions: Map<string, QuestionModel> = new Map();
  private submissions: Map<string, SubmissionModel> = new Map();
  private gradingJobs: Map<string, GradingJobModel> = new Map();
  private examVersions: Map<string, any> = new Map();
  private auditLogs: AuditLogModel[] = [];

  constructor() {
    this.seedInitialData();
  }

  // Password hashing utility using PBKDF2
  public hashPassword(password: string): string {
    const salt = 'aiteachergrader_salt_2026';
    return crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex');
  }

  public verifyPassword(password: string, hash: string): boolean {
    const computed = Buffer.from(this.hashPassword(password));
    const target = Buffer.from(hash);
    if (computed.length !== target.length) return false;
    return crypto.timingSafeEqual(computed, target);
  }

  // Seeding realistic Indonesian educational dataset
  private seedInitialData() {
    const orgId = 'org-smpn1-nusantara';
    const org2Id = 'org-smamerdeka5';

    // Organizations
    this.organizations.set(orgId, {
      id: orgId,
      name: 'SMP Negeri 1 Nusantara Jakarta',
      npsn: '20104567',
      address: 'Jl. Pendidikan No. 45, Kebayoran Baru',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12130',
      phone: '021-7201982',
      planType: 'SEKOLAH_MANDIRI',
      quotaLimit: 500,
      quotaUsed: 78,
      createdAt: '2026-01-10T08:00:00Z',
    });

    this.organizations.set(org2Id, {
      id: org2Id,
      name: 'SMA Merdeka 5 Jakarta',
      npsn: '20108921',
      address: 'Jl. Pemuda Merdeka No. 12',
      city: 'Jakarta Timur',
      province: 'DKI Jakarta',
      postalCode: '13220',
      phone: '021-4892011',
      planType: 'TERPADU_DINAS',
      quotaLimit: 2500,
      quotaUsed: 342,
      createdAt: '2026-01-12T08:00:00Z',
    });

    // Users
    const passHash = this.hashPassword('GuruHebat2026!');

    // Platform Superadmin
    this.users.set('user-superadmin', {
      id: 'user-superadmin',
      orgId,
      email: 'superadmin@aiteachergrader.id',
      passwordHash: passHash,
      fullName: 'Dr. Hendra Wijaya, M.Kom',
      role: 'PLATFORM_ADMIN',
      avatarUrl: '/src/assets/images/avatar_teacher_male_1793153724340.jpg',
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    });

    // School Admin
    this.users.set('user-schooladmin', {
      id: 'user-schooladmin',
      orgId,
      email: 'admin@smpn1nusantara.sch.id',
      passwordHash: passHash,
      fullName: 'Dra. Endang Sulistyowati (Waka Kurikulum)',
      role: 'SCHOOL_ADMIN',
      nip: '197508122001122001',
      avatarUrl: '/src/assets/images/avatar_teacher_female_1793153723050.jpg',
      isActive: true,
      createdAt: '2026-01-10T08:00:00Z',
    });

    // Teachers
    this.users.set('user-teacher-siti', {
      id: 'user-teacher-siti',
      orgId,
      email: 'guru.siti@smpn1nusantara.sch.id',
      passwordHash: passHash,
      fullName: 'Siti Rahmawati, M.Pd.',
      role: 'TEACHER',
      nip: '198403152008012004',
      avatarUrl: '/src/assets/images/avatar_teacher_female_1793153723050.jpg',
      isActive: true,
      createdAt: '2026-01-15T08:00:00Z',
    });

    this.users.set('user-teacher-budi', {
      id: 'user-teacher-budi',
      orgId,
      email: 'guru.budi@smpn1nusantara.sch.id',
      passwordHash: passHash,
      fullName: 'Budi Prasetyo, S.Pd.',
      role: 'TEACHER',
      nip: '198711202011011003',
      avatarUrl: '/src/assets/images/avatar_teacher_male_1793153724340.jpg',
      isActive: true,
      createdAt: '2026-01-15T08:00:00Z',
    });

    // Classes
    const class9A = 'class-9a';
    const class9B = 'class-9b';
    const class8C = 'class-8c';

    this.classes.set(class9A, {
      id: class9A,
      orgId,
      name: 'Kelas IX-A',
      gradeLevel: 'Kelas 9',
      academicYear: '2026/2027',
      teacherId: 'user-teacher-siti',
      teacherName: 'Siti Rahmawati, M.Pd.',
      studentCount: 32,
    });

    this.classes.set(class9B, {
      id: class9B,
      orgId,
      name: 'Kelas IX-B',
      gradeLevel: 'Kelas 9',
      academicYear: '2026/2027',
      teacherId: 'user-teacher-budi',
      teacherName: 'Budi Prasetyo, S.Pd.',
      studentCount: 30,
    });

    this.classes.set(class8C, {
      id: class8C,
      orgId,
      name: 'Kelas VIII-C',
      gradeLevel: 'Kelas 8',
      academicYear: '2026/2027',
      teacherId: 'user-teacher-siti',
      teacherName: 'Siti Rahmawati, M.Pd.',
      studentCount: 31,
    });

    // Students
    const sampleStudents = [
      { id: 'std-001', nisn: '0089201921', nis: '240901', name: 'Dian Pertiwi', gender: 'P' as const, classId: class9A },
      { id: 'std-002', nisn: '0089201922', nis: '240902', name: 'Ahmad Fauzi Rahman', gender: 'L' as const, classId: class9A },
      { id: 'std-003', nisn: '0089201923', nis: '240903', name: 'Rizky Pratama Wijaya', gender: 'L' as const, classId: class9A },
      { id: 'std-004', nisn: '0089201924', nis: '240904', name: 'Siti Nurhaliza', gender: 'P' as const, classId: class9A },
      { id: 'std-005', nisn: '0089201925', nis: '240905', name: 'Bintang Pamungkas', gender: 'L' as const, classId: class9A },
      { id: 'std-006', nisn: '0089201926', nis: '240906', name: 'Nabila Putri Cahyani', gender: 'P' as const, classId: class9A },
      { id: 'std-007', nisn: '0089201927', nis: '240907', name: 'Farhan Dwi Nugroho', gender: 'L' as const, classId: class9A },
      { id: 'std-008', nisn: '0089201928', nis: '240908', name: 'Dewi Lestari', gender: 'P' as const, classId: class9B },
      { id: 'std-009', nisn: '0089201929', nis: '240909', name: 'Muhammad Aditya', gender: 'L' as const, classId: class9B },
    ];

    sampleStudents.forEach(s => {
      this.students.set(s.id, {
        id: s.id,
        orgId,
        classId: s.classId,
        className: this.classes.get(s.classId)?.name,
        nisn: s.nisn,
        nis: s.nis,
        fullName: s.name,
        gender: s.gender,
        isActive: true,
      });
    });

    // Exams
    const examBioId = 'exam-bio-asas-9';
    this.exams.set(examBioId, {
      id: examBioId,
      orgId,
      createdById: 'user-teacher-siti',
      creatorName: 'Siti Rahmawati, M.Pd.',
      title: 'Asesmen Sumatif Akhir Semester (ASAS) IPA Biologi',
      subject: 'Ilmu Pengetahuan Alam (IPA)',
      gradeLevel: 'Kelas 9 SMP',
      academicYear: '2026/2027',
      semester: 'Ganjil',
      examDate: '2026-10-20',
      durationMinutes: 90,
      maxScore: 100,
      passingScore: 75,
      status: 'PUBLISHED',
      currentVersion: 1,
      description: 'Cakupan materi: Sistem Perkembangbiakan Hewan dan Tumbuhan, Pewarisan Sifat, dan Bioteknologi Konvensional.',
      assignedClassIds: [class9A, class9B],
      assignedClassNames: ['Kelas IX-A', 'Kelas IX-B'],
      totalQuestions: 5,
      totalSubmissions: 6,
      averageScore: 84.5,
      createdAt: '2026-10-15T09:00:00Z',
      updatedAt: '2026-10-18T14:30:00Z',
    });

    // Questions for Exam 1
    const questionsList: QuestionModel[] = [
      {
        id: 'q-bio-01',
        examId: examBioId,
        questionNumber: 1,
        type: 'MULTIPLE_CHOICE',
        text: 'Bagian bunga yang berfungsi sebagai alat kelamin jantan adalah...',
        maxPoints: 10,
        options: [
          { key: 'A', text: 'Putik' },
          { key: 'B', text: 'Benang sari' },
          { key: 'C', text: 'Mahkota bunga' },
          { key: 'D', text: 'Kelopak bunga' },
        ],
        correctOption: 'B',
        explanation: 'Benang sari (stamen) menghasilkan serbuk sari yang merupakan sel kelamin jantan pada tumbuhan berbunga.',
        learningObjective: 'Mengidentifikasi organ reproduksi generatif pada tumbuhan angiospermae',
      },
      {
        id: 'q-bio-02',
        examId: examBioId,
        questionNumber: 2,
        type: 'MULTIPLE_CHOICE',
        text: 'Molekul pembawa informasi genetik yang diwariskan dari induk kepada keturunannya disebut...',
        maxPoints: 10,
        options: [
          { key: 'A', text: 'Enzim' },
          { key: 'B', text: 'Hormon' },
          { key: 'C', text: 'DNA (Asam Deoksiribonukleat)' },
          { key: 'D', text: 'Klorofil' },
        ],
        correctOption: 'C',
        explanation: 'DNA (Deoxyribonucleic Acid) membawa instruksi genetik yang menyusun sifat bawaan setiap organisme.',
        learningObjective: 'Menjelaskan materi genetik sebagai pembawa sifat',
      },
      {
        id: 'q-bio-03',
        examId: examBioId,
        questionNumber: 3,
        type: 'MULTIPLE_CHOICE',
        text: 'Mikroorganisme yang dimanfaatkan dalam pembuatan tempe adalah...',
        maxPoints: 10,
        options: [
          { key: 'A', text: 'Rhizopus oryzae' },
          { key: 'B', text: 'Saccharomyces cerevisiae' },
          { key: 'C', text: 'Lactobacillus bulgaricus' },
          { key: 'D', text: 'Acetobacter xylinum' },
        ],
        correctOption: 'A',
        explanation: 'Rhizopus oryzae membentuk hifa putih yang mengikat kedelai menjadi produk fermentasi tempe.',
        learningObjective: 'Menerapkan konsep bioteknologi konvensional dalam kehidupan sehari-hari',
      },
      {
        id: 'q-bio-04',
        examId: examBioId,
        questionNumber: 4,
        type: 'ESSAY',
        text: 'Jelaskan tahapan proses fotosintesis pada tumbuhan serta tuliskan zat-zat yang dibutuhkan dan dihasilkan!',
        maxPoints: 35,
        explanation: 'Fotosintesis membutuhkan air (H2O), karbondioksida (CO2), dan energi cahaya yang diserap klorofil, menghasilkan glukosa (C6H12O6) dan oksigen (O2). Terdiri atas reaksi terang (tilakoid) dan reaksi gelap / siklus Calvin (stroma).',
        learningObjective: 'Menganalisis proses biokimia fotosintesis pada tumbuhan hijau',
        rubricCriteria: [
          {
            id: 'rub-01',
            name: 'Ketepatan Reaktan & Produk',
            maxPoints: 15,
            description: 'Menyebutkan zat yang dibutuhkan (H2O, CO2, cahaya, klorofil) dan zat yang dihasilkan (glukosa, O2).',
          },
          {
            id: 'rub-02',
            name: 'Pemahaman Tahapan (Reaksi Terang & Gelap)',
            maxPoints: 10,
            description: 'Menjelaskan tempat terjadinya dan peran reaksi terang dan gelap.',
          },
          {
            id: 'rub-03',
            name: 'Sistematika & Kejelasan Bahasa',
            maxPoints: 10,
            description: 'Uraian runtut, logis, dan menggunakan istilah sains yang tepat.',
          },
        ],
      },
      {
        id: 'q-bio-05',
        examId: examBioId,
        questionNumber: 5,
        type: 'ESSAY',
        text: 'Mengapa bioteknologi konvensional seperti fermentasi tape dan yoghurt masih sangat relevan di era modern? Berikan 2 alasan ilmiah!',
        maxPoints: 35,
        explanation: 'Relevan karena bernutrisi tinggi, meningkatkan daya simpan makanan, mudah diakses masyarakat, biaya terjangkau, dan aman dikonsumsi.',
        learningObjective: 'Mengevaluasi peran bioteknologi pangan dalam ketahanan pangan',
        rubricCriteria: [
          {
            id: 'rub-04',
            name: 'Dua Alasan Ilmiah yang Logis',
            maxPoints: 20,
            description: 'Menyampaikan 2 argumen valid (misal: probiotik menyehatkan cerna, pengawetan alami, nilai gizi lebih tinggi).',
          },
          {
            id: 'rub-05',
            name: 'Contoh Kontekstual & Kesimpulan',
            maxPoints: 15,
            description: 'Menyertakan contoh produk nyata dan relevansinya di masyarakat.',
          },
        ],
      },
    ];

    questionsList.forEach(q => this.questions.set(q.id, q));

    // Seed sample submissions
    const sub1Id = 'sub-dian-01';
    this.submissions.set(sub1Id, {
      id: sub1Id,
      orgId,
      examId: examBioId,
      examTitle: 'Asesmen Sumatif Akhir Semester (ASAS) IPA Biologi',
      examSubject: 'Ilmu Pengetahuan Alam (IPA)',
      examVersionNumber: 1,
      studentId: 'std-001',
      studentName: 'Dian Pertiwi',
      studentNis: '240901',
      className: 'Kelas IX-A',
      status: 'COMPLETED',
      finalScore: 92,
      maxScore: 100,
      percentageScore: 92,
      isPassed: true,
      multipleChoiceStats: { correct: 3, wrong: 0, unanswered: 0, total: 3 },
      reviewedById: 'user-teacher-siti',
      reviewerName: 'Siti Rahmawati, M.Pd.',
      reviewedAt: '2026-10-21T10:15:00Z',
      files: [
        {
          id: 'file-001',
          submissionId: sub1Id,
          fileKey: 'storage-bio-dian-p1',
          originalName: 'LJK_DianPertiwi_Halaman1.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1845200,
          width: 1600,
          height: 2200,
          sha256Hash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
          pageNumber: 1,
          storageUrl: '/src/assets/images/sample_answer_sheet_1793153724076.jpg',
          qualityScore: 0.98,
          qualityFlags: [],
        },
      ],
      answers: [
        {
          id: 'ans-001',
          submissionId: sub1Id,
          questionId: 'q-bio-01',
          questionNumber: 1,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Bagian bunga yang berfungsi sebagai alat kelamin jantan adalah...',
          studentAnswerRaw: 'B',
          recognizedAnswer: 'B',
          isCorrect: true,
          score: 10,
          maxScore: 10,
          explanation: 'Tepat sesuai kunci jawaban.',
          confidence: 0.99,
          reviewRequired: false,
        },
        {
          id: 'ans-002',
          submissionId: sub1Id,
          questionId: 'q-bio-02',
          questionNumber: 2,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Molekul pembawa informasi genetik yang diwariskan dari induk kepada keturunannya disebut...',
          studentAnswerRaw: 'C',
          recognizedAnswer: 'C',
          isCorrect: true,
          score: 10,
          maxScore: 10,
          explanation: 'Tepat sesuai kunci jawaban.',
          confidence: 0.99,
          reviewRequired: false,
        },
        {
          id: 'ans-003',
          submissionId: sub1Id,
          questionId: 'q-bio-03',
          questionNumber: 3,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Mikroorganisme yang dimanfaatkan dalam pembuatan tempe adalah...',
          studentAnswerRaw: 'A',
          recognizedAnswer: 'A',
          isCorrect: true,
          score: 10,
          maxScore: 10,
          explanation: 'Tepat sesuai kunci jawaban.',
          confidence: 0.99,
          reviewRequired: false,
        },
        {
          id: 'ans-004',
          submissionId: sub1Id,
          questionId: 'q-bio-04',
          questionNumber: 4,
          questionType: 'ESSAY',
          questionText: 'Jelaskan tahapan proses fotosintesis pada tumbuhan serta tuliskan zat-zat yang dibutuhkan dan dihasilkan!',
          studentAnswerRaw: 'Fotosintesis adalah proses pembentukan zat makanan oleh tumbuhan hijau berklorofil dengan bantuan sinar matahari, air (H2O), dan CO2. Hasilnya adalah glukosa dan gas oksigen O2. Ada reaksi terang di grana dan reaksi gelap di stroma.',
          recognizedAnswer: 'Fotosintesis adalah proses pembentukan zat makanan oleh tumbuhan hijau berklorofil dengan bantuan sinar matahari, air (H2O), dan CO2. Hasilnya adalah glukosa dan gas oksigen O2. Ada reaksi terang di grana dan reaksi gelap di stroma.',
          score: 32,
          maxScore: 35,
          criterionScores: [
            { criterionId: 'rub-01', criterionName: 'Ketepatan Reaktan & Produk', score: 15, maxScore: 15, evidence: 'siswa menulis "sinar matahari, air (H2O), dan CO2. Hasilnya adalah glukosa dan gas oksigen O2"', rationale: 'Reaktan dan produk disebutkan secara lengkap dan akurat.' },
            { criterionId: 'rub-02', criterionName: 'Pemahaman Tahapan (Reaksi Terang & Gelap)', score: 9, maxScore: 10, evidence: 'siswa menulis "reaksi terang di grana dan reaksi gelap di stroma"', rationale: 'Lokasi reaksi tepat, namun penjelasan alur reaksi dapat diperinci.' },
            { criterionId: 'rub-03', criterionName: 'Sistematika & Kejelasan Bahasa', score: 8, maxScore: 10, evidence: 'tata bahasa runtut dan ilmiah', rationale: 'Gaya penulisan jelas dan mudah dipahami.' },
          ],
          evidence: 'Siswa menulis rumus senyawa H2O, CO2, serta lokasi grana dan stroma dengan tepat.',
          explanation: 'Jawaban siswa menunjukkan penguasaan materi yang sangat baik.',
          correction: 'Penjelasan proses transfer elektron pada reaksi terang dapat ditambahkan untuk melengkapi.',
          suggestions: 'Pertahankan prestasi dan pelajari kaitan fotosintesis dengan laju respirasi seluler.',
          confidence: 0.94,
          reviewRequired: false,
        },
        {
          id: 'ans-005',
          submissionId: sub1Id,
          questionId: 'q-bio-05',
          questionNumber: 5,
          questionType: 'ESSAY',
          questionText: 'Mengapa bioteknologi konvensional seperti fermentasi tape dan yoghurt masih sangat relevan di era modern? Berikan 2 alasan ilmiah!',
          studentAnswerRaw: 'Alasan pertama karena fermentasi menghasilkan probiotik asam laktat yang menyehatkan usus. Alasan kedua karena proses fermentasi memecah zat kompleks menjadi sederhana sehingga nilai gizinya lebih mudah diserap tubuh serta memperpanjang daya simpan makanan.',
          recognizedAnswer: 'Alasan pertama karena fermentasi menghasilkan probiotik asam laktat yang menyehatkan usus. Alasan kedua karena proses fermentasi memecah zat kompleks menjadi sederhana sehingga nilai gizinya lebih mudah diserap tubuh serta memperpanjang daya simpan makanan.',
          score: 30,
          maxScore: 35,
          criterionScores: [
            { criterionId: 'rub-04', criterionName: 'Dua Alasan Ilmiah yang Logis', score: 18, maxScore: 20, evidence: 'probiotik asam laktat dan pemecahan zat kompleks bernutrisi', rationale: 'Kedua argumen ilmiah berbobot dan valid.' },
            { criterionId: 'rub-05', criterionName: 'Contoh Kontekstual & Kesimpulan', score: 12, maxScore: 15, evidence: 'menjelaskan daya simpan makanan', rationale: 'Contoh konkret relevan dengan kehidupan pangan Indonesia.' },
          ],
          evidence: 'Argumen probiotik dan absorpsi nutrisi dipaparkan secara rasional.',
          explanation: 'Siswa mampu menghubungkan teori mikrobiologi pangan dengan manfaat kesehatan nyata.',
          correction: 'Konsep sudah tepat sasaran.',
          suggestions: 'Bisa diberikan tugas proyek membuat yoghurt atau tempe sederhana di rumah.',
          confidence: 0.95,
          reviewRequired: false,
        },
      ],
      createdAt: '2026-10-21T09:30:00Z',
      updatedAt: '2026-10-21T10:15:00Z',
    });

    // Sub 2: In Needs Review state (for teacher review test)
    const sub2Id = 'sub-ahmad-02';
    this.submissions.set(sub2Id, {
      id: sub2Id,
      orgId,
      examId: examBioId,
      examTitle: 'Asesmen Sumatif Akhir Semester (ASAS) IPA Biologi',
      examSubject: 'Ilmu Pengetahuan Alam (IPA)',
      examVersionNumber: 1,
      studentId: 'std-002',
      studentName: 'Ahmad Fauzi Rahman',
      studentNis: '240902',
      className: 'Kelas IX-A',
      status: 'NEEDS_REVIEW',
      finalScore: 74,
      maxScore: 100,
      percentageScore: 74,
      isPassed: false,
      multipleChoiceStats: { correct: 2, wrong: 1, unanswered: 0, total: 3 },
      files: [
        {
          id: 'file-002',
          submissionId: sub2Id,
          fileKey: 'storage-bio-ahmad-p1',
          originalName: 'LJK_AhmadFauzi.jpg',
          mimeType: 'image/jpeg',
          sizeBytes: 1720000,
          width: 1500,
          height: 2100,
          sha256Hash: 'b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
          pageNumber: 1,
          storageUrl: '/src/assets/images/sample_answer_sheet_1793153724076.jpg',
          qualityScore: 0.85,
          qualityFlags: ['LOW_CONTRAST_PENCIL'],
        },
      ],
      answers: [
        {
          id: 'ans-101',
          submissionId: sub2Id,
          questionId: 'q-bio-01',
          questionNumber: 1,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Bagian bunga yang berfungsi sebagai alat kelamin jantan adalah...',
          studentAnswerRaw: 'B',
          recognizedAnswer: 'B',
          isCorrect: true,
          score: 10,
          maxScore: 10,
          confidence: 0.99,
          reviewRequired: false,
        },
        {
          id: 'ans-102',
          submissionId: sub2Id,
          questionId: 'q-bio-02',
          questionNumber: 2,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Molekul pembawa informasi genetik yang diwariskan dari induk kepada keturunannya disebut...',
          studentAnswerRaw: 'A',
          recognizedAnswer: 'A',
          isCorrect: false,
          score: 0,
          maxScore: 10,
          confidence: 0.98,
          reviewRequired: false,
          explanation: 'Siswa menjawab A (Enzim), kunci C (DNA).',
        },
        {
          id: 'ans-103',
          submissionId: sub2Id,
          questionId: 'q-bio-03',
          questionNumber: 3,
          questionType: 'MULTIPLE_CHOICE',
          questionText: 'Mikroorganisme yang dimanfaatkan dalam pembuatan tempe adalah...',
          studentAnswerRaw: 'A',
          recognizedAnswer: 'A',
          isCorrect: true,
          score: 10,
          maxScore: 10,
          confidence: 0.99,
          reviewRequired: false,
        },
        {
          id: 'ans-104',
          submissionId: sub2Id,
          questionId: 'q-bio-04',
          questionNumber: 4,
          questionType: 'ESSAY',
          questionText: 'Jelaskan tahapan proses fotosintesis pada tumbuhan serta tuliskan zat-zat yang dibutuhkan dan dihasilkan!',
          studentAnswerRaw: 'Fotosintesis butuh air dan sinar matahari menghasilkan oksigen. Tumbuhan hijau menyerap karbon.',
          recognizedAnswer: 'Fotosintesis butuh air dan sinar matahari menghasilkan oksigen. Tumbuhan hijau menyerap karbon.',
          score: 28,
          maxScore: 35,
          criterionScores: [
            { criterionId: 'rub-01', criterionName: 'Ketepatan Reaktan & Produk', score: 13, maxScore: 15, evidence: 'air dan sinar matahari menghasilkan oksigen', rationale: 'Sebagian besar reaktan disebutkan, tetapi glukosa belum dituliskan.' },
            { criterionId: 'rub-02', criterionName: 'Pemahaman Tahapan (Reaksi Terang & Gelap)', score: 7, maxScore: 10, evidence: 'tidak menguraikan tahapan terang dan gelap', rationale: 'Penjelasan tahapan terlewat.' },
            { criterionId: 'rub-03', criterionName: 'Sistematika & Kejelasan Bahasa', score: 8, maxScore: 10, evidence: 'kalimat singkat', rationale: 'Gaya ringkas namun dapat dipahami.' },
          ],
          confidence: 0.68,
          reviewRequired: true,
          explanation: 'Tulisan pensil agak tipis dan skor akhir berada di sekitar batas tuntas KKM (74 vs 75). Disarankan verifikasi manual guru.',
        },
        {
          id: 'ans-105',
          submissionId: sub2Id,
          questionId: 'q-bio-05',
          questionNumber: 5,
          questionType: 'ESSAY',
          questionText: 'Mengapa bioteknologi konvensional seperti fermentasi tape dan yoghurt masih sangat relevan di era modern? Berikan 2 alasan ilmiah!',
          studentAnswerRaw: 'Karena yoghurt enak dan menyehatkan pencernaan, dan tape gampang dibuat di desa.',
          recognizedAnswer: 'Karena yoghurt enak dan menyehatkan pencernaan, dan tape gampang dibuat di desa.',
          score: 26,
          maxScore: 35,
          confidence: 0.72,
          reviewRequired: true,
          explanation: 'Argumen siswa cukup praktis namun alasan ilmiah perlu dipertimbangkan guru pengajar.',
        },
      ],
      createdAt: '2026-10-21T11:00:00Z',
      updatedAt: '2026-10-21T11:05:00Z',
    });

    // Seed Grading Jobs
    this.gradingJobs.set('job-001', {
      id: 'job-001',
      orgId,
      submissionId: sub1Id,
      studentName: 'Dian Pertiwi',
      examTitle: 'Asesmen Sumatif Akhir Semester (ASAS) IPA Biologi',
      status: 'COMPLETED',
      progressPercentage: 100,
      currentStep: 'SELESAI (Koreksi Berhasil)',
      retryCount: 0,
      idempotencyKey: 'idem-sub-dian-01',
      createdAt: '2026-10-21T09:30:00Z',
      completedAt: '2026-10-21T09:31:12Z',
    });

    this.gradingJobs.set('job-002', {
      id: 'job-002',
      orgId,
      submissionId: sub2Id,
      studentName: 'Ahmad Fauzi Rahman',
      examTitle: 'Asesmen Sumatif Akhir Semester (ASAS) IPA Biologi',
      status: 'COMPLETED',
      progressPercentage: 100,
      currentStep: 'MENUNGGU TINJAUAN GURU (Ambang KKM)',
      retryCount: 0,
      idempotencyKey: 'idem-sub-ahmad-02',
      createdAt: '2026-10-21T11:00:00Z',
      completedAt: '2026-10-21T11:01:25Z',
    });

    // Audit logs
    this.auditLogs.push({
      id: 'audit-001',
      orgId,
      userId: 'user-teacher-siti',
      userEmail: 'guru.siti@smpn1nusantara.sch.id',
      action: 'EXAM_PUBLISHED',
      entityType: 'Exam',
      entityId: examBioId,
      details: { title: 'ASAS IPA Biologi Kelas 9' },
      timestamp: '2026-10-18T14:30:00Z',
    });
  }

  // Tenant-Scoped Queries & Methods

  public getOrganization(orgId: string): OrganizationModel | undefined {
    return this.organizations.get(orgId);
  }

  public getAllOrganizations(): OrganizationModel[] {
    return Array.from(this.organizations.values());
  }

  public getUserByEmail(email: string): UserRecord | undefined {
    return Array.from(this.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(userId: string): UserRecord | undefined {
    return this.users.get(userId);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord {
    const id = `user-${crypto.randomUUID().slice(0, 8)}`;
    const record: UserRecord = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, record);
    return record;
  }

  public createOrganization(data: { name: string; npsn?: string; planType?: any }): OrganizationModel {
    const id = `org-${crypto.randomUUID().slice(0, 8)}`;
    const org: OrganizationModel = {
      id,
      name: data.name,
      npsn: data.npsn,
      planType: data.planType || 'FREE_TRIAL',
      quotaLimit: 100,
      quotaUsed: 0,
      createdAt: new Date().toISOString(),
    };
    this.organizations.set(id, org);
    return org;
  }

  // Classes
  public getClasses(orgId: string): ClassModel[] {
    return Array.from(this.classes.values()).filter(c => c.orgId === orgId);
  }

  public getClassById(orgId: string, classId: string): ClassModel | undefined {
    const cls = this.classes.get(classId);
    if (!cls || cls.orgId !== orgId) return undefined;
    return cls;
  }

  public createClass(orgId: string, data: Omit<ClassModel, 'id' | 'orgId' | 'studentCount'>): ClassModel {
    const id = `class-${crypto.randomUUID().slice(0, 8)}`;
    const newClass: ClassModel = {
      ...data,
      id,
      orgId,
      studentCount: 0,
    };
    this.classes.set(id, newClass);
    return newClass;
  }

  // Students
  public getStudents(orgId: string, classId?: string, search?: string): StudentModel[] {
    let list = Array.from(this.students.values()).filter(s => s.orgId === orgId);
    if (classId) {
      list = list.filter(s => s.classId === classId);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.fullName.toLowerCase().includes(q) || s.nis.includes(q) || s.nisn.includes(q));
    }
    return list;
  }

  public createStudent(orgId: string, data: Omit<StudentModel, 'id' | 'orgId'>): StudentModel {
    const id = `std-${crypto.randomUUID().slice(0, 8)}`;
    const student: StudentModel = {
      ...data,
      id,
      orgId,
    };
    this.students.set(id, student);

    // Update class count
    const cls = this.classes.get(data.classId);
    if (cls) {
      cls.studentCount += 1;
    }
    return student;
  }

  // Exams
  public getExams(orgId: string): ExamModel[] {
    return Array.from(this.exams.values()).filter(e => e.orgId === orgId);
  }

  public getExamById(orgId: string, examId: string): ExamModel | undefined {
    const exam = this.exams.get(examId);
    if (!exam || exam.orgId !== orgId) return undefined;
    return exam;
  }

  public createExam(orgId: string, userId: string, data: Partial<ExamModel>): ExamModel {
    const id = `exam-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const user = this.users.get(userId);

    const exam: ExamModel = {
      id,
      orgId,
      createdById: userId,
      creatorName: user?.fullName || 'Guru Pengampu',
      title: data.title || 'Ujian Baru',
      subject: data.subject || 'Mata Pelajaran',
      gradeLevel: data.gradeLevel || 'Kelas 9',
      academicYear: data.academicYear || '2026/2027',
      semester: data.semester || 'Ganjil',
      examDate: data.examDate || now.split('T')[0],
      durationMinutes: data.durationMinutes || 90,
      maxScore: data.maxScore || 100,
      passingScore: data.passingScore || 75,
      status: data.status || 'DRAFT',
      currentVersion: 1,
      description: data.description,
      assignedClassIds: data.assignedClassIds || [],
      assignedClassNames: (data.assignedClassIds || []).map(cid => this.classes.get(cid)?.name || cid),
      totalQuestions: 0,
      totalSubmissions: 0,
      averageScore: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.exams.set(id, exam);
    return exam;
  }

  public updateExam(orgId: string, examId: string, updates: Partial<ExamModel>): ExamModel {
    const exam = this.getExamById(orgId, examId);
    if (!exam) throw new Error('Ujian tidak ditemukan atau hak akses ditolak.');
    const updated = {
      ...exam,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.exams.set(examId, updated);
    return updated;
  }

  // Questions
  public getQuestionsByExamId(orgId: string, examId: string): QuestionModel[] {
    const exam = this.getExamById(orgId, examId);
    if (!exam) return [];
    return Array.from(this.questions.values())
      .filter(q => q.examId === examId)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }

  public saveQuestionsForExam(orgId: string, examId: string, questionsList: QuestionModel[]): QuestionModel[] {
    const exam = this.getExamById(orgId, examId);
    if (!exam) throw new Error('Ujian tidak ditemukan.');

    // If submissions already exist for this exam, snapshot previous version and increment version
    const existingSubs = this.getSubmissions(orgId, examId);
    if (existingSubs.length > 0) {
      const currentQuestions = this.getQuestionsByExamId(orgId, examId);
      const versionId = `ver-${examId}-v${exam.currentVersion}`;
      this.examVersions.set(versionId, {
        id: versionId,
        examId,
        versionNumber: exam.currentVersion,
        snapshotData: currentQuestions,
        createdAt: new Date().toISOString(),
      });
      exam.currentVersion += 1;
    }

    // Remove existing
    Array.from(this.questions.entries()).forEach(([qid, q]) => {
      if (q.examId === examId) {
        this.questions.delete(qid);
      }
    });

    let totalPoints = 0;
    const saved: QuestionModel[] = questionsList.map((q, idx) => {
      const qid = q.id && !q.id.startsWith('temp-') ? q.id : `q-${crypto.randomUUID().slice(0, 8)}`;
      const model: QuestionModel = {
        ...q,
        id: qid,
        examId,
        questionNumber: idx + 1,
      };
      this.questions.set(qid, model);
      totalPoints += Number(model.maxPoints) || 0;
      return model;
    });

    // Update exam total questions & maxScore
    exam.totalQuestions = saved.length;
    exam.maxScore = totalPoints > 0 ? totalPoints : exam.maxScore;
    exam.updatedAt = new Date().toISOString();

    return saved;
  }

  public getExamVersions(orgId: string, examId: string): any[] {
    const exam = this.getExamById(orgId, examId);
    if (!exam) return [];
    return Array.from(this.examVersions.values()).filter(v => v.examId === examId);
  }

  // Teacher authorization check
  public canUserManageExam(user: { id: string; role: string; orgId: string }, examId: string): boolean {
    const exam = this.exams.get(examId);
    if (!exam || exam.orgId !== user.orgId) return false;

    // Platform and school admins can manage any exam in their org
    if (user.role === 'PLATFORM_ADMIN' || user.role === 'SCHOOL_ADMIN') return true;

    // Teacher can manage if they created it or teach an assigned class
    if (exam.createdById === user.id) return true;
    const teachesAssignedClass = (exam.assignedClassIds || []).some((cid) => {
      const cls = this.classes.get(cid);
      return cls && cls.teacherId === user.id;
    });

    return teachesAssignedClass;
  }

  // Submissions
  public getSubmissions(orgId: string, examId?: string, status?: string): SubmissionModel[] {
    let list = Array.from(this.submissions.values()).filter(s => s.orgId === orgId);
    if (examId) list = list.filter(s => s.examId === examId);
    if (status) list = list.filter(s => s.status === status);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSubmissionById(orgId: string, submissionId: string): SubmissionModel | undefined {
    const sub = this.submissions.get(submissionId);
    if (!sub || sub.orgId !== orgId) return undefined;
    return sub;
  }

  public createSubmission(submission: SubmissionModel): SubmissionModel {
    this.submissions.set(submission.id, submission);
    // Increment org quota used
    const org = this.organizations.get(submission.orgId);
    if (org) {
      org.quotaUsed += 1;
    }
    return submission;
  }

  public updateSubmission(orgId: string, submissionId: string, updates: Partial<SubmissionModel>): SubmissionModel {
    const sub = this.getSubmissionById(orgId, submissionId);
    if (!sub) throw new Error('Lembar jawaban tidak ditemukan.');
    const updated = {
      ...sub,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.submissions.set(submissionId, updated);
    return updated;
  }

  // Grading Jobs Queue
  public getGradingJobs(orgId: string): GradingJobModel[] {
    return Array.from(this.gradingJobs.values())
      .filter(j => j.orgId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getGradingJobById(orgId: string, jobId: string): GradingJobModel | undefined {
    const job = this.gradingJobs.get(jobId);
    if (!job || job.orgId !== orgId) return undefined;
    return job;
  }

  public createGradingJob(job: GradingJobModel): GradingJobModel {
    this.gradingJobs.set(job.id, job);
    return job;
  }

  public updateGradingJob(orgId: string, jobId: string, updates: Partial<GradingJobModel>): GradingJobModel {
    const job = this.getGradingJobById(orgId, jobId);
    if (!job) throw new Error('Job tidak ditemukan.');
    const updated = { ...job, ...updates };
    this.gradingJobs.set(jobId, updated);
    return updated;
  }

  // Audit Logs
  public addAuditLog(log: Omit<AuditLogModel, 'id' | 'timestamp'>) {
    const entry: AuditLogModel = {
      ...log,
      id: `audit-${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(orgId: string): AuditLogModel[] {
    return this.auditLogs.filter(a => a.orgId === orgId);
  }
}

export const db = new SchoolRepository();
