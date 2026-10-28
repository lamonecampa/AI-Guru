import express, { Response } from 'express';
import crypto from 'crypto';
import { db } from './db/repository.ts';
import { generateToken, requireAuth, requireRole, AuthenticatedRequest } from './auth.ts';
import { validateImageBuffer } from './services/imageValidation.ts';
import {
  GeminiGradingService,
  scoreMultipleChoiceQuestion,
} from './services/geminiGradingService.ts';
import {
  ExamCreateSchema,
  LoginSchema,
  RegisterSchema,
  ScoreOverrideSchema,
  SubmissionModel,
  GradingJobModel,
} from '../types/index.ts';

export const apiRouter = express.Router();
const geminiService = new GeminiGradingService();

// Health Check Endpoint
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AI Teacher Grader API',
    geminiConfigured: geminiService.isLiveApiConfigured(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Auth Endpoints
apiRouter.post('/auth/login', (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
  }

  const { email, password } = parse.data;
  const user = db.getUserByEmail(email);

  if (!user || !db.verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({
      success: false,
      error: 'Email atau kata sandi tidak sesuai.',
    });
  }

  const org = db.getOrganization(user.orgId);
  const session = {
    id: user.id,
    orgId: user.orgId,
    orgName: org?.name || 'Sekolah',
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    nip: user.nip,
    avatarUrl: user.avatarUrl,
  };

  const token = generateToken(session);
  return res.json({ success: true, token, user: session });
});

apiRouter.post('/auth/register', (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
  }

  const { email, password, fullName, organizationName, npsn } = parse.data;

  if (db.getUserByEmail(email)) {
    return res.status(409).json({ success: false, error: 'Email sudah terdaftar dalam sistem.' });
  }

  const org = db.createOrganization({ name: organizationName, npsn });
  const user = db.createUser({
    orgId: org.id,
    email,
    passwordHash: db.hashPassword(password),
    fullName,
    role: 'SCHOOL_ADMIN',
    isActive: true,
  });

  const session = {
    id: user.id,
    orgId: org.id,
    orgName: org.name,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };

  const token = generateToken(session);
  return res.status(201).json({ success: true, token, user: session });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ success: true, user: req.user });
});

// Quick switch between pre-seeded demo roles
apiRouter.post('/auth/demo-switch', (req, res) => {
  const { role } = req.body;
  let targetEmail = 'guru.siti@smpn1nusantara.sch.id';

  if (role === 'PLATFORM_ADMIN') {
    targetEmail = 'superadmin@aiteachergrader.id';
  } else if (role === 'SCHOOL_ADMIN') {
    targetEmail = 'admin@smpn1nusantara.sch.id';
  } else if (role === 'TEACHER_BUDI') {
    targetEmail = 'guru.budi@smpn1nusantara.sch.id';
  }

  const user = db.getUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ success: false, error: 'Akun demo tidak ditemukan.' });
  }

  const org = db.getOrganization(user.orgId);
  const session = {
    id: user.id,
    orgId: user.orgId,
    orgName: org?.name || 'Sekolah',
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    nip: user.nip,
    avatarUrl: user.avatarUrl,
  };

  const token = generateToken(session);
  return res.json({ success: true, token, user: session });
});

// Dashboard Statistics
apiRouter.get('/dashboard/stats', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.orgId;
  const org = db.getOrganization(orgId);
  const exams = db.getExams(orgId);
  const submissions = db.getSubmissions(orgId);
  const pendingReviews = submissions.filter(s => s.status === 'NEEDS_REVIEW').length;

  const completed = submissions.filter(s => s.status === 'COMPLETED');
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((acc, s) => acc + s.finalScore, 0) / completed.length * 10) / 10
    : 0;

  res.json({
    success: true,
    data: {
      totalExams: exams.length,
      totalSubmissions: submissions.length,
      pendingReviews,
      averageScore: avgScore,
      quotaUsed: org?.quotaUsed || 0,
      quotaLimit: org?.quotaLimit || 100,
      recentJobs: db.getGradingJobs(orgId).slice(0, 5),
      recentSubmissions: submissions.slice(0, 5),
    },
  });
});

