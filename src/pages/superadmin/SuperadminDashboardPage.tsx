import React, { useEffect, useState } from 'react';
import {
  Building,
  Users,
  Activity,
  Cpu,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Server,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

interface SuperadminDashboardProps {
  onNavigate: (path: string) => void;
}

export const SuperadminDashboardPage: React.FC<SuperadminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Memuat metrik konsol Superadmin...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Pusat Komando &amp; Operasional Platform Nasional
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pengawasan multi-tenant, kuota komersial institusi, konsumsi token Gemini 2.5 Flash, dan integritas privasi.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Metrik</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Institusi Terdaftar</span>
            <span className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800/60">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.totalOrganizations || 0}</span>
            <span className="text-[11px] text-emerald-400 font-medium">{stats?.activeOrganizations || 0} Aktif</span>
          </div>
          <button
            onClick={() => onNavigate('/superadmin/organizations')}
            className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <span>Kelola Sekolah &amp; Status</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Total Pengguna Global</span>
            <span className="p-2 bg-blue-950 text-blue-400 rounded-lg border border-blue-800/60">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</span>
            <span className="text-[11px] text-blue-400 font-medium">{stats?.totalTeachers || 0} Guru</span>
          </div>
          <button
            onClick={() => onNavigate('/superadmin/users')}
            className="mt-3 text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Daftar Pengguna Seluruh Sekolah</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Lembar Jawaban Dikoreksi</span>
            <span className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800/60">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.totalGradedPapers || 0}</span>
            <span className="text-[11px] text-slate-400">Lembar</span>
          </div>
          <button
            onClick={() => onNavigate('/superadmin/usage')}
            className="mt-3 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>Analisis Volume Koreksi</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400">Biaya Token AI Gemini</span>
            <span className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800/60">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              Rp{stats?.estimatedAiCostIdr?.toLocaleString('id-ID') || '0'}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">{stats?.geminiApiCalls || 0} Panggilan API</span>
          </div>
          <button
            onClick={() => onNavigate('/superadmin/ai-costs')}
            className="mt-3 text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
          >
            <span>Rincian Biaya &amp; Efisiensi</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-800/60 flex items-start gap-3 text-xs text-indigo-200">
        <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white block mb-0.5">Penegakan Kebijakan Privasi Siswa:</strong>
          Sebagai Superadmin Platform, Anda memiliki wewenang mengelola kuota, paket, dan status sekolah. Akses ke lembar jawaban siswa dan modifikasi nilai secara langsung dinonaktifkan secara ketat untuk melindungi integritas asesmen sekolah.
        </div>
      </div>

      {/* Quick Navigation to Core Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('/superadmin/organizations')}
          className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition-all hover:border-slate-700"
        >
          <Building className="w-5 h-5 text-indigo-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Kelola Organisasi / Sekolah</h3>
          <p className="text-xs text-slate-400 mt-1">
            Aktivasi, tangguhkan, sesuaikan kuota, atau buat sekolah pelanggan baru.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/superadmin/plans')}
          className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition-all hover:border-slate-700"
        >
          <Layers className="w-5 h-5 text-emerald-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Paket Layanan &amp; Kuota</h3>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi tier harga IDR, batasan kuota lembar per bulan, dan fitur premium.
          </p>
        </div>

        <div
          onClick={() => onNavigate('/superadmin/system-health')}
          className="p-5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl cursor-pointer transition-all hover:border-slate-700"
        >
          <Server className="w-5 h-5 text-amber-400 mb-2" />
          <h3 className="text-sm font-bold text-white">Kesehatan Sistem &amp; Antrean</h3>
          <p className="text-xs text-slate-400 mt-1">
            Monitor worker background jobs, latensi model Gemini, dan penggunaan memori server.
          </p>
        </div>
      </div>
    </div>
  );
};
