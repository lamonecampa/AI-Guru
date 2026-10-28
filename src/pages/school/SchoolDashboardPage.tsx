import React, { useEffect, useState } from 'react';
import {
  Users2,
  GraduationCap,
  Users,
  FileCheck2,
  CheckCircle,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

interface SchoolDashboardProps {
  onNavigate: (path: string) => void;
}

export const SchoolDashboardPage: React.FC<SchoolDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/school/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
        Memuat data dasbor sekolah...
      </div>
    );
  }

  const quotaPercent = data ? Math.min(100, Math.round((data.quotaUsed / data.quotaLimit) * 100)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-700/80 rounded-full text-[11px] font-semibold text-emerald-200">
              NPSN: {data?.organization?.npsn || '20104567'}
            </span>
            <span className="text-emerald-300 text-xs">· Terakreditasi A</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {data?.organization?.name || 'SMP Negeri 1 Nusantara Jakarta'}
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Portal eksekutif pengelolaan guru, rombongan belajar, data siswa, dan monitoring asesmen sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/school/teachers')}
            className="px-3.5 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun Guru</span>
          </button>
          <button
            onClick={() => onNavigate('/school/subscription')}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Kelola Kuota</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Total Tenaga Pendidik</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data?.totalTeachers || 0}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Guru Aktif</span>
          </div>
          <button
            onClick={() => onNavigate('/school/teachers')}
            className="mt-3 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
          >
            <span>Kelola Guru &amp; Akun</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Rombongan Belajar</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data?.totalClasses || 0}</span>
            <span className="text-[11px] text-slate-500">Kelas</span>
          </div>
          <button
            onClick={() => onNavigate('/school/classes')}
            className="mt-3 text-[11px] text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <span>Daftar Kelas &amp; Wali</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Peserta Didik Terdata</span>
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data?.totalStudents || 0}</span>
            <span className="text-[11px] text-slate-500">Siswa Aktif</span>
          </div>
          <button
            onClick={() => onNavigate('/school/students')}
            className="mt-3 text-[11px] text-indigo-700 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <span>Lihat Basis Data Siswa</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500">Lembar Jawaban Dinilai</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{data?.totalSubmissions || 0}</span>
            <span className="text-[11px] text-emerald-600 font-medium">{data?.passRatePercent || 0}% Tuntas</span>
          </div>
          <button
            onClick={() => onNavigate('/school/reports')}
            className="mt-3 text-[11px] text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
          >
            <span>Laporan Nilai Sekolah</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Quota & Subscription Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Alokasi Kuota Koreksi AI Sekolah</h2>
            <p className="text-xs text-slate-500">
              Paket aktif: <span className="font-semibold text-slate-700">{data?.organization?.planType || 'SEKOLAH_MANDIRI'}</span> (Diperbarui berkala)
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Penggunaan Kuota: </span>
            <span className="text-xs font-bold text-slate-900">{data?.quotaUsed || 0} / {data?.quotaLimit || 500} Lembar</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
          <span>Tersisa: {Math.max(0, (data?.quotaLimit || 500) - (data?.quotaUsed || 0))} lembar</span>
          <button
            onClick={() => onNavigate('/school/subscription')}
            className="text-emerald-700 hover:underline font-semibold"
          >
            Tingkatkan Kuota Lembaga &rarr;
          </button>
        </div>
      </div>

      {/* Recent Teachers & School Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teachers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Daftar Guru Pengajar ({data?.totalTeachers || 0})
            </h3>
            <button
              onClick={() => onNavigate('/school/teachers')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentTeachers || []).map((t: any) => (
              <div key={t.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{t.fullName}</div>
                  <div className="text-[11px] text-slate-500">{t.email} {t.nip ? `· NIP: ${t.nip}` : ''}</div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                  t.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.isActive ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* School Exams Monitoring */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Asesmen yang Sedang Berjalan ({data?.totalExams || 0})
            </h3>
            <button
              onClick={() => onNavigate('/school/exams')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Monitoring Ujian
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentExams || []).map((e: any) => (
              <div key={e.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{e.title}</div>
                  <div className="text-[11px] text-slate-500">{e.subject} · {e.gradeLevel} · Guru: {e.creatorName}</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full border border-blue-200 font-medium">
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
