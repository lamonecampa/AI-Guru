import React, { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, Eye, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { GradingJobModel } from '../types/index.ts';

interface GradingQueuePageProps {
  onViewSubmission: (submissionId: string) => void;
}

export const GradingQueuePage: React.FC<GradingQueuePageProps> = ({
  onViewSubmission,
}) => {
  const [jobs, setJobs] = useState<GradingJobModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      const res: any = await apiClient.request('/api/grading-jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await apiClient.request(`/api/grading-jobs/${jobId}/retry`, { method: 'POST' });
      loadJobs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Antrean Pemrosesan Koreksi AI
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Status pemrosesan asinkron: validasi citra, OCR multimodal, pencocokan deterministik pilihan ganda, dan evaluasi rubrik esai.
          </p>
        </div>
        <button
          onClick={loadJobs}
          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Status</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-700 animate-pulse">
            Memuat antrean tugas...
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-700 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700">Tidak ada tugas aktif dalam antrean</div>
            <p className="text-[11px] text-slate-700">
              Semua lembar jawaban telah selesai diproses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {job.studentName}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 text-xs">·</span>
                    <span className="text-xs text-slate-700">
                      {job.examTitle}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-slate-700">
                    Langkah Saat Ini: <span className="text-slate-900 font-semibold">{job.currentStep}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-700 pt-0.5">
                    <span>Mulai: {new Date(job.createdAt).toLocaleTimeString('id-ID')}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[10px] text-slate-700">Idempotency: {job.idempotencyKey.slice(0, 16)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Progress bar */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between text-[10px] text-slate-700 mb-1">
                      <span>Progres</span>
                      <span className="font-semibold tabular-nums text-slate-900">{job.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          job.status === 'COMPLETED'
                            ? 'bg-emerald-600'
                            : job.status === 'FAILED'
                            ? 'bg-red-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${job.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  {job.status === 'COMPLETED' ? (
                    <button
                      onClick={() => onViewSubmission(job.submissionId)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Lihat Hasil</span>
                    </button>
                  ) : job.status === 'FAILED' ? (
                    <button
                      onClick={() => handleRetry(job.id)}
                      disabled={retryingId === job.id}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-md text-xs font-medium flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{retryingId === job.id ? 'Memproses...' : 'Ulangi Koreksi'}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-blue-600 font-semibold animate-pulse">
                      Sedang memproses...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
