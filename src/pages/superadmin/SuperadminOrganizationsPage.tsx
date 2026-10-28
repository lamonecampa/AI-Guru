import React, { useEffect, useState } from 'react';
import { Building, Plus, CheckCircle, XCircle, Search, Edit3, Shield, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [quotaInput, setQuotaInput] = useState<number>(500);
  const [planInput, setPlanInput] = useState<string>('SEKOLAH_MANDIRI');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/organizations');
      setOrganizations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (orgId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await apiClient.request(`/api/superadmin/organizations/${orgId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrgs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setIsSaving(true);
    try {
      await apiClient.request(`/api/superadmin/organizations/${editingOrg.id}/quota`, {
        method: 'PATCH',
        body: JSON.stringify({ quotaLimit: Number(quotaInput), planType: planInput }),
      });
      setMessage(`Alokasi kuota & paket untuk ${editingOrg.name} berhasil diperbarui.`);
      setEditingOrg(null);
      loadOrgs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = organizations.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.npsn && o.npsn.includes(search)) ||
      (o.city && o.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manajemen Organisasi / Satuan Pendidikan Pelanggan
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan status aktivasi, penyesuaian kuota koreksi bulanan, dan isolasi tenant per sekolah.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-950/60 text-emerald-300 rounded-lg text-xs border border-emerald-800">
          {message}
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari sekolah berdasarkan nama, NPSN, kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>
        <div className="text-xs text-slate-400">
          Total: <strong className="text-white">{filtered.length}</strong> institusi terdaftar
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Sekolah</th>
                <th className="px-4 py-3">NPSN</th>
                <th className="px-4 py-3">Paket Lisensi</th>
                <th className="px-4 py-3">Penggunaan Kuota</th>
                <th className="px-4 py-3">Guru &amp; Siswa</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Memuat daftar organisasi...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada organisasi yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((org) => {
                  const quotaPercent = Math.min(100, Math.round((org.quotaUsed / org.quotaLimit) * 100));
                  const isSuspended = org.status === 'SUSPENDED';

                  return (
                    <tr key={org.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{org.name}</div>
                        <div className="text-[11px] text-slate-500">{org.city || 'DKI Jakarta'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{org.npsn || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-semibold">
                          {org.planType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-bold text-white">{org.quotaUsed}</span> / {org.quotaLimit} lembar ({quotaPercent}%)
                        </div>
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${quotaPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {org.teacherCount || 0} Guru · {org.studentCount || 0} Siswa
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isSuspended
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {isSuspended ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          <span>{isSuspended ? 'Ditangguhkan' : 'Aktif'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingOrg(org);
                              setQuotaInput(org.quotaLimit);
                              setPlanInput(org.planType);
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium"
                          >
                            Atur Kuota
                          </button>
                          <button
                            onClick={() => handleToggleStatus(org.id, org.status)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                              isSuspended
                                ? 'border-emerald-800 text-emerald-400 hover:bg-emerald-950'
                                : 'border-red-800 text-red-400 hover:bg-red-950'
                            }`}
                          >
                            {isSuspended ? 'Aktifkan' : 'Tangguhkan'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Quota */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-800 space-y-4 text-white">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm">Sesuaikan Kuota &amp; Paket Sekolah</h3>
              <button
                onClick={() => setEditingOrg(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdateQuota} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Sekolah Terpilih</label>
                <div className="font-bold text-white text-sm">{editingOrg.name}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Paket Layanan</label>
                <select
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="FREE_TRIAL">Paket Uji Coba Guru (100 Lembar)</option>
                  <option value="SEKOLAH_MANDIRI">Paket Sekolah Mandiri (1.500 Lembar)</option>
                  <option value="TERPADU_DINAS">Paket Terpadu Instansi / Dinas (10.000 Lembar)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Batas Kuota Koreksi (Lembar / Bulan)</label>
                <input
                  type="number"
                  min="50"
                  max="100000"
                  step="50"
                  required
                  value={quotaInput}
                  onChange={(e) => setQuotaInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-3.5 py-1.5 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-800 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Kuota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
