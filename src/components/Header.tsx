import React from 'react';
import { UserSession } from '../types/index.ts';
import { UserCheck, ShieldCheck, School, BookOpen } from 'lucide-react';

interface HeaderProps {
  user: UserSession | null;
  onRoleSwitch: (role: 'TEACHER_SITI' | 'TEACHER_BUDI' | 'SCHOOL_ADMIN' | 'PLATFORM_ADMIN') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onRoleSwitch, onLogout }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      {/* Demo Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Mode Uji Coba:</span>
          <span>Beralih peran untuk menguji otorisasi multi-peran &amp; isolasi data:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onRoleSwitch('TEACHER_SITI')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              user?.email.includes('guru.siti')
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Ibu Siti (Guru IPA)
          </button>
          <button
            onClick={() => onRoleSwitch('TEACHER_BUDI')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              user?.email.includes('guru.budi')
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Pak Budi (Guru B. Indo)
          </button>
          <button
            onClick={() => onRoleSwitch('SCHOOL_ADMIN')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              user?.role === 'SCHOOL_ADMIN'
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Admin Sekolah (Kurikulum)
          </button>
          <button
            onClick={() => onRoleSwitch('PLATFORM_ADMIN')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              user?.role === 'PLATFORM_ADMIN'
                ? 'bg-blue-600 text-white font-medium'
                : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            Superadmin Platform
          </button>
        </div>
      </div>

      {/* Main Top Bar */}
      <div className="flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-blue-700 text-white flex items-center justify-center font-bold text-lg rounded-lg shadow-xs">
            TG
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 leading-tight">
              AI Teacher Grader
            </span>
            <span className="text-xs text-slate-700">
              {user?.orgName || 'Sekolah Indonesia'}
            </span>
          </div>
        </div>

        {/* Zone 2: Informational trust indicator */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-700">
          <div className="flex items-center gap-1.5">
            <School className="w-4 h-4 text-slate-700" />
            <span>NPSN Terdaftar</span>
          </div>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <span>Kurikulum Merdeka &amp; K-13</span>
          </div>
          <span aria-hidden="true" className="text-slate-400">·</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Koreksi AI Terverifikasi Server</span>
          </div>
        </div>

        {/* Zone 3: Account Profile & Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                {user?.fullName?.slice(0, 2).toUpperCase() || 'GU'}
              </div>
            )}
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 truncate max-w-[160px]">
                {user?.fullName}
              </span>
              <span className="text-[11px] text-slate-700">
                {user?.role === 'PLATFORM_ADMIN'
                  ? 'Superadmin'
                  : user?.role === 'SCHOOL_ADMIN'
                  ? 'Admin Sekolah'
                  : 'Guru Pengampu'}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
};
