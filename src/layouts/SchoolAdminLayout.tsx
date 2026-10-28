import React from 'react';
import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  Users,
  FileCheck2,
  FileSpreadsheet,
  Settings,
  CreditCard,
  LogOut,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { UserSession } from '../types/index.ts';

export type SchoolRoute =
  | '/school/dashboard'
  | '/school/teachers'
  | '/school/classes'
  | '/school/students'
  | '/school/exams'
  | '/school/reports'
  | '/school/settings'
  | '/school/subscription';

interface SchoolAdminLayoutProps {
  user: UserSession;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const SchoolAdminLayout: React.FC<SchoolAdminLayoutProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  children,
}) => {
  const menuItems: Array<{
    path: SchoolRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { path: '/school/dashboard', label: 'Dasbor Sekolah', icon: LayoutDashboard },
    { path: '/school/teachers', label: 'Manajemen Guru', icon: Users2 },
    { path: '/school/classes', label: 'Manajemen Rombel / Kelas', icon: GraduationCap },
    { path: '/school/students', label: 'Data Siswa Sekolah', icon: Users },
    { path: '/school/exams', label: 'Monitoring Ujian', icon: FileCheck2 },
    { path: '/school/reports', label: 'Laporan Ketuntasan', icon: FileSpreadsheet },
    { path: '/school/settings', label: 'Pengaturan Sekolah', icon: Settings },
    { path: '/school/subscription', label: 'Langganan & Kuota', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* School Admin Top Navigation Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-700 text-white flex items-center justify-center font-bold text-base rounded-lg shadow-xs">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 leading-tight">AI Teacher Grader</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                  ADMINISTRATOR SEKOLAH
                </span>
              </div>
              <span className="text-xs text-slate-700 font-medium">{user.orgName}</span>
            </div>
          </div>

          {/* Institutional Trust Indicator & User profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Isolasi Multi-Tenant Sekolah Aktif</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</div>
                <div className="text-[11px] text-slate-700">Administrator Sekolah</div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4">
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-700 tracking-wider uppercase">
              MANAJEMEN LEMBAGA
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-3 border-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy & Guard Info */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-700 space-y-1">
            <div className="font-semibold text-slate-800">Cakupan Wewenang Admin:</div>
            <p className="text-[10px] leading-relaxed">
              Dibatasi ketat pada institusi Anda ({user.orgName}). Penyesuaian nilai memerlukan alasan kebijakan tertulis.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-61px)] bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};
