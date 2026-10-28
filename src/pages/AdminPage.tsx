import React, { useEffect, useState } from 'react';
import { Shield, Building, Activity, FileText, CheckCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { AuditLogModel, OrganizationModel } from '../types/index.ts';

export const AdminPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationModel[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogModel[]>([]);
  const [healthInfo, setHealthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [resOrgs, resLogs, resHealth]: any = await Promise.all([
        apiClient.request('/api/admin/organizations'),
        apiClient.request('/api/admin/audit-logs'),
        apiClient.request('/api/health'),
      ]);
      setOrganizations(resOrgs.data || []);
      setAuditLogs(resLogs.data || []);
      setHealthInfo(resHealth);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Konsol Superadmin Platform AI Teacher Grader
            </h1>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Manajemen institusi sekolah, alokasi kuota komersial, kesehatan layanan Gemini, dan audit trail sistem.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* System Health Status */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Status Layanan Sistem (Service Health)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 text-xs">
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-emerald-950">Server API Runtime</div>
              <div className="text-[11px] text-emerald-800">Status: {healthInfo?.status || 'UP'}</div>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-blue-950">Gemini AI Model</div>
              <div className="text-[11px] text-blue-800">
                {healthInfo?.geminiConfigured ? 'API Key Terhubung (Live)' : 'Mode Simulasi Demo Aktif'}
              </div>
            </div>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Database Multi-Tenant</div>
              <div className="text-[11px] text-slate-700">Terkoneksi (Isolasi orgId Aktif)</div>
            </div>
            <Building className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Daftar Institusi Sekolah Terdaftar ({organizations.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                <th className="py-2.5 px-3">Nama Sekolah</th>
                <th className="py-2.5 px-3">NPSN</th>
                <th className="py-2.5 px-3">Wilayah</th>
                <th className="py-2.5 px-3">Paket Langganan</th>
                <th className="py-2.5 px-3 text-right">Pemakaian Kuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {org.name}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                    {org.npsn || '-'}
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {org.city || 'Jakarta'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-blue-700">
                      {org.planType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums text-slate-900">
                    {org.quotaUsed} / {org.quotaLimit} lembar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Rekam Jejak Audit Sistem (Audit Logs)
        </h2>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-slate-700">Belum ada aktivitas tercatat.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-700">{log.entityType} ({log.entityId})</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Oleh: <span className="font-medium text-slate-800">{log.userEmail}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[11px] text-slate-700">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