// Classes Endpoints
apiRouter.get('/classes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const classes = db.getClasses(req.user!.orgId);
  res.json({ success: true, data: classes });
});

apiRouter.post('/classes', requireAuth, requireRole('PLATFORM_ADMIN', 'SCHOOL_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { name, gradeLevel, academicYear } = req.body;
  if (!name || !gradeLevel) {
    return res.status(400).json({ success: false, error: 'Nama kelas dan jenjang wajib diisi.' });
  }
  const newClass = db.createClass(req.user!.orgId, {
    name,
    gradeLevel,
    academicYear: academicYear || '2026/2027',
    teacherId: req.user!.id,
    teacherName: req.user!.fullName,
  });
  res.status(201).json({ success: true, data: newClass });
});

// Students Endpoints
apiRouter.get('/students', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { classId, search } = req.query;
  const students = db.getStudents(req.user!.orgId, classId as string, search as string);
  res.json({ success: true, data: students });
});

apiRouter.post('/students', requireAuth, requireRole('PLATFORM_ADMIN', 'SCHOOL_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { classId, nisn, nis, fullName, gender } = req.body;
  if (!classId || !nisn || !nis || !fullName) {
    return res.status(400).json({ success: false, error: 'Data siswa belum lengkap.' });
  }
  const student = db.createStudent(req.user!.orgId, {
    classId,
    nisn,
    nis,
    fullName,
    gender: gender === 'L' ? 'L' : 'P',
    isActive: true,
  });
  res.status(201).json({ success: true, data: student });
});

// Bulk CSV Import for Students
apiRouter.post('/students/import-csv', requireAuth, requireRole('PLATFORM_ADMIN', 'SCHOOL_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const { classId, csvContent } = req.body;
  if (!classId || !csvContent) {
    return res.status(400).json({ success: false, error: 'Kelas dan konten CSV wajib disertakan.' });
  }

  const lines = csvContent.trim().split('\n');
  const imported = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p: string) => p.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 3) {
      const [nisn, nis, fullName, gender] = parts;
      const student = db.createStudent(req.user!.orgId, {
        classId,
        nisn: nisn || `NISN-${Date.now()}-${i}`,
        nis: nis || `NIS-${i}`,
        fullName: fullName || `Siswa Baru ${i}`,
        gender: gender === 'L' ? 'L' : 'P',
        isActive: true,
      });
      imported.push(student);
    }
  }

  res.json({ success: true, count: imported.length, data: imported });
});

// Exams Endpoints
apiRouter.get('/exams', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const exams = db.getExams(req.user!.orgId);
  res.json({ success: true, data: exams });
});

apiRouter.post('/exams', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parse = ExamCreateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
  }

  const exam = db.createExam(req.user!.orgId, req.user!.id, parse.data);
  db.addAuditLog({
    orgId: req.user!.orgId,
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'EXAM_CREATED',
    entityType: 'Exam',
    entityId: exam.id,
    details: { title: exam.title, subject: exam.subject },
  });

  res.status(201).json({ success: true, data: exam });
});

apiRouter.get('/exams/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const exam = db.getExamById(req.user!.orgId, req.params.id);
  if (!exam) return res.status(404).json({ success: false, error: 'Ujian tidak ditemukan.' });
  const questions = db.getQuestionsByExamId(req.user!.orgId, req.params.id);
  res.json({ success: true, data: { ...exam, questions } });
});

