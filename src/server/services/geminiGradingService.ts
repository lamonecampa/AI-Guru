import { GoogleGenAI, Type } from '@google/genai';
import {
  GeminiEssayGradingOutput,
  GeminiEssayGradingOutputSchema,
  QuestionModel,
  RubricCriterion,
} from '../../types/index.ts';

// Deterministic Multiple-Choice Scoring Engine
export interface DeterministicScoringRule {
  unansweredScore: number; // default: 0
  wrongPenalty: number; // default: 0
  allowMultipleMarked: boolean; // default: false (treated as ambiguous/wrong)
}

export interface MCScoringResult {
  questionNumber: number;
  selectedOption?: string;
  correctOption?: string;
  isCorrect: boolean;
  score: number;
  maxPoints: number;
  status: 'CORRECT' | 'WRONG' | 'UNANSWERED' | 'AMBIGUOUS';
  reviewRequired: boolean;
  note: string;
}

export function scoreMultipleChoiceQuestion(
  question: QuestionModel,
  recognizedOption: string | undefined | null,
  rules: DeterministicScoringRule = { unansweredScore: 0, wrongPenalty: 0, allowMultipleMarked: false }
): MCScoringResult {
  const normOption = recognizedOption ? recognizedOption.trim().toUpperCase() : '';
  const correct = question.correctOption ? question.correctOption.trim().toUpperCase() : '';
  const maxPts = Number(question.maxPoints) || 1;

  if (!normOption || normOption === 'BLANK' || normOption === 'KOSONG') {
    return {
      questionNumber: question.questionNumber,
      selectedOption: undefined,
      correctOption: correct,
      isCorrect: false,
      score: rules.unansweredScore,
      maxPoints: maxPts,
      status: 'UNANSWERED',
      reviewRequired: false,
      note: 'Jawaban kosong/tidak diisi oleh siswa.',
    };
  }

  // Detect multiple selections, e.g. "A, B" or "AC"
  if (normOption.length > 1 && !['BENAR', 'SALAH'].includes(normOption)) {
    return {
      questionNumber: question.questionNumber,
      selectedOption: normOption,
      correctOption: correct,
      isCorrect: false,
      score: 0,
      maxPoints: maxPts,
      status: 'AMBIGUOUS',
      reviewRequired: true,
      note: `Arsiran ganda terdeteksi (${normOption}). Perlu verifikasi manual guru.`,
    };
  }

  const isMatch = normOption === correct;
  const earnedScore = isMatch ? maxPts : Math.max(0, -rules.wrongPenalty);

  return {
    questionNumber: question.questionNumber,
    selectedOption: normOption,
    correctOption: correct,
    isCorrect: isMatch,
    score: earnedScore,
    maxPoints: maxPts,
    status: isMatch ? 'CORRECT' : 'WRONG',
    reviewRequired: false,
    note: isMatch ? 'Jawaban tepat sesuai kunci.' : `Jawaban siswa ${normOption}, kunci jawaban ${correct}.`,
  };
}

// Essay AI Grading Service via Gemini
export class GeminiGradingService {
  private ai: GoogleGenAI | null = null;
  private modelName: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  public isLiveApiConfigured(): boolean {
    return this.ai !== null;
  }

