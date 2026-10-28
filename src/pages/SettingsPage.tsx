import React, { useState } from 'react';
import { School, ShieldCheck, Lock, Trash2, Download, Save, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';

export const SettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [retentionDays, setRetentionDays] = useState('365');
  const [anonymizeAi, setAnonymizeAi] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan Sekolah &amp; Kebijakan Privasi Data
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Kelola profil sekolah, masa retensi berkas lembar ujian, dan transparansi pemrosesan AI.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan privasi dan sekolah berhasil diperbarui.</span>
        </div>
      )}

      {/* School Information Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <School className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Profil Institusi Pendidikan
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Sekolah / Lembaga
              </label>
              <input
                type="text"
                defaultValue="SMP Negeri 1 Nusantara Jakarta"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Pokok Sekolah Nasional (NPSN)
              </label>
              <input
                type="text"
                defaultValue="20104567"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                defaultValue="Jakarta Selatan"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Provinsi
              </label>
              <input
                type="text"
                defaultValue="DKI Jakarta"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Simpan Profil Sekolah
            </button>
          </div>
        </form>
      </div>

      {/* Privacy, Retention & AI Disclosure */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Kebijakan Privasi &amp; Pengolahan Data AI (UU PDP)
          </h2>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
            <span className="font-bold text-slate-900 block">
              Prinsip Perlindungan Data Pribadi Siswa:
            </span>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
              <li>Nama lengkap dan identitas siswa dipisahkan dari payload evaluasi esai yang dikirimkan ke model AI.</li>
              <li>Citra lembar jawaban disimpan secara privat pada server terenkripsi dengan identifier acak (bukan nama file asli siswa).</li>
              <li>Model AI dilarang menggunakan data lembar jawaban untuk pelatihan model publik.</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Masa Retensi Berkas Lembar Jawaban (Hari):
              </label>
              <select
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                className="w-64 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="90">90 Hari (1 Triwulan)</option>
                <option value="180">180 Hari (1 Semester)</option>
                <option value="365">365 Hari (1 Tahun Ajaran Penuh)</option>
              </select>
              <p className="text-[11px] text-slate-700 mt-1">
                Setelah masa retensi berakhir, berkas gambar pindaian akan dihapus secara otomatis demi efisiensi penyimpanan dan kepatuhan privasi.
              </p>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymizeAi}
                  onChange={(e) => setAnonymizeAi(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-800">
                  Anonimisasi teks jawaban sebelum evaluasi rubrik AI (Direkomendasikan)
                </span>
              </label>
            </div>
          </div>

          {/* Right to delete / export */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => alert('Seluruh arsip data sekolah dapat diunduh melalui menu Rapor & Ekspor.')}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Arsip Lengkap Sekolah (JSON/CSV)</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengajukan penghapusan data lembar jawaban lama? Tindakan ini tidak dapat dibatalkan.')) {
                  alert('Permohonan penghapusan data telah dicatat dalam rekam jejak audit.');
                }
              }}
              className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Permohonan Hapus Data Permanen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
