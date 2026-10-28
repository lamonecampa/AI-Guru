import React, { useEffect, useState } from 'react';
import { Plus, Search, UploadCloud, Users, CheckCircle, FileText } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ClassModel, StudentModel } from '../types/index.ts';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentModel[]>([]);
  const [classes, setClasses] = useState<ClassModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Add form
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [formClassId, setFormClassId] = useState('');

  // CSV import
  const [csvContent, setCsvContent] = useState('');
  const [csvClassId, setCsvClassId] = useState('');
  const [csvSuccessMsg, setCsvSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedClassId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const classRes: any = await apiClient.request('/api/classes');
      const classList = classRes.data || [];
      setClasses(classList);

      let url = '/api/students';
      const params = new URLSearchParams();
      if (selectedClassId) params.append('classId', selectedClassId);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res: any = await apiClient.request(url);
      setStudents(res.data || []);
      if (classList.length > 0 && !formClassId) {
        setFormClassId(classList[0].id);
        setCsvClassId(classList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.request('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          classId: formClassId,
          nisn,
          nis,
          fullName,
          gender,
        }),
      });
      setShowAddModal(false);
      setFullName('');
      setNis('');
      setNisn('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan siswa.');
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await apiClient.request('/api/students/import-csv', {
        method: 'POST',
        body: JSON.stringify({
          classId: csvClassId,
          csvContent,
        }),
      });
      setCsvSuccessMsg(`Berhasil mengimpor ${res.count} siswa baru.`);
      setTimeout(() => {
        setCsvSuccessMsg('');
        setShowCsvModal(false);
        setCsvContent('');
        loadData();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Gagal mengimpor CSV.');
    }
  };

  const sampleCsvTemplate = `NISN,NIS,Nama Lengkap,Jenis Kelamin (L/P)
0089201930,240910,Putra Pratama,L
0089201931,240911,Aulia Rahma,P
0089201932,240912,Dimas Prasetyo,L`;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Daftar Peserta Didik (Siswa)
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Basis data peserta didik terdaftar dengan nomor induk resmi (NIS &amp; NISN) untuk pencocokan lembar ujian.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setCsvContent(sampleCsvTemplate);
              setShowCsvModal(true);
            }}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Impor CSV Siswa</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau NISN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-700 font-medium whitespace-nowrap">Filter Kelas:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden"
          >
            <option value="">Semua Rombel Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-700 animate-pulse">
            Memuat daftar siswa...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-700 space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700">Tidak ada siswa ditemukan</div>
            <p className="text-[11px] text-slate-700">
              Ubah kriteria pencarian atau tambahkan siswa baru.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">L/P</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {st.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                    {st.nis}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                    {st.nisn}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {st.className || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {st.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Peserta Didik</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rombel Kelas</label>
                <select
                  value={formClassId}
                  onChange={(e) => setFormClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rizky"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Sekolah)</label>
                  <input
                    type="text"
                    required
                    placeholder="240915"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN (Nasional)</label>
                  <input
                    type="text"
                    required
                    placeholder="0089201930"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'L'}
                      onChange={() => setGender('L')}
                    />
                    <span>Laki-laki</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'P'}
                      onChange={() => setGender('P')}
                    />
                    <span>Perempuan</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Impor Masal Data Siswa (CSV)</h3>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {csvSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{csvSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleImportCsv} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kelas Tujuan</label>
                <select
                  value={csvClassId}
                  onChange={(e) => setCsvClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Format Teks CSV (Baris 1 = Header)
                </label>
                <textarea
                  rows={6}
                  required
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                >
                  Mulai Impor CSV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
