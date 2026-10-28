import React from 'react';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  GraduationCap,
  Users,
  ScanLine,
  ListOrdered,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  Settings,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';
import { UserSession } from '../types/index.ts';

export type TeacherRoute =
  | '/teacher/dashboard'
  | '/teacher/exams'
  | '/teacher/exams/new'
  | '/teacher/classes'
  | '/teacher/students'
  | '/teacher/scanner'
  | '/teacher/grading-queue'
  | '/teacher/results'
  | '/teacher/analytics'
  | '/teacher/reports'
  | '/teacher/settings';

interface TeacherLayoutProps {
  user: UserSession;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  pendingReviewCount?: number;
  children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  pendingReviewCount = 0,
  children,
}) => {
  const menuItems: Array<{
    path: TeacherRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    highlight?: boolean;
  }> = [
    { path: '/teacher/dashboard', label: 'Dasbor Guru', icon: LayoutDashboard },
    { path: '/teacher/exams', label: 'Bank Ujian & Soal', icon: FileText },
    { path: '/teacher/exams/new', label: 'Buat Ujian Baru', icon: PlusCircle, highlight: true },
    { path: '/teacher/classes', label: 'Kelas Saya', icon: GraduationCap },
    { path: '/teacher/students', label: 'Daftar Siswa', icon: Users },
    { path: '/teacher/scanner', label: 'Pindai & Koreksi LJK', icon: ScanLine },
    { path: '/teacher/grading-queue', label: 'Antrean Koreksi AI', icon: ListOrdered },
    {
      path: '/teacher/results',
      label: 'Hasil & Review Guru',
      icon: CheckCircle2,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { path: '/teacher/analytics', label: 'Analitika & Remedial', icon: BarChart3 },
    { path: '/teacher/reports', label: 'Rapor & Ekspor', icon: FileSpreadsheet },
    { path: '/teacher/settings', label: 'Pengaturan Akun', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Teacher Top Navigation Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-700 text-white flex items-center justify-center font-bold text-base rounded-lg shadow-xs">
              TG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 leading-tight">AI Teacher Grader</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
                  PORTAL GURU
                </span>
              </div>
              <span className="text-xs text-slate-700">{user.orgName}</span>
            </div>
          </div>

          {/* Quick info & User profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Model: Gemini 2.5 Flash Aktif</span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</div>
                <div className="text-[11px] text-slate-700">{user.nip ? `NIP: ${user.nip}` : 'Guru Pengajar'}</div>
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
              RUANG KERJA GURU
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || (item.path === '/teacher/exams' && currentPath.startsWith('/teacher/exams/'));
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-700'
                      : item.highlight
                      ? 'text-blue-700 hover:bg-blue-50/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : item.highlight ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Privacy & Guard Info */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-700 space-y-1">
            <div className="font-semibold text-slate-800">Batas Wewenang Guru:</div>
            <p className="text-[10px] leading-relaxed">
              Anda hanya dapat melihat dan mengoreksi ujian serta kelas yang ditugaskan kepada Anda.
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
