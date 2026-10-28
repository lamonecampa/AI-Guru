import React, { useEffect, useState } from 'react';
import { Sliders, Save, Shield, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    maintenanceMode: false,
    activeModel: 'gemini-2.5-flash',
    maxUploadMb: 30,
    concurrencyLimit: 10,
    autoApproveAboveConfidence: 0.95,
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
      const res: any = await apiClient.request('/api/superadmin/settings');
      if (res.data) setSettings(res.data);
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
      await apiClient.request('/api/superadmin/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      setMessage('Konfigurasi operasional platform nasional berhasil diperbarui.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Konfigurasi Global &amp; Kebijakan Platform
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Parameter operasional backend, pemilihan model inferensi Gemini, batas ukuran payload foto, dan konkurensi antrean.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-950/60 text-emerald-300 rounded-lg text-xs border border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6 text-xs text-slate-300">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Mesin Inferensi AI Gemini</span>
          </h2>

          <div>
            <label className="block font-semibold text-white mb-1">Model Gemini yang Digunakan</label>
            <select
              value={settings.activeModel}
              onChange={(e) => setSettings({ ...settings, activeModel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 font-mono"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Direkomendasikan: Super cepat, hemat biaya, akurat)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Analisis penalaran mendalam untuk rubrik kompleks)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-white mb-1">Batas Maksimal Berkas Foto (MB)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={settings.maxUploadMb}
                onChange={(e) => setSettings({ ...settings, maxUploadMb: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 30 MB (Mendukung resolusi kamera ponsel tinggi)</span>
            </div>

            <div>
              <label className="block font-semibold text-white mb-1">Maksimal Koreksi Konkuren per Worker</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.concurrencyLimit}
                onChange={(e) => setSettings({ ...settings, concurrencyLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Mencegah throttling rate-limit API</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Kesiapan Layanan &amp; Pemeliharaan</span>
          </h2>

          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <div className="font-semibold text-white">Mode Pemeliharaan (Maintenance Mode)</div>
              <div className="text-[11px] text-slate-400">
                Jika diaktifkan, portal guru dan sekolah akan menampilkan halaman pemberitahuan terjadwal.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi Platform'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
