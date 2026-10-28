import React from 'react';
import {
  LayoutDashboard,
  Building,
  Users,
  Layers,
  CreditCard,
  Activity,
  Cpu,
  FileLock2,
  HeartPulse,
  Sliders,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { UserSession } from '../types/index.ts';

export type SuperadminRoute =
  | '/superadmin/dashboard'
  | '/superadmin/organizations'
  | '/superadmin/users'
  | '/superadmin/plans'
  | '/superadmin/subscriptions'
  | '/superadmin/usage'
  | '/superadmin/ai-costs'
  | '/superadmin/audit-logs'
  | '/superadmin/system-health'
  | '/superadmin/settings';

interface SuperadminLayoutProps {
  user: UserSession;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const SuperadminLayout: React.FC<SuperadminLayoutProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  children,
}) => {
  const menuItems: Array<{
    path: SuperadminRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { path: '/superadmin/dashboard', label: 'Ringkasan Platform', icon: LayoutDashboard },
    { path: '/superadmin/organizations', label: 'Kelola Organisasi / Sekolah', icon: Building },
    { path: '/superadmin/users', label: 'Manajemen Pengguna Global', icon: Users },
    { path: '/superadmin/plans', label: 'Paket Layanan & Kuota', icon: Layers },
    { path: '/superadmin/subscriptions', label: 'Langganan Komersial', icon: CreditCard },
    { path: '/superadmin/usage', label: 'Volume Penggunaan', icon: Activity },
    { path: '/superadmin/ai-costs', label: 'Biaya & Metrik AI Gemini', icon: Cpu },
    { path: '/superadmin/audit-logs', label: 'Log Audit Keamanan', icon: FileLock2 },
    { path: '/superadmin/system-health', label: 'Kesehatan Sistem & Queue', icon: HeartPulse },
    { path: '/superadmin/settings', label: 'Konfigurasi Platform', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      {/* Superadmin Top Navigation Bar */}
      <header className="sticky top-0 z-20 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 text-white flex items-center justify-center font-bold text-base rounded-lg shadow-xs">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white leading-tight">AI Teacher Grader</span>
                <span className="px-2 py-0.5 bg-indigo-900/80 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-700">
                  SUPERADMIN OPS
                </span>
              </div>
              <span className="text-xs text-slate-400">Pusat Operasi Platform Nasional</span>
            </div>
          </div>

          {/* Quick Platform Status & User profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Semua Node Server: Normal (99.98% SLA)</span>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-900 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-700 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white leading-tight">{user.fullName}</div>
                <div className="text-[11px] text-indigo-400 font-medium">Superadmin Platform</div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
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
        <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4">
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              KONSOL KONTROL PLATFORM
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Privacy & Guard Info */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Batasan Privasi Superadmin:</div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Dilarang memodifikasi nilai siswa secara langsung. Akses lembar jawaban siswa dibatasi kebijakan kepatuhan.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-61px)] bg-slate-950 text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};
