import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, Filter, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../../services/apiClient.ts';

export const SuperadminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request('/api/superadmin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.orgName && u.orgName.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">
            Manajemen Pengguna Platform Global
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Daftar seluruh akun terdaftar (Guru, Administrator Sekolah, Superadmin) dari semua tenant satuan pendidikan.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, email, atau sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-slate-400">Filter Peran:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
          >
            <option value="ALL">Semua Peran ({users.length})</option>
            <option value="TEACHER">Guru ({users.filter((u) => u.role === 'TEACHER').length})</option>
            <option value="SCHOOL_ADMIN">Admin Sekolah ({users.filter((u) => u.role === 'SCHOOL_ADMIN').length})</option>
            <option value="SUPERADMIN">Superadmin ({users.filter((u) => u.role === 'SUPERADMIN' || u.role === 'PLATFORM_ADMIN').length})</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Email Akun</th>
                <th className="px-4 py-3">Institusi Sekolah</th>
                <th className="px-4 py-3">Peran Otorisasi</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/60">
                  <td className="px-4 py-3 font-semibold text-white">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-300">{u.orgName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'SUPERADMIN' || u.role === 'PLATFORM_ADMIN'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                          : u.role === 'SCHOOL_ADMIN'
                          ? 'bg-purple-950 text-purple-300 border border-purple-700'
                          : 'bg-blue-950 text-blue-300 border border-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{u.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {u.createdAt ? u.createdAt.split('T')[0] : '2026-01-15'}
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
