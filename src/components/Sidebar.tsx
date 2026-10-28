import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  ScanLine,
  ListOrdered,
  CheckCircle2,
  BarChart3,
  FileSpreadsheet,
  CreditCard,
  Settings,
  Shield,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

export type NavRoute =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'exams'
  | 'scan-upload'
  | 'grading-queue'
  | 'results'
  | 'analytics'
  | 'reports'
  | 'billing'
  | 'settings'
  | 'admin';

interface SidebarProps {
  currentRoute: NavRoute;
  onRouteChange: (route: NavRoute) => void;
  userRole?: UserRole;
  pendingReviewCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  userRole,
  pendingReviewCount = 0,
}) => {
  const navItems: Array<{
    route: NavRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    adminOnly?: boolean;
    schoolAdminOnly?: boolean;
  }> = [
    { route: 'dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
    { route: 'exams', label: 'Bank Ujian & Soal', icon: FileText },
    { route: 'scan-upload', label: 'Pindai & Unggah LJK', icon: ScanLine },
    { route: 'grading-queue', label: 'Antrean Koreksi', icon: ListOrdered },
    {
      route: 'results',
      label: 'Hasil & Review Guru',
      icon: CheckCircle2,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
    },
    { route: 'classes', label: 'Manajemen Kelas', icon: GraduationCap },
    { route: 'students', label: 'Daftar Siswa', icon: Users },
    { route: 'analytics', label: 'Analitika & Remedial', icon: BarChart3 },
    { route: 'reports', label: 'Rapor & Ekspor', icon: FileSpreadsheet },
    { route: 'billing', label: 'Tagihan & Kuota', icon: CreditCard },
    { route: 'settings', label: 'Pengaturan & Privasi', icon: Settings },
    {
      route: 'admin',
      label: 'Konsol Superadmin',
      icon: Shield,
      adminOnly: true,
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && userRole !== 'PLATFORM_ADMIN') return false;
    return true;
  });

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-700 tracking-wider">
          MENU UTAMA
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;
          return (
            <button
              key={item.route}
              onClick={() => onRouteChange(item.route)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-700' : 'text-slate-700'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100 px-3">
        <div className="text-[11px] text-slate-700 leading-relaxed">
          AI Teacher Grader v1.0
          <br />
          Standar Kurikulum Nasional
        </div>
      </div>
    </aside>
  );
};
