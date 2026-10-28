import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Download, Filter, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SchoolReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/school/reports');
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const token = apiClient.getToken();
    const url = `/api/reports/export-csv${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.location.href = url;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Laporan Kinerja Lembaga &amp; Ketuntasan Asesmen
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi pencapaian ketuntasan belajar seluruh rombel dan ekspor format resmi untuk dinas / kurikulum.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Laporan Nilai CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Lembar Jawaban Terekap</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {reportData?.totalSubmissions || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">Dari seluruh mata pelajaran aktif</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Mata Asesmen Sekolah</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {reportData?.examsCount || 0} Ujian
          </div>
          <span className="text-[11px] text-emerald-600 mt-2 block">Tervalidasi &amp; Memiliki Kunci Jawaban</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Jumlah Rombel Terintegrasi</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {reportData?.classesCount || 0} Kelas
          </div>
          <span className="text-[11px] text-blue-600 mt-2 block">Jenjang SMP / SMA Terdata</span>
        </div>
      </div>

      {/* Recent Submission Records */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Daftar Hasil Asesmen Peserta Didik Terkini
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3">NISN / NIS</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Mata Ujian</th>
                <th className="px-4 py-3">Nilai Akhir</th>
                <th className="px-4 py-3">Ketuntasan (KKM)</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    Memuat data rekapan...
                  </td>
                </tr>
              ) : (reportData?.submissions || []).map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-semibold text-slate-900">{sub.studentName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{sub.studentNis}</td>
                  <td className="px-4 py-3 text-slate-700">{sub.className}</td>
                  <td className="px-4 py-3 text-slate-800">{sub.examTitle}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{sub.finalScore} / {sub.maxScore}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sub.isPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sub.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{sub.isPassed ? 'TUNTAS' : 'REMEDIAL'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                      {sub.status}
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
