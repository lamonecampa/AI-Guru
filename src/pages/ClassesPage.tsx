import React, { useEffect, useState } from 'react';
import { Plus, GraduationCap, Users, Calendar } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ClassModel } from '../types/index.ts';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Kelas 9');
  const [academicYear, setAcademicYear] = useState('2026/2027');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/classes');
      setClasses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await apiClient.request('/api/classes', {
        method: 'POST',
        body: JSON.stringify({ name, gradeLevel, academicYear }),
      });
      setShowModal(false);
      setName('');
      loadClasses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan kelas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Rombongan Belajar (Kelas)
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Daftar kelas aktif, wali kelas, dan jumlah peserta didik untuk distribusi lembar ujian.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-700 animate-pulse">
            Memuat data kelas...
          </div>
        ) : classes.length === 0 ? (
          <div className="col-span-3 bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-700">
            Belum ada kelas terdaftar. Klik tombol Tambah Kelas Baru di atas.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
                    {cls.gradeLevel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {cls.name}
                  </h3>
                </div>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Tahun Ajaran:</span>
                  <span className="font-semibold text-slate-900">{cls.academicYear}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wali / Guru Pengampu:</span>
                  <span className="font-semibold text-slate-900">{cls.teacherName || 'Belum diatur'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Jumlah Siswa Terdaftar:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{cls.studentCount} siswa</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Kelas Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-md">{errorMsg}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kelas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: IX-C atau XI-MIPA-1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat / Jenjang</label>
                <input
                  type="text"
                  required
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