apiRouter.patch('/exams/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateExam(req.user!.orgId, req.params.id, req.body);
    db.addAuditLog({
      orgId: req.user!.orgId,
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'EXAM_UPDATED',
      entityType: 'Exam',
      entityId: req.params.id,
      details: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/exams/:id/questions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const questions = db.getQuestionsByExamId(req.user!.orgId, req.params.id);
  res.json({ success: true, data: questions });
});

apiRouter.put('/exams/:id/questions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: 'Format butir soal tidak valid.' });
    }
    const saved = db.saveQuestionsForExam(req.user!.orgId, req.params.id, questions);
    db.addAuditLog({
      orgId: req.user!.orgId,
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'EXAM_QUESTIONS_SAVED',
      entityType: 'Exam',
      entityId: req.params.id,
      details: { count: saved.length },
    });
    res.json({ success: true, data: saved });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Answer Sheet Scanning & Grading Pipeline
apiRouter.post('/submissions/upload-and-grade', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { examId, studentId, imageBase64, filename, originalMimeType } = req.body;

    if (!examId || !studentId || !imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Ujian, siswa, dan gambar lembar jawaban wajib disertakan.',
      });
    }

    const orgId = req.user!.orgId;
    const org = db.getOrganization(orgId);

    // Quota check
    if (org && org.quotaUsed >= org.quotaLimit) {
      return res.status(403).json({
        success: false,
        error: 'Kuota koreksi bulanan sekolah Anda telah habis. Silakan tingkatkan paket di menu Tagihan.',
      });
    }

    const exam = db.getExamById(orgId, examId);
    if (!exam) return res.status(404).json({ success: false, error: 'Ujian tidak ditemukan.' });

    const student = db.getStudents(orgId).find(s => s.id === studentId);
    if (!student) return res.status(404).json({ success: false, error: 'Siswa tidak ditemukan.' });

    const questions = db.getQuestionsByExamId(orgId, examId);
    if (questions.length === 0) {
      return res.status(400).json({ success: false, error: 'Ujian ini belum memiliki butir soal atau kunci jawaban.' });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Server-side image validation (magic bytes, resolution, corruption)
    const imgValidation = validateImageBuffer(buffer, filename || 'scan.jpg');
    if (!imgValidation.isValid) {
      return res.status(422).json({
        success: false,
        error: imgValidation.errorMessage || 'Validasi gambar gagal.',
        qualityFlags: imgValidation.qualityFlags,
      });
    }

    // Duplicate submission check via SHA-256
    const existingSubs = db.getSubmissions(orgId, examId);
    const isDuplicate = existingSubs.some(s =>
      s.files.some(f => f.sha256Hash === imgValidation.sha256Hash)
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'Peringatan duplikasi: Berkas gambar lembar jawaban ini persis sama dengan yang telah dikoreksi sebelumnya.',
      });
    }

    const submissionId = `sub-${crypto.randomUUID().slice(0, 8)}`;
    const jobId = `job-${crypto.randomUUID().slice(0, 8)}`;
    const idempotencyKey = `idem-${submissionId}`;

    // Create Initial Job in Queue
    const job: GradingJobModel = {
      id: jobId,
      orgId,
      submissionId,
      studentName: student.fullName,
      examTitle: exam.title,
      status: 'PROCESSING',
      progressPercentage: 20,
      currentStep: 'MEMVALIDASI & EKSTRAKSI TEKS (OCR Multimodal)',
      retryCount: 0,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };
    db.createGradingJob(job);

    // Call Multimodal OCR Extraction (Gemini / Simulated Demo)
    const ocrResult = await geminiService.extractAnswerSheetContent(
      base64Data,
      imgValidation.mimeType,
      questions
    );

    db.updateGradingJob(orgId, jobId, {
      progressPercentage: 50,
      currentStep: 'MENILAI PILIHAN GANDA (Mesin Deterministik)',
    });

    // Score Multiple-Choice Questions deterministically
    let mcCorrect = 0;
    let mcWrong = 0;
    let mcUnanswered = 0;
    let totalScore = 0;
    let anyNeedsReview = false;

    const answerResults: any[] = [];

    for (const q of questions) {
      if (q.type === 'MULTIPLE_CHOICE') {
        const studentAns = ocrResult.mcAnswers[q.questionNumber];
        const result = scoreMultipleChoiceQuestion(q, studentAns);

        if (result.status === 'CORRECT') mcCorrect++;
        else if (result.status === 'WRONG') mcWrong++;
        else if (result.status === 'UNANSWERED') mcUnanswered++;

        if (result.reviewRequired) anyNeedsReview = true;

        totalScore += result.score;
        answerResults.push({
          id: `ans-${crypto.randomUUID().slice(0, 8)}`,
          submissionId,
          questionId: q.id,
          questionNumber: q.questionNumber,
          questionType: q.type,
          questionText: q.text,
          studentAnswerRaw: studentAns || '',
          recognizedAnswer: result.selectedOption || '',
          isCorrect: result.isCorrect,
          score: result.score,
          maxScore: result.maxPoints,
          explanation: result.note,
          confidence: result.status === 'AMBIGUOUS' ? 0.5 : 0.99,
          reviewRequired: result.reviewRequired,
          isSimulatedDemo: ocrResult.isSimulatedDemo,
        });
      } else {
        // Essay / Short Answer: Grade with Gemini Rubric Service
        db.updateGradingJob(orgId, jobId, {
          progressPercentage: 75,
          currentStep: `MENILAI ESAI BUTIR #${q.questionNumber} BERDASARKAN RUBRIK`,
        });

        const rawEssay = ocrResult.essayAnswers[q.questionNumber] || '';
        const essayGrading = await geminiService.gradeEssayQuestion(
          q,
          rawEssay,
          q.rubricCriteria || []
        );

        totalScore += essayGrading.totalScore;
        if (essayGrading.reviewRequired) anyNeedsReview = true;

        answerResults.push({
          id: `ans-${crypto.randomUUID().slice(0, 8)}`,
          submissionId,
          questionId: q.id,
          questionNumber: q.questionNumber,
          questionType: q.type,
          questionText: q.text,
          studentAnswerRaw: rawEssay,
          recognizedAnswer: essayGrading.recognizedAnswer,
          score: essayGrading.totalScore,
          maxScore: essayGrading.maxScore,
          criterionScores: essayGrading.criterionScores,
          evidence: essayGrading.evidence,
          explanation: essayGrading.explanation,
          correction: essayGrading.correction,
          suggestions: essayGrading.suggestions,
          confidence: essayGrading.confidence,
          reviewRequired: essayGrading.reviewRequired,
          isSimulatedDemo: essayGrading.isSimulatedDemo,
        });
      }
    }

    const maxScore = Number(exam.maxScore) || 100;
    const finalScore = Math.round(totalScore * 10) / 10;
    const percentageScore = Math.round((finalScore / maxScore) * 100 * 10) / 10;
    const isPassed = finalScore >= exam.passingScore;

    // Check borderline KKM (within 2 points of passing) -> triggers review
    if (Math.abs(finalScore - exam.passingScore) <= 2) {
      anyNeedsReview = true;
    }

    // Save File record
    const submissionFile = {
      id: `file-${crypto.randomUUID().slice(0, 8)}`,
      submissionId,
      fileKey: `storage-${submissionId}-page1`,
      originalName: filename || 'lembar_jawaban.jpg',
      mimeType: imgValidation.mimeType,
      sizeBytes: imgValidation.sizeBytes,
      width: imgValidation.width,
      height: imgValidation.height,
      sha256Hash: imgValidation.sha256Hash,
      pageNumber: 1,
      storageUrl: `data:${imgValidation.mimeType};base64,${base64Data}`,
      qualityScore: imgValidation.qualityScore,
      qualityFlags: imgValidation.qualityFlags,
    };

    // Save submission record
    const submission: SubmissionModel = {
      id: submissionId,
      orgId,
      examId: exam.id,
      examTitle: exam.title,
      examSubject: exam.subject,
      examVersionNumber: exam.currentVersion,
      studentId: student.id,
      studentName: student.fullName,
      studentNis: student.nis,
      className: student.className || 'Kelas',
      status: anyNeedsReview ? 'NEEDS_REVIEW' : 'COMPLETED',
      finalScore,
      maxScore,
      percentageScore,
      isPassed,
      multipleChoiceStats: {
        correct: mcCorrect,
        wrong: mcWrong,
        unanswered: mcUnanswered,
        total: mcCorrect + mcWrong + mcUnanswered,
      },
      files: [submissionFile],
      answers: answerResults,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.createSubmission(submission);

    // Complete Job
    db.updateGradingJob(orgId, jobId, {
      status: 'COMPLETED',
      progressPercentage: 100,
      currentStep: anyNeedsReview ? 'SELESAI (Perlu Verifikasi Guru)' : 'SELESAI (Koreksi Berhasil)',
      completedAt: new Date().toISOString(),
    });

    db.addAuditLog({
      orgId,
      userId: req.user!.id,
      userEmail: req.user!.email,
      action: 'SUBMISSION_GRADED',
      entityType: 'Submission',
      entityId: submissionId,
      details: {
        student: student.fullName,
        score: finalScore,
        status: submission.status,
      },
    });

    res.status(201).json({
      success: true,
      submission,
      jobId,
      message: anyNeedsReview
        ? 'Koreksi selesai dengan catatan: terdapat jawaban yang membutuhkan verifikasi guru.'
        : 'Koreksi otomatis berhasil diselesaikan.',
    });
  } catch (err: any) {
    console.error('Error in grading pipeline:', err);
    res.status(500).json({ success: false, error: err.message || 'Terjadi kegagalan pemrosesan koreksi.' });
  }
});

