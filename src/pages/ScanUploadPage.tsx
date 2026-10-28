import React, { useEffect, useState, useRef } from 'react';
import {
  UploadCloud,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  Zap,
  ArrowRight,
  Eye,
  Trash2,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ExamModel, StudentModel } from '../types/index.ts';

interface ScanUploadPageProps {
  onGradingComplete: (submissionId: string) => void;
  onGoToQueue: () => void;
}

export const ScanUploadPage: React.FC<ScanUploadPageProps> = ({
  onGradingComplete,
  onGoToQueue,
}) => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Upload & Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [imageQuality, setImageQuality] = useState<{
    width?: number;
    height?: number;
    isLegible: boolean;
    warning?: string;
  }>({ isLegible: true });

  const [uploading, setUploading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState<{
    step: string;
    percent: number;
  }>({ step: '', percent: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setLoadingInitial(true);
    try {
      const [resExams, resStudents]: any = await Promise.all([
        apiClient.request('/api/exams'),
        apiClient.request('/api/students'),
      ]);
      const examList = resExams.data || [];
      const studentList = resStudents.data || [];
      setExams(examList);
      setStudents(studentList);

      if (examList.length > 0) setSelectedExamId(examList[0].id);
      if (studentList.length > 0) setSelectedStudentId(studentList[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const processImageFile = (file: File) => {
    setErrorMsg('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Format file harus berupa gambar JPG, PNG, atau WebP.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Ukuran file melebihi batas 15MB.');
      return;
    }

    setImageFile(file);
    setImageRotation(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImagePreviewUrl(url);

      // Inspect dimensions
      const img = new Image();
      img.onload = () => {
        const legible = img.width >= 600 && img.height >= 600;
        setImageQuality({
          width: img.width,
          height: img.height,
          isLegible: legible,
          warning: legible
            ? undefined
            : 'Resolusi gambar agak rendah (< 600px). Disarankan memotret lebih dekat dan tegak lurus.',
        });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleRotate = () => {
    setImageRotation((prev) => (prev + 90) % 360);
  };

  // Quick load of sample student answer sheet for demo testing
  const handleLoadSampleSheet = async () => {
    try {
      setErrorMsg('');
      const sampleUrl = '/src/assets/images/sample_answer_sheet_1793153724076.jpg';
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], 'LJK_Contoh_DianPertiwi_Biologi.jpg', {
        type: 'image/jpeg',
      });
      processImageFile(file);
    } catch (err: any) {
      setErrorMsg('Gagal memuat berkas contoh LJK: ' + err.message);
    }
  };

  // Submit and start grading pipeline
  const handleSubmitGrading = async () => {
    if (!imagePreviewUrl || !selectedExamId || !selectedStudentId) {
      setErrorMsg('Harap lengkapi pemilihan ujian, siswa, dan gambar lembar jawaban.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    setGradingProgress({ step: 'Mengunggah & validasi integritas berkas...', percent: 20 });

    try {
      // If rotated, redraw onto canvas to bake rotation
      let finalBase64 = imagePreviewUrl;
      if (imageRotation !== 0 && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imagePreviewUrl;
        });

        if (imageRotation === 90 || imageRotation === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        ctx?.save();
        ctx?.translate(canvas.width / 2, canvas.height / 2);
        ctx?.rotate((imageRotation * Math.PI) / 180);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        ctx?.restore();
        finalBase64 = canvas.toDataURL('image/jpeg', 0.92);
      }

      setGradingProgress({ step: 'Mengekstrak teks & tulisan tangan (OCR Multimodal)...', percent: 45 });

      const res: any = await apiClient.request('/api/submissions/upload-and-grade', {
        method: 'POST',
        body: JSON.stringify({
          examId: selectedExamId,
          studentId: selectedStudentId,
          imageBase64: finalBase64,
          filename: imageFile?.name || 'lembar_jawaban.jpg',
        }),
      });

      setGradingProgress({ step: 'Selesai! Menyusun rekap skor...', percent: 100 });

      setTimeout(() => {
        onGradingComplete(res.submission.id);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses koreksi lembar jawaban.');
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Pindai &amp; Unggah Lembar Jawaban (LJK)
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Unggah foto lembar jawaban siswa (JPG/PNG/WebP). Sistem akan memproses pilihan ganda secara deterministik dan mengevaluasi esai sesuai rubrik.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Perhatian:</span>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Exam & Student Assignment */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Tentukan Ujian &amp; Siswa
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paket Ujian <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.subject})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} - NIS: {st.nis} ({st.className})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] text-slate-700 space-y-1">
                <div>• Kunci jawaban &amp; rubrik akan dicocokkan otomatis.</div>
                <div>• Deteksi duplikasi berkas aktif via SHA-256 hash.</div>
                <div>• Tulisan tangan esai akan dievaluasi per kriteria.</div>
              </div>
            </div>

            {/* Demo Sample Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleLoadSampleSheet}
                className="w-full py-2 px-3 border border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/60 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Gunakan Contoh Lembar Jawaban Biologi (Demo)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form: Dropzone & Image Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Berkas Foto Lembar Jawaban
              </h2>
              {imagePreviewUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRotate}
                    className="p-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1"
                    title="Putar 90 derajat"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Putar ({imageRotation}°)</span>
                  </button>
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreviewUrl('');
                    }}
                    className="p-1.5 text-xs text-red-600 hover:text-red-700 border border-slate-200 rounded-md hover:bg-red-50"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {!imagePreviewUrl ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3 hover:border-blue-400 transition-colors bg-slate-50/50"
              >
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    Tarik dan lepaskan foto lembar jawaban di sini
                  </p>
                  <p className="text-[11px] text-slate-700">
                    Format JPG, PNG, atau WebP hingga maksimal 15MB
                  </p>
                </div>
                <label className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors">
                  <span>Pilih Berkas dari Perangkat</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative overflow-hidden bg-slate-100 rounded-lg border border-slate-200 max-h-[380px] flex items-center justify-center p-2">
                  <img
                    src={imagePreviewUrl}
                    alt="Pratinjau lembar jawaban siswa"
                    referrerPolicy="no-referrer"
                    style={{ transform: `rotate(${imageRotation}deg)` }}
                    className="max-h-[360px] w-auto object-contain transition-transform duration-200 shadow-xs"
                  />
                </div>

                {/* Quality Indicator */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-800 font-medium">
                      Integritas Foto: {imageQuality.width} x {imageQuality.height} px
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-700">
                    {(imageFile?.size ? imageFile.size / 1024 / 1024 : 1.8).toFixed(1)} MB
                  </span>
                </div>

                {imageQuality.warning && (
                  <div className="p-2.5 bg-amber-50 text-amber-800 text-[11px] rounded-md border border-amber-200">
                    {imageQuality.warning}
                  </div>
                )}
              </div>
            )}

            {/* Hidden canvas for client rotation export */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Progress Bar when Uploading / Grading */}
            {uploading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
                  <span>{gradingProgress.step}</span>
                  <span className="tabular-nums">{gradingProgress.percent}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${gradingProgress.percent}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSubmitGrading}
                disabled={!imagePreviewUrl || uploading}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>{uploading ? 'Sedang Mengoreksi...' : 'Mulai Koreksi Lembar Jawaban'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
