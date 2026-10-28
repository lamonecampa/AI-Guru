import React, { useEffect, useState } from 'react';
import { FileLock2, Shield, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/audit-logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileLock2 className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">
              Log Jejak Audit Keamanan Sistem Platform
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan tamper-evident untuk setiap modifikasi nilai manual, perubahan kuota institusi, dan aktivitas autentikasi.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Cari aksi, email pengguna, tipe entitas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Log Entries Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Waktu (UTC/WIB)</th>
                <th className="px-4 py-3">Aksi / Operasi</th>
                <th className="px-4 py-3">Pengguna Pelaksana</th>
                <th className="px-4 py-3">Tipe Entitas</th>
                <th className="px-4 py-3">ID Entitas</th>
                <th className="px-4 py-3">Detail Parameter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Memuat log audit...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada aktivitas yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/60">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-mono font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{log.userEmail}</td>
                    <td className="px-4 py-3 text-slate-400">{log.entityType}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{log.entityId}</td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
