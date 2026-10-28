import React, { useEffect, useState } from 'react';
import { Settings, Building, Save, Shield, CheckCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SchoolSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    name: '',
    npsn: '',
    address: '',
    city: '',
    province: '',
    phone: '',
    postalCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/school/dashboard');
      if (res.data?.organization) {
        setFormData({
          name: res.data.organization.name || '',
          npsn: res.data.organization.npsn || '',
          address: res.data.organization.address || '',
          city: res.data.organization.city || '',
          province: res.data.organization.province || '',
          phone: res.data.organization.phone || '',
          postalCode: res.data.organization.postalCode || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await apiClient.request('/api/school/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      setMessage('Pengaturan profil sekolah berhasil disimpan ke basis data.');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Memuat pengaturan sekolah...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pengaturan Profil &amp; Lembaga Sekolah
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi identitas resmi lembaga, nomor pokok sekolah nasional (NPSN), dan parameter penilaian sekolah.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-700" />
          <span>Identitas Satuan Pendidikan</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Nama Resmi Sekolah</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
            <input
              type="text"
              required
              value={formData.npsn}
              onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon Sekolah</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Alamat Lembaga</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Profil Sekolah'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
