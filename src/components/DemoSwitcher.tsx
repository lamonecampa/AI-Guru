import React from 'react';
import { UserSession } from '../types/index.ts';
import { ShieldCheck, UserCheck, School, ArrowRight } from 'lucide-react';

interface DemoSwitcherProps {
  user: UserSession | null;
  onRoleSwitch: (role: 'SUPERADMIN' | 'SCHOOL_ADMIN' | 'TEACHER_SITI' | 'TEACHER_BUDI') => void;
  activePath: string;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({ user, onRoleSwitch, activePath }) => {
  const isSuperAdmin = user?.role === 'SUPERADMIN' || user?.role === 'PLATFORM_ADMIN';
  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN';
  const isTeacherSiti = user?.role === 'TEACHER' && user?.email.includes('guru.siti');
  const isTeacherBudi = user?.role === 'TEACHER' && user?.email.includes('guru.budi');

  return (
    <div className="bg-slate-950 text-slate-300 px-4 py-2 text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            Peralihan Peran Demo
          </span>
          <span className="text-slate-400 hidden sm:inline text-[11px]">
            Uji pemisahan dasbor, batas otorisasi, dan isolasi tenant:
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onRoleSwitch('TEACHER_SITI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isTeacherSiti
                ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-950 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Beralih ke peran Guru IPA (SMPN 1 Nusantara)"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Guru IPA (Ibu Siti)</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleSwitch('TEACHER_BUDI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isTeacherBudi
                ? 'bg-blue-600 text-white font-semibold ring-2 ring-blue-400 ring-offset-1 ring-offset-slate-950 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Beralih ke peran Guru B. Indonesia (SMPN 1 Nusantara)"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Guru B. Indo (Pak Budi)</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleSwitch('SCHOOL_ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSchoolAdmin
                ? 'bg-emerald-600 text-white font-semibold ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Beralih ke peran Administrator Sekolah (Waka Kurikulum SMPN 1 Nusantara)"
          >
            <School className="w-3.5 h-3.5 text-emerald-300" />
            <span>Admin Sekolah (Dra. Endang)</span>
          </button>

          <button
            type="button"
            onClick={() => onRoleSwitch('SUPERADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSuperAdmin
                ? 'bg-indigo-600 text-white font-semibold ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-950 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
            title="Beralih ke peran Superadmin Platform AI Teacher Grader"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
            <span>Superadmin (Dr. Hendra)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