// Submissions Endpoints
apiRouter.get('/submissions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { examId, status } = req.query;
  const submissions = db.getSubmissions(req.user!.orgId, examId as string, status as string);
  res.json({ success: true, data: submissions });
});

apiRouter.get('/submissions/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const submission = db.getSubmissionById(req.user!.orgId, req.params.id);
  if (!submission) return res.status(404).json({ success: false, error: 'Lembar jawaban tidak ditemukan.' });
  res.json({ success: true, data: submission });
});

// Manual Teacher Score Override with mandatory reason
apiRouter.post('/submissions/:id/override', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parse = ScoreOverrideSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.issues[0]?.message });
  }

  const { score, reason } = parse.data;
  const orgId = req.user!.orgId;
  const sub = db.getSubmissionById(orgId, req.params.id);
  if (!sub) return res.status(404).json({ success: false, error: 'Lembar jawaban tidak ditemukan.' });

  const oldScore = sub.finalScore;
  const exam = db.getExamById(orgId, sub.examId);
  const passingScore = exam?.passingScore || 75;

  const updated = db.updateSubmission(orgId, req.params.id, {
    finalScore: score,
    percentageScore: Math.round((score / sub.maxScore) * 100 * 10) / 10,
    isPassed: score >= passingScore,
    status: 'COMPLETED',
    manualOverrideReason: reason,
    reviewedById: req.user!.id,
    reviewerName: req.user!.fullName,
    reviewedAt: new Date().toISOString(),
  });

  db.addAuditLog({
    orgId,
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'SCORE_OVERRIDDEN',
    entityType: 'Submission',
    entityId: sub.id,
    details: {
      student: sub.studentName,
      oldScore,
      newScore: score,
      reason,
    },
  });

  res.json({ success: true, data: updated });
});

