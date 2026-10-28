import React, { useEffect, useState } from 'react';
import { Printer, Download, FileSpreadsheet, School } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { ExamModel, SubmissionModel } from '../types/index.ts';

export const ReportsPage: React.FC = () => {
  const [exams, setExams] = useState<ExamModel[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [submissions, setSubmissions] = useState<SubmissionModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadSubmissions(selectedExamId);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const res: any = await apiClient.request('/api/exams');
      const list = res.data || [];
      setExams(list);
      if (list.length > 0) {
        setSelectedExamId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSubmissions = async (examId: string) => {
    setLoading(true);
    try {
      const res: any = await apiClient.request(`/api/submissions?examId=${examId}`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const handleDownloadCsv = () => {
    const token = apiClient.getToken();
    window.location.href = `/api/reports/export-csv?examId=${selectedExamId}&token=${token}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Action Header (Hidden in Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Laporan Nilai &amp; Cetak Rapor Resmi
          </h1>
          <p className="text-xs text-slate-700 mt-1">
            Unduh rekapitulasi nilai format CSV/Excel atau cetak dokumen resmi berstandar KOP Surat Sekolah.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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

          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF / KOP Surat</span>
          </button>
        </div>
      </div>

      {/* Official Indonesian Printable Report Document */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Indonesian Official KOP Surat */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            DINAS PENDIDIKAN DAN KEBUDAYAAN
          </div>
          <div className="text-lg font-black uppercase tracking-tight text-slate-900">
            SMP NEGERI 1 NUSANTARA JAKARTA
          </div>
          <div className="text-[11px] text-slate-700">
            Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan 12130 | Telp: (021) 7201982 | NPSN: 20104567
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-1 pt-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 underline">
            DAFTAR NILAI HASIL ASESMEN PEMBELAJARAN
          </h2>
          <div className="text-xs text-slate-700">
            Mata Pelajaran: {selectedExam?.subject} · Tahun Ajaran: {selectedExam?.academicYear || '2026/2027'}
          </div>
        </div>

        {/* Exam Information Table */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 p-3 bg-slate-50 print:bg-transparent rounded-lg border border-slate-200 print:border-none">
          <div>
            <span className="font-semibold">Nama Asesmen:</span> {selectedExam?.title}
          </div>
          <div>
            <span className="font-semibold">Kriteria Ketuntasan Minimal (KKM):</span>{' '}
            <span className="tabular-nums font-bold">{selectedExam?.passingScore || 75}</span>
          </div>
          <div>
            <span className="font-semibold">Tanggal Asesmen:</span>{' '}
            {selectedExam?.examDate || '2026-10-20'}
          </div>
          <div>
            <span className="font-semibold">Guru Pengampu:</span> {selectedExam?.creatorName || 'Siti Rahmawati, M.Pd.'}
          </div>
        </div>

        {/* Student Scores Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-y-2 border-slate-900 bg-slate-100 print:bg-transparent text-[11px] font-bold text-slate-900 uppercase">
                <th className="py-2.5 px-3 w-10 text-center">No</th>
                <th className="py-2.5 px-3">NISN / NIS</th>
                <th className="py-2.5 px-4">Nama Lengkap Siswa</th>
                <th className="py-2.5 px-3 text-center">Kelas</th>
                <th className="py-2.5 px-3 text-center">Nilai PG</th>
                <th className="py-2.5 px-3 text-center">Nilai Esai</th>
                <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                <th className="py-2.5 px-3 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {submissions.map((sub, idx) => {
                const mcPoints =
                  (sub.multipleChoiceStats?.correct || 0) * 10;
                const essayPoints = Math.max(0, sub.finalScore - mcPoints);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center tabular-nums font-medium text-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                      {sub.studentNis}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {sub.studentName}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-700">
                      {sub.className}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-slate-800">
                      {mcPoints}
                    </td>
                    <td className="py-2.5 px-3 text-center tabular-nums text-slate-800">
                      {essayPoints}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold tabular-nums text-slate-900">
                      {sub.finalScore}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold">
                      <span
                        className={
                          sub.isPassed ? 'text-emerald-700' : 'text-red-600'
                        }
                      >
                        {sub.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Signature Box (Tanda Tangan KOP Sekolah) */}
        <div className="pt-8 grid grid-cols-2 text-xs text-slate-800 text-center">
          <div className="space-y-16">
            <div>
              Mengetahui,
              <br />
              Kepala Sekolah
            </div>
            <div>
              <span className="font-bold underline block">
                Drs. H. Mulyadi, M.Pd.
              </span>
              <span>NIP. 196805141994031002</span>
            </div>
          </div>

          <div className="space-y-16">
            <div>
              Jakarta, 27 Oktober 2026
              <br />
              Guru Mata Pelajaran
            </div>
            <div>
              <span className="font-bold underline block">
                {selectedExam?.creatorName || 'Siti Rahmawati, M.Pd.'}
              </span>
              <span>NIP. 198403152008012004</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
