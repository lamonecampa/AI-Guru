import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Zap, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';

export const BillingPage: React.FC = () => {
  const [billingData, setBillingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const res: any = await apiClient.request('/api/billing');
      setBillingData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quotaPercent = Math.min(
    100,
    Math.round(((billingData?.quotaUsed || 0) / (billingData?.quotaLimit || 100)) * 100)
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Tagihan &amp; Kuota Koreksi AI Sekolah
        </h1>
        <p className="text-xs text-slate-700 mt-1">
          Pantau konsumsi kuota lembar jawaban dan kelola paket langganan institusi pendidikan Anda.
        </p>
      </div>

      {/* Current Quota Consumption Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">
              PAKET AKTIF: {billingData?.planType || 'SEKOLAH_MANDIRI'}
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {billingData?.organizationName || 'SMP Negeri 1 Nusantara Jakarta'}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-700">Periode Berjalan Sampai:</span>
            <div className="text-xs font-bold text-slate-900">31 Desember 2026</div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-700">Pemakaian Kuota Lembar Koreksi Bulan Ini:</span>
            <span className="text-slate-900 tabular-nums">
              {billingData?.quotaUsed || 0} / {billingData?.quotaLimit || 500} lembar ({quotaPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                quotaPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>
          <div className="text-[11px] text-slate-700 flex justify-between pt-0.5">
            <span>Sisa kuota: {billingData?.quotaRemaining || 0} lembar</span>
            <span>Kuota diperbarui setiap tanggal 1</span>
          </div>
        </div>
      </div>

      {/* Payment Gateway Transparent Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Informasi Integrasi Pembayaran (Payment Gateway Abstraction)</span>
        </div>
        <p className="leading-relaxed">
          {billingData?.paymentNotice ||
            'Mode simulasi aktif. Untuk transaksi komersial langsung, modul pembayaran dapat dihubungkan ke gateway resmi seperti Midtrans atau Xendit (QRIS, Virtual Account BCA/Mandiri/BRI).'}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Pilihan Paket Berlangganan AI Teacher Grader
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {billingData?.availablePlans?.map((plan: any) => {
            const isCurrent = plan.id === billingData?.planType;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between space-y-5 transition-colors ${
                  isCurrent ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                      Paket Aktif Anda
                    </span>
                  )}
                  <h3 className="text-base font-bold text-slate-900">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 tabular-nums">
                      {plan.priceIdr === 0
                        ? 'Gratis'
                        : `Rp ${plan.priceIdr.toLocaleString('id-ID')}`}
                    </span>
                    {plan.priceIdr > 0 && (
                      <span className="text-xs text-slate-700">/ bulan</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-800">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kuota {plan.quota.toLocaleString('id-ID')} lembar / bulan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Koreksi PG deterministik &amp; esai AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Cetak KOP Surat &amp; Ekspor CSV</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isCurrent}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-700 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Sedang Digunakan' : 'Pilih Paket Ini'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