// Finalize / Approve Submission
apiRouter.post('/submissions/:id/finalize', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.orgId;
  const sub = db.getSubmissionById(orgId, req.params.id);
  if (!sub) return res.status(404).json({ success: false, error: 'Lembar jawaban tidak ditemukan.' });

  const updated = db.updateSubmission(orgId, req.params.id, {
    status: 'COMPLETED',
    reviewedById: req.user!.id,
    reviewerName: req.user!.fullName,
    reviewedAt: new Date().toISOString(),
  });

  db.addAuditLog({
    orgId,
    userId: req.user!.id,
    userEmail: req.user!.email,
    action: 'SUBMISSION_FINALIZED',
    entityType: 'Submission',
    entityId: sub.id,
  });

  res.json({ success: true, data: updated });
});

// Grading Queue Endpoints
apiRouter.get('/grading-jobs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const jobs = db.getGradingJobs(req.user!.orgId);
  res.json({ success: true, data: jobs });
});

apiRouter.post('/grading-jobs/:id/retry', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const job = db.getGradingJobById(req.user!.orgId, req.params.id);
  if (!job) return res.status(404).json({ success: false, error: 'Job tidak ditemukan.' });

  const updated = db.updateGradingJob(req.user!.orgId, req.params.id, {
    status: 'PROCESSING',
    progressPercentage: 10,
    currentStep: 'MEMPROSES ULANG KOREKSI',
    retryCount: job.retryCount + 1,
  });

  res.json({ success: true, data: updated });
});

