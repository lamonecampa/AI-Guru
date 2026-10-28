import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Lock, Home } from 'lucide-react';
import { UserSession, getDefaultDashboard } from '../types/index.ts';

interface Forbidden403PageProps {
  user: UserSession;
  attemptedPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const Forbidden403Page: React.FC<Forbidden403PageProps> = ({
  user,
  attemptedPath,
  onNavigate,
  onLogout,
}) => {
  const allowedDashboard = getDefaultDashboard(user.role);

  const getRoleDisplayName = (role: string) => {
    if (role === 'SUPERADMIN' || role === 'PLATFORM_ADMIN') return 'Superadmin Platform';
    if (role === 'SCHOOL_ADMIN') return 'Administrator Sekolah';
    return 'Guru Pengajar';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Warning Banner */}
        <div className="bg-red-600 px-6 py-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-red-700/80 rounded-full text-xs font-bold tracking-wider uppercase mb-1">
            HTTP 403 · Akses Ditolak
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Otorisasi Tidak Memadai</h1>
          <p className="text-xs text-red-100 mt-1 max-w-sm mx-auto">
            Sistem isolasi multi-peran AI Teacher Grader mencegah akses ke modul yang berada di luar hak wewenang Anda.
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Rute yang Dicoba:</span>
              <code className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-medium">
                {attemptedPath}
              </code>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Peran Akun Aktif:</span>
              <span className="font-semibold text-slate-900 bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full">
                {getRoleDisplayName(user.role)} ({user.role})
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Institusi / Sekolah:</span>
              <span className="font-medium text-slate-800">{user.orgName}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Pengguna:</span>
              <span className="text-slate-700">{user.fullName} ({user.email})</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-semibold block mb-0.5">Penjelasan Keamanan &amp; Privasi:</strong>
              {user.role === 'TEACHER' && (
                <span>
                  Akun Guru memiliki batas wewenang pedagogis untuk mengoreksi kelas dan ujiannya sendiri. Anda dilarang mengakses konsol administrator sekolah, data sekolah lain, maupun manajemen lisensi platform.
                </span>
              )}
              {user.role === 'SCHOOL_ADMIN' && (
                <span>
                  Akun Administrator Sekolah berwenang mengelola data sekolah Anda sendiri ({user.orgName}), namun dilarang mengakses konsol Superadmin Platform atau data institusi sekolah lainnya.
                </span>
              )}
              {(user.role === 'SUPERADMIN' || user.role === 'PLATFORM_ADMIN') && (
                <span>
                  Akun Superadmin Platform dilarang mengakses atau memodifikasi lembar jawaban siswa secara langsung tanpa alur audit resmi demi perlindungan privasi siswa dan integritas akademik.
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => onNavigate(allowedDashboard)}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dashboard Resmi Saya</span>
            </button>

            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti Akun</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
