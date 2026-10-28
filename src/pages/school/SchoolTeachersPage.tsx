import React, { useEffect, useState } from 'react';
import { Users2, UserPlus, CheckCircle, XCircle, Search, Mail, Shield } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SchoolTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', nip: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/school/teachers');
      setTeachers(res.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    try {
      await apiClient.request('/api/school/teachers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setMessage({ type: 'success', text: `Akun guru untuk ${formData.fullName} berhasil ditambahkan.` });
      setFormData({ fullName: '', email: '', nip: '' });
      setShowAddModal(false);
      loadTeachers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal menambahkan guru.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (teacherId: string, currentStatus: boolean) => {
    try {
      await apiClient.request(`/api/school/teachers/${teacherId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      loadTeachers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      (t.nip && t.nip.includes(search))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Manajemen Tenaga Pendidik &amp; Guru
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun guru pengajar, hak akses koreksi asesmen, dan penugasan kelas di sekolah Anda.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Guru Baru</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari guru berdasarkan nama, email, NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-500 self-end sm:self-center">
          Menampilkan <strong className="text-slate-900">{filteredTeachers.length}</strong> guru terdaftar
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Email Akun</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Peran Sistem</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Memuat daftar guru...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada guru yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{t.fullName}</td>
                    <td className="px-4 py-3 text-slate-600">{t.email}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{t.nip || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.role === 'SCHOOL_ADMIN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {t.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {t.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{t.isActive ? 'Aktif' : 'Non-Aktif'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.role !== 'SCHOOL_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(t.id, t.isActive)}
                          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                            t.isActive
                              ? 'border-red-200 text-red-700 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {t.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Teacher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Tambah Akun Guru Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Siti Nurhaliza, M.Pd."
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi Sekolah / Akun</label>
                <input
                  type="email"
                  required
                  placeholder="nama.guru@sekolah.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Induk Pegawai (NIP)</label>
                <input
                  type="text"
                  placeholder="198403152008012004 (Opsional)"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                Kata sandi default untuk akun baru adalah: <code className="font-mono font-bold text-slate-800">GuruHebat2026!</code>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun Guru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
