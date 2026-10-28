import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Zap, Building, HelpCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SchoolSubscriptionPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/school/subscription');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 animate-pulse">Memuat data langganan...</div>;
  }

  const quotaPercent = data ? Math.min(100, Math.round((data.quotaUsed / data.quotaLimit) * 100)) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Langganan &amp; Alokasi Kuota Lembaga
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Informasi paket berlangganan komersial, batas pemrosesan lembar jawaban AI Gemini, dan riwayat faktur institusi.
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Paket Aktif Sekolah
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              {data?.planType === 'TERPADU_DINAS'
                ? 'Paket Terpadu Instansi / Dinas'
                : data?.planType === 'SEKOLAH_MANDIRI'
                ? 'Paket Sekolah Mandiri'
                : 'Paket Uji Coba'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Institusi: <strong className="text-slate-800">{data?.organizationName}</strong> · Periode aktif s.d. {data?.renewalDate}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-slate-900">
              {data?.planType === 'TERPADU_DINAS'
                ? 'Rp1.850.000'
                : data?.planType === 'SEKOLAH_MANDIRI'
                ? 'Rp450.000'
                : 'Gratis'}
              <span className="text-xs font-normal text-slate-500"> / bulan</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Status Pembayaran: Aktif / Terverifikasi</span>
          </div>
        </div>

        {/* Quota Progress */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Penggunaan Kuota Koreksi AI Bulan Ini:</span>
            <span className="font-bold text-slate-900">
              {data?.quotaUsed} / {data?.quotaLimit} Lembar ({quotaPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quotaPercent > 85 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
            <span>Sisa kuota: {data?.quotaRemaining} lembar</span>
            <span>Reset kuota otomatis: 1 bulan dari aktivasi</span>
          </div>
        </div>
      </div>

      {/* Available Plans for Upgrade */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Pilihan Paket Lisensi Sekolah
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Paket Guru Mandiri</h4>
              <div className="text-xl font-bold text-slate-900 mt-2">
                Rp0 <span className="text-xs font-normal text-slate-500">/ selamanya</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Untuk uji coba mandiri guru dengan batas kuota kecil.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100 lembar koreksi/bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>OCR lembar jawaban standar</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ekspor CSV</span>
                </li>
              </ul>
            </div>
            <button
              disabled
              className="w-full py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"
            >
              Paket Uji Coba
            </button>
          </div>

          <div className="bg-white rounded-xl border-2 border-emerald-600 p-6 flex flex-col justify-between space-y-4 shadow-sm relative">
            <span className="absolute -top-3 right-4 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase">
              Paket Sekolah Anda
            </span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Paket Sekolah Mandiri</h4>
              <div className="text-xl font-bold text-slate-900 mt-2">
                Rp450.000 <span className="text-xs font-normal text-slate-500">/ bulan</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Paling populer untuk SMP &amp; SMA berstandar nasional.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900">1.500 lembar koreksi/bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manajemen multi-guru &amp; rombel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penilaian esai berbobot rubrik AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ekspor Excel &amp; analisis remedial</span>
                </li>
              </ul>
            </div>
            <button className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs">
              Perpanjang Otomatis Aktif
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Paket Terpadu Instansi / Dinas</h4>
              <div className="text-xl font-bold text-slate-900 mt-2">
                Rp1.850.000 <span className="text-xs font-normal text-slate-500">/ bulan</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Untuk yayasan besar atau kemitraan dinas pendidikan.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-900">10.000 lembar koreksi/bulan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-sekolah &amp; agregasi yayasan</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Integrasi sinkronisasi Dapodik</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dukungan prioritas &amp; SLA 99.9%</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => alert('Permintaan upgrade ke Paket Terpadu Instansi telah dicatat untuk perwakilan sekolah Anda.')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              Ajukan Upgrade Paket
            </button>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Riwayat Pembayaran &amp; Faktur Pajak Sekolah
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">No. Faktur</th>
                <th className="px-4 py-2.5">Tanggal</th>
                <th className="px-4 py-2.5">Rincian Paket</th>
                <th className="px-4 py-2.5">Nominal (IDR)</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.invoiceHistory || []).map((inv: any) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                  <td className="px-4 py-3 text-slate-800">{inv.plan}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    Rp{inv.amountIdr.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
