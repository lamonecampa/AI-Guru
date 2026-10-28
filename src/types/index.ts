import { z } from 'zod';

export type UserRole = 'SUPERADMIN' | 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER';
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type QuestionType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
export type SubmissionStatus = 'QUEUED' | 'PROCESSING' | 'NEEDS_REVIEW' | 'COMPLETED' | 'FAILED';
export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type PlanType = 'FREE_TRIAL' | 'SEKOLAH_MANDIRI' | 'TERPADU_DINAS';

export function isSuperAdmin(role?: string): boolean {
  return role === 'SUPERADMIN' || role === 'PLATFORM_ADMIN';
}

export function isSchoolAdmin(role?: string): boolean {
  return role === 'SCHOOL_ADMIN';
}

export function isTeacher(role?: string): boolean {
  return role === 'TEACHER';
}

export function getDefaultDashboard(role?: UserRole): string {
  if (isSuperAdmin(role)) return '/superadmin/dashboard';
  if (isSchoolAdmin(role)) return '/school/dashboard';
  return '/teacher/dashboard';
}

export interface UserSession {
  id: string;
  orgId: string;
  orgName: string;
  email: string;
  fullName: string;
  role: UserRole;
  nip?: string;
  avatarUrl?: string;
}

export interface RubricLevel {
  points: number;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  maxPoints: number;
  description: string;
  levels?: RubricLevel[];
}

export interface MultipleChoiceOption {
  key: string; // 'A', 'B', 'C', 'D', 'E'
  text: string;
}

export interface QuestionModel {
  id: string;
  examId: string;
  questionNumber: number;
  type: QuestionType;
  text: string;
  maxPoints: number;
  options?: MultipleChoiceOption[];
  correctOption?: string; // 'A', 'B', 'C', 'D', 'E'
  acceptedAlternatives?: string[];
  explanation?: string;
  learningObjective?: string;
  rubricCriteria?: RubricCriterion[];
}

export interface ExamModel {
  id: string;
  orgId: string;
  createdById: string;
  creatorName?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  academicYear: string;
  semester: string;
  examDate: string;
  durationMinutes: number;
  maxScore: number;
  passingScore: number;
  status: ExamStatus;
  currentVersion: number;
  description?: string;
  assignedClassIds: string[];
  assignedClassNames?: string[];
  totalQuestions?: number;
  totalSubmissions?: number;
  averageScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassModel {
  id: string;
  orgId: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  teacherId?: string;
  teacherName?: string;
  studentCount: number;
}

export interface StudentModel {
  id: string;
  orgId: string;
  classId: string;
  className?: string;
  nisn: string;
  nis: string;
  fullName: string;
  gender: 'L' | 'P';
  isActive: boolean;
}

export interface SubmissionFileModel {
  id: string;
  submissionId: string;
  fileKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  sha256Hash: string;
  pageNumber: number;
  storageUrl?: string;
  qualityScore?: number;
  qualityFlags?: string[];
}

export interface CriterionScoreResult {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  evidence: string;
  rationale: string;
}

export interface AnswerResultModel {
  id: string;
  submissionId: string;
  questionId: string;
  questionNumber: number;
  questionType: QuestionType;
  questionText: string;
  studentAnswerRaw?: string;
  recognizedAnswer?: string;
  isCorrect?: boolean;
  score: number;
  maxScore: number;
  criterionScores?: CriterionScoreResult[];
  evidence?: string;
  explanation?: string;
  correction?: string;
  suggestions?: string;
  confidence?: number;
  reviewRequired: boolean;
  manualOverrideScore?: number;
  manualOverrideReason?: string;
  isSimulatedDemo?: boolean;
}

export interface SubmissionModel {
  id: string;
  orgId: string;
  examId: string;
  examTitle: string;
  examSubject: string;
  examVersionNumber: number;
  studentId: string;
  studentName: string;
  studentNis: string;
  className: string;
  status: SubmissionStatus;
  finalScore: number;
  maxScore: number;
  percentageScore: number;
  isPassed: boolean;
  multipleChoiceStats?: {
    correct: number;
    wrong: number;
    unanswered: number;
    total: number;
  };
  manualOverrideReason?: string;
  reviewedById?: string;
  reviewerName?: string;
  reviewedAt?: string;
  files: SubmissionFileModel[];
  answers: AnswerResultModel[];
  createdAt: string;
  updatedAt: string;
}

export interface GradingJobModel {
  id: string;
  orgId: string;
  submissionId: string;
  studentName: string;
  examTitle: string;
  status: JobStatus;
  progressPercentage: number;
  currentStep: string;
  errorMessage?: string;
  retryCount: number;
  idempotencyKey: string;
  createdAt: string;
  completedAt?: string;
}

export interface OrganizationModel {
  id: string;
  name: string;
  npsn?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phone?: string;
  planType: PlanType;
  quotaLimit: number;
  quotaUsed: number;
  status?: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AuditLogModel {
  id: string;
  orgId: string;
  userId?: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Zod Validation Schemas
export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

export const RegisterSchema = z.object({
  fullName: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  organizationName: z.string().min(3, 'Nama sekolah/organisasi minimal 3 karakter'),
  npsn: z.string().optional(),
});

export const RubricCriterionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama kriteria wajib diisi'),
  maxPoints: z.number().positive('Poin maksimal harus lebih dari 0'),
  description: z.string(),
});

export const QuestionSchema = z.object({
  id: z.string().optional(),
  questionNumber: z.number().int().positive(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY']),
  text: z.string().min(1, 'Pertanyaan tidak boleh kosong'),
  maxPoints: z.number().positive('Poin harus positif'),
  options: z.array(z.object({
    key: z.string(),
    text: z.string(),
  })).optional(),
  correctOption: z.string().optional(),
  acceptedAlternatives: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  learningObjective: z.string().optional(),
  rubricCriteria: z.array(RubricCriterionSchema).optional(),
});

export const ExamCreateSchema = z.object({
  title: z.string().min(3, 'Judul ujian minimal 3 karakter'),
  subject: z.string().min(2, 'Mata pelajaran wajib diisi'),
  gradeLevel: z.string().min(2, 'Jenjang kelas wajib diisi'),
  academicYear: z.string().min(4, 'Tahun ajaran wajib diisi'),
  semester: z.enum(['Ganjil', 'Genap']),
  examDate: z.string().min(10, 'Tanggal ujian tidak valid'),
  durationMinutes: z.number().int().positive().default(90),
  maxScore: z.number().positive().default(100),
  passingScore: z.number().positive().default(75),
  description: z.string().optional(),
  assignedClassIds: z.array(z.string()).default([]),
});

export const ScoreOverrideSchema = z.object({
  score: z.number().min(0, 'Nilai tidak boleh negatif'),
  reason: z.string().min(5, 'Alasan penyesuaian nilai wajib diisi (minimal 5 karakter)'),
});

// Zod Schema for Gemini Essay Grading Output
export const GeminiEssayGradingOutputSchema = z.object({
  questionId: z.string(),
  recognizedAnswer: z.string(),
  criterionScores: z.array(z.object({
    criterionId: z.string(),
    criterionName: z.string(),
    score: z.number().min(0),
    maxScore: z.number().positive(),
    evidence: z.string(),
    rationale: z.string(),
  })),
  totalScore: z.number().min(0),
  maxScore: z.number().positive(),
  evidence: z.string(),
  explanation: z.string(),
  correction: z.string(),
  suggestions: z.string(),
  confidence: z.number().min(0).max(1),
  reviewRequired: z.boolean(),
});
export type GeminiEssayGradingOutput = z.infer<typeof GeminiEssayGradingOutputSchema>;
