import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Award,
  Edit3,
  ShieldCheck,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { SubmissionModel } from '../types/index.ts';

interface SubmissionDetailPageProps {
  initialSubmissionId?: string | null;
  onBackToList?: () => void;
}

export const SubmissionDetailPage: React.FC<SubmissionDetailPageProps> = ({
  initialSubmissionId,
  onBackToList,
}) => {
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(initialSubmissionId || null);
  const [currentSub, setCurrentSub] = useState<SubmissionModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Override Modal state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideScore, setOverrideScore] = useState<number>(0);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    if (selectedSubId) {
      loadSubmissionDetail(selectedSubId);
    }
  }, [selectedSubId]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/submissions');
      const list: SubmissionModel[] = res.data || [];
      setSubmissions(list);
      if (!selectedSubId && list.length > 0) {
        setSelectedSubId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissionDetail = async (id: string) => {
    try {
      const res: any = await apiClient.request(`/api/submissions/${id}`);
      setCurrentSub(res.data);
      setOverrideScore(res.data.finalScore);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinalize = async () => {
    if (!currentSub) return;
    try {
      await apiClient.request(`/api/submissions/${currentSub.id}/finalize`, {
        method: 'POST',
      });
      loadSubmissionDetail(currentSub.id);
      loadSubmissions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub) return;
    setOverrideSubmitting(true);
    setOverrideError('');
    try {
      await apiClient.request(`/api/submissions/${currentSub.id}/override`, {
        method: 'POST',
        body: JSON.stringify({
          score: Number(overrideScore),
          reason: overrideReason,
        }),
      });
      setShowOverrideModal(false);
      setOverrideReason('');
      loadSubmissionDetail(currentSub.id);
      loadSubmissions();
    } catch (err: any) {
      setOverrideError(err.message || 'Gagal menyimpan penyesuaian nilai.');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const filteredList = submissions.filter((s) => {
    if (filterStatus === 'NEEDS_REVIEW') return s.status === 'NEEDS_REVIEW';
    if (filterStatus === 'COMPLETED') return s.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Hasil Penilaian &amp; Tinjauan Guru
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Verifikasi transparansi skor per kriteria rubrik, periksa berkas pindaian LJK, dan tetapkan penyesuaian nilai manual berlandaskan bukti.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({submissions.length})
          </button>
          <button
            onClick={() => setFilterStatus('NEEDS_REVIEW')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'NEEDS_REVIEW'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perlu Review Guru ({submissions.filter((s) => s.status === 'NEEDS_REVIEW').length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterStatus === 'COMPLETED'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuntas ({submissions.filter((s) => s.status === 'COMPLETED').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: List of submissions */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Daftar Lembar Jawaban ({filteredList.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[750px] overflow-y-auto">
            {filteredList.map((sub) => {
              const isSelected = sub.id === selectedSubId;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`w-full p-4 text-left flex items-start justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1 truncate">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {sub.studentName}
                    </div>
                    <div className="text-[11px] text-slate-700 truncate">
                      NIS: {sub.studentNis} · {sub.className}
                    </div>
                    <div className="text-[11px] text-slate-700 truncate">
                      {sub.examTitle}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-base font-bold text-slate-900 tabular-nums">
                      {sub.finalScore}
                      <span className="text-xs font-normal text-slate-700">/{sub.maxScore}</span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold block ${
                        sub.status === 'NEEDS_REVIEW'
                          ? 'text-amber-700'
                          : sub.isPassed
                          ? 'text-emerald-700'
                          : 'text-red-600'
                      }`}
                    >
                      {sub.status === 'NEEDS_REVIEW'
                        ? 'Perlu Review'
                        : sub.isPassed
                        ? 'Tuntas'
                        : 'Remedial'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed grading results & review actions */}
        <div className="lg:col-span-8 space-y-5">
          {!currentSub ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-700">
              Pilih lembar jawaban dari panel kiri untuk melihat hasil penilaian detail.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Summary Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-blue-700">
                      {currentSub.examSubject}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 leading-tight">
                      {currentSub.studentName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-700 mt-1">
                      <span>NIS: {currentSub.studentNis}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span>{currentSub.className}</span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span>Versi Ujian #{currentSub.examVersionNumber}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowOverrideModal(true)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sesuaikan Nilai Guru</span>
                    </button>
                    {currentSub.status === 'NEEDS_REVIEW' && (
                      <button
                        onClick={handleFinalize}
                        className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Setujui &amp; Finalisasi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI score blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-700">Nilai Akhir</div>
                    <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                      {currentSub.finalScore}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-700">Ketuntasan KKM</div>
                    <div
                      className={`text-sm font-bold mt-1 ${
                        currentSub.isPassed ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {currentSub.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-700">Pilihan Ganda</div>
                    <div className="text-xs font-bold text-slate-900 tabular-nums mt-1">
                      {currentSub.multipleChoiceStats?.correct || 0} Benar · {currentSub.multipleChoiceStats?.wrong || 0} Salah
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[11px] font-medium text-slate-700">Status Peninjauan</div>
                    <div
                      className={`text-xs font-bold mt-1 ${
                        currentSub.status === 'NEEDS_REVIEW'
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {currentSub.status === 'NEEDS_REVIEW'
                        ? 'Perlu Verifikasi'
                        : 'Terverifikasi'}
                    </div>
                  </div>
                </div>

                {currentSub.manualOverrideReason && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-amber-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Catatan Penyesuaian Nilai oleh Guru:</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      "{currentSub.manualOverrideReason}"
                    </p>
                    <div className="text-[10px] text-amber-700">
                      Ditinjau oleh: {currentSub.reviewerName || 'Guru Pengampu'} pada{' '}
                      {currentSub.reviewedAt
                        ? new Date(currentSub.reviewedAt).toLocaleString('id-ID')
                        : '-'}
                    </div>
                  </div>
                )}
              </div>

              {/* Scanned Answer Sheet Preview */}
              {currentSub.files && currentSub.files.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Foto Lembar Jawaban Siswa Asli (Pindaian)
                    </h3>
                    <span className="text-[11px] text-slate-700">
                      Halaman 1 dari {currentSub.files.length}
                    </span>
                  </div>
                  <div className="bg-slate-100 rounded-lg border border-slate-200 p-2 flex justify-center max-h-[380px] overflow-hidden">
                    <img
                      src={currentSub.files[0].storageUrl || '/src/assets/images/sample_answer_sheet_1793153724076.jpg'}
                      alt="Lembar Jawaban Siswa"
                      referrerPolicy="no-referrer"
                      className="max-h-[360px] object-contain shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Question by Question Detailed Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Rincian Penilaian Per Butir Soal &amp; Bukti AI
                </h3>

                {currentSub.answers.map((ans) => (
                  <div
                    key={ans.id}
                    className={`bg-white rounded-xl border p-5 space-y-3 transition-colors ${
                      ans.reviewRequired
                        ? 'border-amber-300 ring-1 ring-amber-100'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs tabular-nums">
                          {ans.questionNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {ans.questionType === 'MULTIPLE_CHOICE'
                            ? 'Pilihan Ganda'
                            : 'Esai Berbobot Rubrik'}
                        </span>
                        {ans.isSimulatedDemo && (
                          <span className="text-[10px] text-blue-600 font-semibold px-2 py-0.5 bg-blue-50 rounded">
                            [SIMULASI / DEMO]
                          </span>
                        )}
                        {ans.reviewRequired && (
                          <span className="text-[10px] text-amber-800 font-semibold px-2 py-0.5 bg-amber-100 rounded">
                            Perlu Review Guru
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tabular-nums">
                        <span>Skor:</span>
                        <span className="text-blue-700">{ans.score}</span>
                        <span className="text-slate-700">/ {ans.maxScore}</span>
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="text-xs text-slate-900 font-medium leading-relaxed">
                      {ans.questionText}
                    </div>

                    {/* Student Answer */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-700">
                        Jawaban Siswa yang Dikenali:
                      </div>
                      <div className="text-xs text-slate-800 italic">
                        "{ans.recognizedAnswer || ans.studentAnswerRaw || '(Kosong)'}"
                      </div>
                    </div>

                    {/* If Essay: Criterion breakdown */}
                    {ans.criterionScores && ans.criterionScores.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-xs font-semibold text-slate-700">
                          Penilaian Per Kriteria Rubrik:
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {ans.criterionScores.map((crit, cIdx) => (
                            <div
                              key={crit.criterionId || cIdx}
                              className="p-3 bg-slate-50/70 border border-slate-200 rounded-md text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-900">
                                <span>{crit.criterionName}</span>
                                <span className="tabular-nums text-blue-700 font-bold">
                                  {crit.score} / {crit.maxScore} pt
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-700">
                                <span className="font-medium text-slate-700">Bukti:</span> {crit.evidence}
                              </div>
                              <div className="text-[11px] text-slate-700">
                                <span className="font-medium text-slate-700">Alasan:</span> {crit.rationale}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Feedback & Suggestions */}
                    {ans.explanation && (
                      <div className="pt-1 text-xs text-slate-700 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-900">Penjelasan Evaluasi:</span>{' '}
                          {ans.explanation}
                        </div>
                        {ans.correction && (
                          <div className="text-slate-800">
                            <span className="font-semibold text-slate-900">Konsep Penguat:</span>{' '}
                            {ans.correction}
                          </div>
                        )}
                        {ans.suggestions && (
                          <div className="text-blue-700">
                            <span className="font-semibold text-blue-900">Saran Pembelajaran:</span>{' '}
                            {ans.suggestions}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Teacher Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Penyesuaian Nilai Manual oleh Guru
              </h3>
              <button
                onClick={() => setShowOverrideModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {overrideError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {overrideError}
              </div>
            )}

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nilai Akhir Baru (0 - {currentSub?.maxScore || 100})
                </label>
                <input
                  type="number"
                  min="0"
                  max={currentSub?.maxScore || 100}
                  step="0.5"
                  required
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold tabular-nums focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Penyesuaian Nilai <span className="text-red-500">* (Wajib diisi untuk audit)</span>
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={5}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Jelaskan alasan profesional penyesuaian (misal: tulisan tangan tipis namun konsep tepat saat dicek fisik)..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={overrideSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {overrideSubmitting ? 'Menyimpan...' : 'Simpan & Rekam Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
