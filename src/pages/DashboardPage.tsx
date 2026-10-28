import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Award,
  Zap,
  ArrowRight,
  ScanLine,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { NavRoute } from '../components/Sidebar.tsx';

interface DashboardProps {
  onNavigate: (route: NavRoute) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
          <div className="h-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const quotaPercent = Math.min(
    100,
    Math.round(((stats?.quotaUsed || 0) / (stats?.quotaLimit || 100)) * 100)
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner with Generated School Image */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center space-y-4 z-10">
            <div className="text-xs font-semibold text-blue-300 tracking-wider">
              PLATFORM KOREKSI CERDAS INDONESIA
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">
              Koreksi Lembar Jawaban Otomatis dengan Transparansi Rubrik &amp; Verifikasi Guru
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
              Memadukan penilaian deterministik untuk pilihan ganda dan model evaluasi multimodal Gemini untuk esai tulisan tangan siswa sesuai Capaian Pembelajaran Kurikulum Nasional.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('scan-upload')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors whitespace-nowrap"
              >
                <ScanLine className="w-4 h-4" />
                <span>Pindai &amp; Unggah Lembar Jawaban</span>
              </button>
              <button
                onClick={() => onNavigate('exams')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Kelola Bank Soal</span>
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_school_grading_1793153723065.jpg"
              alt="Guru memeriksa lembar jawaban ujian siswa"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-medium">Total Ujian Aktif</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.totalExams || 0}
            </span>
            <span className="text-xs text-slate-700">paket soal</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700">
            Termasuk kunci jawaban &amp; rubrik esai
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-medium">Lembar Jawaban Dikoreksi</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.totalSubmissions || 0}
            </span>
            <span className="text-xs text-slate-700">lembar siswa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700">
            Tersimpan aman dengan rekam jejak audit
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-medium">Butuh Review Guru</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 tabular-nums">
              {stats?.pendingReviews || 0}
            </span>
            <span className="text-xs text-slate-700">lembar</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700">
            Ambang KKM atau tulisan ambigu
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-medium">Rata-rata Nilai Siswa</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">
              {stats?.averageScore || 0}
            </span>
            <span className="text-xs text-slate-700">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-700">
            Berdasarkan seluruh hasil penilaian tuntas
          </div>
        </div>
      </div>

      {/* Quota Progress & Quick Alert */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 w-full md:max-w-md">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span>Pemakaian Kuota Koreksi AI Sekolah:</span>
            <span className="font-semibold text-slate-900 tabular-nums">
              {stats?.quotaUsed || 0} / {stats?.quotaLimit || 100} ({quotaPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                quotaPercent > 80 ? 'bg-amber-500' : 'bg-blue-600'
              }`}
              style={{ width: `${quotaPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('billing')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>Kelola Paket Langganan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Grading Jobs & Submissions to Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grading Jobs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Antrean Koreksi Terbaru
            </h2>
            <button
              onClick={() => onNavigate('grading-queue')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Lihat Semua Antrean</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentJobs?.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-700">
                Belum ada proses koreksi yang sedang berlangsung.
              </div>
            ) : (
              stats?.recentJobs?.map((job: any) => (
                <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 truncate pr-4">
                    <div className="font-semibold text-slate-900 truncate">
                      {job.studentName}
                    </div>
                    <div className="text-[11px] text-slate-700 truncate">
                      {job.examTitle}
                    </div>
                    <div className="text-[10px] text-slate-700">
                      {job.currentStep}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-semibold tabular-nums ${
                        job.status === 'COMPLETED'
                          ? 'text-emerald-700'
                          : job.status === 'PROCESSING'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {job.progressPercentage}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submissions Requiring Attention */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Lembar Jawaban Perlu Tinjauan Guru
            </h2>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              <span>Buka Tinjauan Nilai</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentSubmissions?.filter((s: any) => s.status === 'NEEDS_REVIEW').length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-700">
                Semua lembar jawaban telah diverifikasi. Tidak ada yang tertunda.
              </div>
            ) : (
              stats?.recentSubmissions
                ?.filter((s: any) => s.status === 'NEEDS_REVIEW')
                .map((sub: any) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900">
                        {sub.studentName} ({sub.className})
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {sub.examTitle}
                      </div>
                      <div className="text-[10px] text-amber-700">
                        Skor: {sub.finalScore} / {sub.maxScore} (Ambang KKM)
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('results')}
                      className="px-2.5 py-1 text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
                    >
                      Periksa
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
