import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Award,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ExamModel } from '../types/index.ts';

export const AnalyticsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadAnalytics(selectedExamId);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const res: any = await apiClient.request('/api/exams');
      const list = res.data || [];
      setExams(list);
      if (list.length > 0) {
        setSelectedExamId(list[0].id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadAnalytics = async (examId: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.request(`/api/analytics?examId=${examId}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Analitika Butir Soal &amp; Rekomendasi Remedial
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Statistik daya serap materi, sebaran nilai siswa, indeks tingkat kesukaran soal, dan klaster miskonsepsi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 font-medium">Pilih Ujian:</span>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-700 animate-pulse">
          Memuat analisis data...
        </div>
      ) : !analyticsData ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-700">
          Belum ada data nilai untuk paket ujian ini.
        </div>
      ) : (
        <div className="space-y-6">
          {analyticsData.sampleWarning && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{analyticsData.sampleWarning}</span>
            </div>
          )}

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-700 font-medium">Rata-rata Kelas</div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {analyticsData.averageScore}
                <span className="text-xs font-normal text-slate-700"> / 100</span>
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                KKM Ujian: {analyticsData.exam?.passingScore || 75}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-700 font-medium">Tingkat Ketuntasan Klasikal</div>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-1">
                {analyticsData.passRatePercent}%
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                Target ketuntasan nasional &ge; 85%
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-700 font-medium">Lembar Jawaban Dinilai</div>
              <div className="text-2xl font-bold text-blue-700 tabular-nums mt-1">
                {analyticsData.totalSubmissions}
              </div>
              <div className="text-[11px] text-slate-700 mt-1">
                Telah diverifikasi guru
              </div>
            </div>
          </div>

          {/* Score Distribution Chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sebaran Rentang Nilai Siswa (Histogram)
            </h2>

            <div className="space-y-3 pt-2">
              {analyticsData.scoreDistribution?.map((bin: any, idx: number) => {
                const maxCount = Math.max(1, ...analyticsData.scoreDistribution.map((b: any) => b.count));
                const percentWidth = Math.round((bin.count / maxCount) * 100);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{bin.range}</span>
                      <span className="font-bold tabular-nums text-slate-900">
                        {bin.count} siswa
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          idx === 0
                            ? 'bg-red-400'
                            : idx === 1
                            ? 'bg-amber-400'
                            : idx >= 3
                            ? 'bg-emerald-600'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Item Analysis / Difficulty Index */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Analisis Tingkat Kesukaran Soal (Indeks P)
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {analyticsData.questionAnalytics?.map((q: any) => (
                <div key={q.questionNumber} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-900 text-white rounded text-[10px] font-bold flex items-center justify-center tabular-nums">
                        {q.questionNumber}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {q.learningObjective}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      Tipe: {q.type === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Esai'} · {q.sampleSizeNote}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900 tabular-nums">
                      {q.averageScorePercent}% skor rerata
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        q.difficultyLabel.includes('Sukar')
                          ? 'text-red-600'
                          : q.difficultyLabel === 'Mudah'
                          ? 'text-emerald-700'
                          : 'text-blue-700'
                      }`}
                    >
                      {q.difficultyLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remedial Recommendations & Misconception Insights */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">
                Temuan Miskonsepsi &amp; Rencana Tindak Lanjut Remedial
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {analyticsData.commonMisconceptions?.map((m: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{m.topic}</span>
                    <span className="text-[11px] text-red-600 font-semibold">{m.frequency}</span>
                  </div>
                  <div className="text-slate-700 leading-relaxed">
                    <span className="font-medium text-slate-900">Miskonsepsi Terdeteksi:</span> {m.misconception}
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-blue-900">
                    <span className="font-semibold text-blue-950">Saran Aktivitas Penguatan:</span> {m.remedialActivity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
