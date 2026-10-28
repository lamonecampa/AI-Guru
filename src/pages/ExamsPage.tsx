import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Clock, Calendar, CheckCircle, Edit, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ExamModel } from '../types/index.ts';

interface ExamsPageProps {
  onSelectExamQuestions: (examId: string) => void;
}

export const ExamsPage: React.FC<ExamsPageProps> = ({ onSelectExamQuestions }) => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Kelas 9 SMP');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [semester, setSemester] = useState<'Ganjil' | 'Genap'>('Ganjil');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [passingScore, setPassingScore] = useState(75);
  const [description, setDescription] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resExams, resClasses]: any = await Promise.all([
        apiClient.request('/api/exams'),
        apiClient.request('/api/classes'),
      ]);
      setExams(resExams.data || []);
      setClasses(resClasses.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await apiClient.request('/api/exams', {
        method: 'POST',
        body: JSON.stringify({
          title,
          subject,
          gradeLevel,
          academicYear,
          semester,
          examDate,
          durationMinutes: Number(durationMinutes),
          maxScore: 100,
          passingScore: Number(passingScore),
          description,
          assignedClassIds: selectedClassIds,
        }),
      });
      setShowCreateModal(false);
      // Reset
      setTitle('');
      setSubject('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membuat paket ujian.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (exam: ExamModel) => {
    const nextStatus = exam.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED';
    try {
      await apiClient.request(`/api/exams/${exam.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Bank Ujian &amp; Paket Soal
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Kelola paket ujian, kunci jawaban deterministik pilihan ganda, dan rubrik esai kurikulum sekolah.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Paket Ujian Baru</span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-100 rounded-xl animate-pulse"></div>
          <div className="h-44 bg-slate-100 rounded-xl animate-pulse"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">Belum ada ujian dibuat</h3>
          <p className="text-xs text-slate-700 max-w-sm mx-auto">
            Mulailah dengan membuat paket ujian pertama Anda, tetapkan kunci jawaban dan rubrik penilaian esai.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium inline-block"
          >
            Buat Ujian Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    {exam.subject}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      exam.status === 'PUBLISHED'
                        ? 'text-emerald-700'
                        : exam.status === 'DRAFT'
                        ? 'text-amber-700'
                        : 'text-slate-700'
                    }`}
                  >
                    {exam.status === 'PUBLISHED'
                      ? 'Dipublikasikan'
                      : exam.status === 'DRAFT'
                      ? 'Draf'
                      : 'Diarsipkan'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-700 line-clamp-2">
                  {exam.description || 'Tidak ada deskripsi tambahan.'}
                </p>

                {/* Unboxed Metadata with typographic separators */}
                <div className="flex items-center gap-2 text-xs text-slate-700 pt-1 flex-wrap">
                  <span>{exam.gradeLevel}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>Semester {exam.semester} {exam.academicYear}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="tabular-nums">KKM: {exam.passingScore}</span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="tabular-nums">{exam.totalQuestions || 0} Soal</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(exam)}
                    className="text-xs text-slate-700 hover:text-slate-900 font-medium px-2.5 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                  >
                    {exam.status === 'PUBLISHED' ? 'Arsipkan' : 'Publikasikan'}
                  </button>
                </div>

                <button
                  onClick={() => onSelectExamQuestions(exam.id)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Edit Soal &amp; Rubrik</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Buat Paket Ujian Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Asesmen Sumatif Akhir Semester IPA Biologi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: IPA / Matematika"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenjang / Tingkat
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={(e: any) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    KKM (Passing)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi / Cakupan Materi
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan Capaian Pembelajaran atau petunjuk pengerjaan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tetapkan ke Kelas
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {classes.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-2 p-2 border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedClassIds.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClassIds([...selectedClassIds, cls.id]);
                          } else {
                            setSelectedClassIds(selectedClassIds.filter((id) => id !== cls.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-slate-800 text-xs">{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Lanjutkan ke Soal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