// Analytics & Remedial Insights
apiRouter.get('/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.orgId;
  const { examId } = req.query;
  const exams = db.getExams(orgId);
  const targetExam = examId ? db.getExamById(orgId, examId as string) : exams[0];

  const submissions = targetExam ? db.getSubmissions(orgId, targetExam.id) : [];
  const completedSubs = submissions.filter(s => s.status === 'COMPLETED');

  // Score distribution bins: 0-59, 60-69, 70-79, 80-89, 90-100
  const distribution = [
    { range: '< 60 (Perlu Remedial)', count: 0 },
    { range: '60 - 69 (Kurang)', count: 0 },
    { range: '70 - 79 (Cukup / Tuntas)', count: 0 },
    { range: '80 - 89 (Baik)', count: 0 },
    { range: '90 - 100 (Sangat Baik)', count: 0 },
  ];

  let totalScore = 0;
  let passedCount = 0;

  completedSubs.forEach(s => {
    totalScore += s.finalScore;
    if (s.isPassed) passedCount++;

    if (s.finalScore < 60) distribution[0].count++;
    else if (s.finalScore < 70) distribution[1].count++;
    else if (s.finalScore < 80) distribution[2].count++;
    else if (s.finalScore < 90) distribution[3].count++;
    else distribution[4].count++;
  });

  const avg = completedSubs.length > 0 ? Math.round((totalScore / completedSubs.length) * 10) / 10 : 0;
  const passRate = completedSubs.length > 0 ? Math.round((passedCount / completedSubs.length) * 100) : 0;

  // Analysis of question difficulty (Tingkat Kesukaran P)
  const questions = targetExam ? db.getQuestionsByExamId(orgId, targetExam.id) : [];
  const questionAnalytics = questions.map(q => {
    const scores = completedSubs.map(s => {
      const a = s.answers.find(ans => ans.questionId === q.id);
      return a ? a.score / a.maxScore : 0;
    });
    const avgRatio = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.8;
    let difficultyLabel = 'Sedang';
    if (avgRatio > 0.85) difficultyLabel = 'Mudah';
    else if (avgRatio < 0.6) difficultyLabel = 'Sukar (Perlu Penguatan)';

    return {
      questionNumber: q.questionNumber,
      type: q.type,
      learningObjective: q.learningObjective || q.text.slice(0, 45) + '...',
      averageScorePercent: Math.round(avgRatio * 100),
      difficultyLabel,
      sampleSizeNote: completedSubs.length < 10 ? 'Sampel terbatas (< 10 siswa)' : 'Statistik reliabel',
    };
  });

  // Common misconceptions and remedial recommendations
  const commonMisconceptions = [
    {
      topic: 'Fotosintesis: Pembeda Reaksi Terang & Siklus Calvin',
      frequency: '34% siswa',
      misconception: 'Siswa sering keliru menyatakan bahwa reaksi terang menghasilkan glukosa secara langsung, padahal menghasilkan ATP & NADPH.',
      remedialActivity: 'Bagan interaktif alur fotolisis air dan pembentukan glukosa di stroma.',
    },
    {
      topic: 'Genetika: DNA vs Kromosom & Gen',
      frequency: '21% siswa',
      misconception: 'Sebagian siswa menganggap kromosom berada di luar inti sel.',
      remedialActivity: 'Praktikum model untai DNA sederhana dari plastisin/benang.',
    },
  ];

  res.json({
    success: true,
    data: {
      exam: targetExam,
      totalSubmissions: completedSubs.length,
      averageScore: avg,
      passRatePercent: passRate,
      scoreDistribution: distribution,
      questionAnalytics,
      commonMisconceptions,
      sampleWarning: completedSubs.length < 5 ? 'Perhatian: Jumlah lembar jawaban yang telah dinilai masih sedikit. Analisis ini bersifat indikatif.' : null,
    },
  });
});