  // Extract answers from image (multimodal OCR)
  public async extractAnswerSheetContent(
    imageBase64: string,
    mimeType: string,
    questions: QuestionModel[]
  ): Promise<{
    recognizedStudentNis?: string;
    recognizedStudentName?: string;
    mcAnswers: Record<number, string>; // questionNumber -> 'A' | 'B' | etc.
    essayAnswers: Record<number, string>; // questionNumber -> text
    imageQualityAssessment: { legible: boolean; notes: string };
    isSimulatedDemo: boolean;
  }> {
    if (!this.ai) {
      // High-fidelity synthetic simulated extraction for demo walkthrough
      return this.generateSimulatedExtraction(questions);
    }

    try {
      const prompt = `Anda adalah sistem OCR asisten guru profesional Indonesia untuk lembar jawaban ujian siswa.
Analisis gambar lembar jawaban siswa berikut:
Daftar soal ujian yang diharapkan:
${questions.map(q => `Soal #${q.questionNumber} (${q.type}): "${q.text.slice(0, 80)}..."`).join('\n')}

Tugas:
1. Baca identitas siswa (NIS / NISN / Nama) jika tertulis di atas lembar jawaban.
2. Untuk soal pilihan ganda, kenali opsi huruf yang diarsir/dilingkari/disilang (A, B, C, D, E, atau BLANK jika kosong, atau MULTIPLE jika ada tanda ganda).
3. Untuk soal esai/isian singkat, transkripsikan teks tulisan tangan siswa persis apa adanya tanpa memperbaiki kesalahan kata.
4. Nilai keterbacaan gambar (jelas/buram/terpotong).

Keluarkan format JSON murni sesuai schema.`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType,
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recognizedStudentNis: { type: Type.STRING },
              recognizedStudentName: { type: Type.STRING },
              mcAnswers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    selectedOption: { type: Type.STRING },
                  },
                  required: ['questionNumber', 'selectedOption'],
                },
              },
              essayAnswers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    recognizedText: { type: Type.STRING },
                  },
                  required: ['questionNumber', 'recognizedText'],
                },
              },
              legible: { type: Type.BOOLEAN },
              qualityNotes: { type: Type.STRING },
            },
            required: ['mcAnswers', 'essayAnswers', 'legible'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const mcMap: Record<number, string> = {};
      (parsed.mcAnswers || []).forEach((item: any) => {
        mcMap[item.questionNumber] = item.selectedOption;
      });

      const essayMap: Record<number, string> = {};
      (parsed.essayAnswers || []).forEach((item: any) => {
        essayMap[item.questionNumber] = item.recognizedText;
      });

      return {
        recognizedStudentNis: parsed.recognizedStudentNis,
        recognizedStudentName: parsed.recognizedStudentName,
        mcAnswers: mcMap,
        essayAnswers: essayMap,
        imageQualityAssessment: {
          legible: parsed.legible ?? true,
          notes: parsed.qualityNotes || 'Kualitas gambar terbaca dengan baik.',
        },
        isSimulatedDemo: false,
      };
    } catch (err: any) {
      console.warn('Gemini OCR extraction failed, falling back to simulated extraction:', err.message);
      return this.generateSimulatedExtraction(questions);
    }
  }

  // Grade an individual Essay question using Gemini API with Rubric Criteria & Zod validation
  public async gradeEssayQuestion(
    question: QuestionModel,
    recognizedStudentAnswer: string,
    rubricCriteria: RubricCriterion[]
  ): Promise<GeminiEssayGradingOutput & { isSimulatedDemo: boolean }> {
    const maxScore = Number(question.maxPoints) || 10;

    // If answer is empty or unreadable
    if (!recognizedStudentAnswer || recognizedStudentAnswer.trim().length === 0) {
      return {
        questionId: question.id,
        recognizedAnswer: '(Tidak ada jawaban tertulis)',
        criterionScores: rubricCriteria.map(c => ({
          criterionId: c.id,
          criterionName: c.name,
          score: 0,
          maxScore: c.maxPoints,
          evidence: '-',
          rationale: 'Siswa tidak menuliskan jawaban untuk butir soal ini.',
        })),
        totalScore: 0,
        maxScore,
        evidence: 'Lembar jawaban kosong untuk nomor ini.',
        explanation: 'Siswa tidak mengisi jawaban pada soal esai ini sehingga perolehan skor adalah 0.',
        correction: question.explanation || 'Jawaban lengkap mengacu pada kunci rubrik pembelajaran.',
        suggestions: 'Perlu bimbingan dan dorongan agar siswa percaya diri menguraikan pemikirannya.',
        confidence: 0.99,
        reviewRequired: false,
        isSimulatedDemo: !this.ai,
      };
    }

    if (!this.ai) {
      // Demo simulated response
      return {
        ...this.generateSimulatedEssayGrading(question, recognizedStudentAnswer, rubricCriteria),
        isSimulatedDemo: true,
      };
    }

    try {
      const prompt = `Anda adalah penilai esai ahli untuk kurikulum pendidikan di Indonesia.
Nilai jawaban siswa secara objektif berdasarkan rubrik kriteria guru.

Konteks Soal:
- Nomor Soal: ${question.questionNumber}
- Pertanyaan: "${question.text}"
- Capaian Pembelajaran / KD: "${question.learningObjective || '-'}"
- Kunci Konsep / Penjelasan Guru: "${question.explanation || '-'}"
- Jawaban Alternatif yang Diterima: ${JSON.stringify(question.acceptedAlternatives || [])}
- Skor Maksimal: ${maxScore}

Kriteria Rubrik Penilaian:
${rubricCriteria.map(c => `- Kriteria: "${c.name}" (Maks ${c.maxPoints} poin). Deskripsi: ${c.description}`).join('\n')}

Jawaban Siswa yang Dikenali:
"""
${recognizedStudentAnswer}
"""

Instruksi Penilaian:
1. Nilai setiap kriteria rubrik secara proporsional. Berikan bukti kutipan langsung dari tulisan siswa ('evidence') dan alasan penilaian ('rationale').
2. Jumlahkan totalScore = total poin kriteria. totalScore tidak boleh melebihi maxScore (${maxScore}).
3. Berikan 'explanation' yang konstruktif dalam Bahasa Indonesia yang santun dan edukatif.
4. Jika ada konsep yang keliru/miskonsepsi, jelaskan pada 'correction'.
5. Berikan rekomendasi pembelajaran 'suggestions'.
6. Tentukan 'confidence' (0.00 - 1.00). Jika tulisan meragukan, ambigu, atau skor berada di ambang batas kelulusan, set 'reviewRequired': true.`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionId: { type: Type.STRING },
              recognizedAnswer: { type: Type.STRING },
              criterionScores: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    criterionId: { type: Type.STRING },
                    criterionName: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER },
                    evidence: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                  },
                  required: ['criterionId', 'criterionName', 'score', 'maxScore', 'evidence', 'rationale'],
                },
              },
              totalScore: { type: Type.NUMBER },
              maxScore: { type: Type.NUMBER },
              evidence: { type: Type.STRING },
              explanation: { type: Type.STRING },
              correction: { type: Type.STRING },
              suggestions: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reviewRequired: { type: Type.BOOLEAN },
            },
            required: [
              'questionId',
              'recognizedAnswer',
              'criterionScores',
              'totalScore',
              'maxScore',
              'evidence',
              'explanation',
              'correction',
              'suggestions',
              'confidence',
              'reviewRequired',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      parsed.questionId = question.id;
      parsed.maxScore = maxScore;

      // Validate strictly via Zod
      const validated = GeminiEssayGradingOutputSchema.parse(parsed);

      // Server-side deterministic clamp and safety validation
      let sumCriterion = 0;
      validated.criterionScores.forEach((c) => {
        c.score = Math.max(0, Math.min(c.maxScore, c.score));
        sumCriterion += c.score;
      });
      validated.totalScore = Math.min(maxScore, Math.max(0, sumCriterion));

      // Threshold check: confidence < 0.75 triggers reviewRequired
      if (validated.confidence < 0.75) {
        validated.reviewRequired = true;
      }

      return {
        ...validated,
        isSimulatedDemo: false,
      };
    } catch (err: any) {
      console.warn('Gemini essay evaluation failed or malformed, using safe fallback with review flag:', err.message);
      return {
        ...this.generateSimulatedEssayGrading(question, recognizedStudentAnswer, rubricCriteria),
        reviewRequired: true,
        explanation: `[PERLU REVIEW GURU] Evaluasi otomatis memerlukan peninjauan: ${err.message}`,
        isSimulatedDemo: true,
      };
    }
  }

  // Realistic synthetic simulation for local demo mode without live API key
  private generateSimulatedExtraction(questions: QuestionModel[]) {
    const mcMap: Record<number, string> = {};
    const essayMap: Record<number, string> = {};

    questions.forEach((q) => {
      if (q.type === 'MULTIPLE_CHOICE') {
        // High correlation with key, occasional student mistake or blank for realism
        const keys = ['A', 'B', 'C', 'D', 'E'];
        if (q.questionNumber % 7 === 0) {
          mcMap[q.questionNumber] = 'BLANK';
        } else if (q.questionNumber % 5 === 0) {
          const wrongKeys = keys.filter(k => k !== q.correctOption);
          mcMap[q.questionNumber] = wrongKeys[0] || 'C';
        } else {
          mcMap[q.questionNumber] = q.correctOption || 'A';
        }
      } else {
        // Realistic Indonesian student answer snippets based on subject matter
        if (q.text.toLowerCase().includes('fotosintesis') || q.text.toLowerCase().includes('tumbuhan')) {
          essayMap[q.questionNumber] =
            'Fotosintesis adalah proses pembentukan karbohidrat oleh tumbuhan berklorofil dengan bantuan sinar matahari, air (H2O), dan karbondioksida (CO2) yang menghasilkan glukosa dan oksigen (O2). Proses ini berlangsung di kloroplas.';
        } else if (q.text.toLowerCase().includes('pancasila') || q.text.toLowerCase().includes('sila')) {
          essayMap[q.questionNumber] =
            'Pancasila sebagai dasar negara memiliki makna bahwa seluruh peraturan perundang-undangan di Indonesia harus bersumber dan tidak boleh bertentangan dengan nilai-nilai Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, dan Keadilan Sosial.';
        } else if (q.text.toLowerCase().includes('cerpen') || q.text.toLowerCase().includes('alur')) {
          essayMap[q.questionNumber] =
            'Alur maju mengisahkan peristiwa secara kronologis berurutan dari pengenalan tokoh, konflik, klimaks hingga penyelesaian. Contohnya cerita kehidupan tokoh dari masa kecil hingga sukses menjadi dokter.';
        } else {
          essayMap[q.questionNumber] =
            'Jawaban dianalisis berdasarkan pemahaman konsep inti dan penerapan kaidah ilmiah yang relevan dengan pertanyaan.';
        }
      }
    });

    return {
      recognizedStudentNis: '10928374',
      recognizedStudentName: 'Dian Pertiwi',
      mcAnswers: mcMap,
      essayAnswers: essayMap,
      imageQualityAssessment: {
        legible: true,
        notes: '[SIMULASI / DEMO] Lembar jawaban terdeteksi rapi, kontras tajam, tulisan tangan terbaca jelas.',
      },
      isSimulatedDemo: true,
    };
  }

  private generateSimulatedEssayGrading(
    question: QuestionModel,
    recognizedStudentAnswer: string,
    rubricCriteria: RubricCriterion[]
  ): GeminiEssayGradingOutput {
    const maxScore = Number(question.maxPoints) || 10;
    const criterionScores = rubricCriteria.map((c) => {
      // Allocate ~85% score realistically
      const score = Math.round((c.maxPoints * 0.85) * 10) / 10;
      return {
        criterionId: c.id,
        criterionName: c.name,
        score,
        maxScore: c.maxPoints,
        evidence: `Kutipan siswa: "${recognizedStudentAnswer.slice(0, 45)}..."`,
        rationale: `[SIMULASI / DEMO] Siswa telah mencakup aspek utama ${c.name} dengan penalaran yang logis.`,
      };
    });

    const totalScore = Math.min(
      maxScore,
      criterionScores.reduce((acc, curr) => acc + curr.score, 0)
    );

    return {
      questionId: question.id,
      recognizedAnswer: recognizedStudentAnswer,
      criterionScores,
      totalScore,
      maxScore,
      evidence: `Jawaban memuat frasa kunci: "${recognizedStudentAnswer.slice(0, 60)}..."`,
      explanation:
        '[SIMULASI / DEMO] Pemahaman konsep siswa sudah sangat baik dan runtut. Argumentasi yang disampaikan selaras dengan rubrik penilaian yang ditetapkan guru.',
      correction: 'Konsep dasar telah tepat; penyempurnaan dapat difokuskan pada pemberian contoh kontekstual di kehidupan sehari-hari.',
      suggestions: 'Dapat diberikan pengayaan analisis studi kasus mandiri untuk memperdalam literasi sains/bahasa siswa.',
      confidence: 0.92,
      reviewRequired: false,
    };
  }
}
