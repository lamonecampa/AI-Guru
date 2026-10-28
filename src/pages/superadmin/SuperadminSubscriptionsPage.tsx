import React, { useEffect, useState } from 'react';
import { CreditCard, Building, CheckCircle2, DollarSign, Calendar, Search } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminSubscriptionsPage: React.FC = () => {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/subscriptions');
      setSubs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalMrr = subs.reduce((acc, s) => acc + (s.mrrIdr || 0), 0);

  const filteredSubs = subs.filter(
    (s) =>
      s.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      s.planType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Manajemen Langganan Komersial Seluruh Sekolah
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monitoring Monthly Recurring Revenue (MRR), status penagihan institusi, dan masa aktif lisensi.
          </p>
        </div>
      </div>

      {/* MRR Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400">Total MRR Berjalan Platform</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            Rp{totalMrr.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dari sekolah berlangganan aktif</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400">Institusi Berbayar</span>
          <div className="text-2xl font-bold text-white mt-1">
            {subs.filter((s) => s.mrrIdr > 0).length} Sekolah
          </div>
          <span className="text-[11px] text-indigo-400 mt-1 block">Tingkat retensi: 100%</span>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-400">Uji Coba Mandiri</span>
          <div className="text-2xl font-bold text-white mt-1">
            {subs.filter((s) => s.mrrIdr === 0).length} Akun
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Calon konversi sekolah</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Sekolah</th>
                <th className="px-4 py-3">Paket Langganan</th>
                <th className="px-4 py-3">Nilai MRR (IDR)</th>
                <th className="px-4 py-3">Penggunaan Kuota</th>
                <th className="px-4 py-3">Jatuh Tempo Perpanjangan</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredSubs.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-850/60">
                  <td className="px-4 py-3 font-semibold text-white">{s.organizationName}</td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{s.planType}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                    {s.mrrIdr > 0 ? `Rp${s.mrrIdr.toLocaleString('id-ID')}` : 'Gratis'}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {s.quotaUsed} / {s.quotaLimit} Lembar
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{s.renewalDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                      LUNAS / AKTIF
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