// CSV Export
apiRouter.get('/reports/export-csv', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const orgId = req.user!.orgId;
  const { examId } = req.query;
  const subs = db.getSubmissions(orgId, examId as string);

  let csv = 'NISN,NIS,Nama Lengkap,Kelas,Judul Ujian,Nilai Akhir,Nilai Maksimal,Status Ketuntasan,Tanggal Koreksi\n';
  subs.forEach(s => {
    csv += `"${s.studentId}","${s.studentNis}","${s.studentName}","${s.className}","${s.examTitle}",${s.finalScore},${s.maxScore},"${s.isPassed ? 'TUNTAS' : 'REMEDIAL'}","${s.createdAt.split('T')[0]}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Laporan_Nilai_AI_Teacher_Grader.csv"');
  res.send(csv);
});

// Billing & Plan Settings
apiRouter.get('/billing', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const org = db.getOrganization(req.user!.orgId);
  res.json({
    success: true,
    data: {
      organizationName: org?.name,
      planType: org?.planType || 'SEKOLAH_MANDIRI',
      quotaLimit: org?.quotaLimit || 500,
      quotaUsed: org?.quotaUsed || 0,
      quotaRemaining: Math.max(0, (org?.quotaLimit || 500) - (org?.quotaUsed || 0)),
      renewalDate: '2026-12-31',
      availablePlans: [
        {
          id: 'FREE_TRIAL',
          name: 'Paket Uji Coba Guru',
          priceIdr: 0,
          quota: 100,
          description: 'Cocok untuk mencoba penilaian lembar jawaban di 2–3 kelas.',
        },
        {
          id: 'SEKOLAH_MANDIRI',
          name: 'Paket Sekolah Mandiri',
          priceIdr: 450000,
          quota: 1500,
          description: 'Paling populer untuk SMP & SMA: kuota 1.500 lembar koreksi/bulan, ekspor PDF/Excel, dan analitika rubrik.',
        },
        {
          id: 'TERPADU_DINAS',
          name: 'Paket Terpadu Instansi / Dinas',
          priceIdr: 1850000,
          quota: 10000,
          description: 'Untuk skala yayasan atau dinas pendidikan: manajemen multi-sekolah, integrasi Dapodik, dan dukungan prioritas.',
        },
      ],
      paymentNotice: 'Catatan Integrasi Pembayaran: Mode demonstrasi saat ini aktif. Integrasi gateway pembayaran perbankan Indonesia (QRIS/VA Midtrans/Xendit) siap disambungkan dengan API key resmi.',
    },
  });
});

// Admin Console (Platform Administrator Only)
apiRouter.get('/admin/organizations', requireAuth, requireRole('PLATFORM_ADMIN'), (_req, res) => {
  res.json({
    success: true,
    data: db.getAllOrganizations(),
  });
});

apiRouter.get('/admin/audit-logs', requireAuth, requireRole('PLATFORM_ADMIN', 'SCHOOL_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const logs = db.getAuditLogs(req.user!.orgId);
  res.json({ success: true, data: logs });
});
