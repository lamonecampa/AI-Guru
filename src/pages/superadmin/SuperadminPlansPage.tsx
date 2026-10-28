import React, { useEffect, useState } from 'react';
import { Layers, Check, Shield, Plus, Edit2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/plans');
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manajemen Paket Layanan &amp; Kuota Platform
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi tier lisensi B2B/B2G sekolah di Indonesia, pembatasan lembar koreksi, dan harga langganan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold rounded-full">
                  ID: {p.id}
                </span>
                <span className="text-xs text-slate-400">{p.activeSubscribers} Sekolah Aktif</span>
              </div>

              <h3 className="text-base font-bold text-white mt-3">{p.name}</h3>
              <div className="mt-2 text-2xl font-bold text-white">
                {p.priceMonthlyIdr > 0 ? `Rp${p.priceMonthlyIdr.toLocaleString('id-ID')}` : 'Gratis'}
                <span className="text-xs font-normal text-slate-400"> / bulan</span>
              </div>

              <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-indigo-300 font-medium">
                Alokasi Kuota: {p.quotaPerMonth.toLocaleString()} lembar / bulan
              </div>

              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                {(p.features || []).map((f: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => alert(`Pengaturan tier ${p.name} tersinkronisasi dengan konfigurasi platform.`)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Ubah Parameter Paket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
