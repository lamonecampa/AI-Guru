/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { apiClient } from './services/apiClient.ts';
import { UserSession, getDefaultDashboard, isSuperAdmin, isSchoolAdmin, isTeacher } from './types/index.ts';
import { DemoSwitcher } from './components/DemoSwitcher.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { Forbidden403Page } from './pages/Forbidden403Page.tsx';

// Layouts
import { TeacherLayout } from './layouts/TeacherLayout.tsx';
import { SchoolAdminLayout } from './layouts/SchoolAdminLayout.tsx';
import { SuperadminLayout } from './layouts/SuperadminLayout.tsx';

// Teacher Pages
import { DashboardPage as TeacherDashboardPage } from './pages/DashboardPage.tsx';
import { ExamsPage as TeacherExamsPage } from './pages/ExamsPage.tsx';
import { ExamQuestionsPage } from './pages/ExamQuestionsPage.tsx';
import { ScanUploadPage } from './pages/ScanUploadPage.tsx';
import { GradingQueuePage } from './pages/GradingQueuePage.tsx';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage.tsx';
import { ClassesPage } from './pages/ClassesPage.tsx';
import { StudentsPage } from './pages/StudentsPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

// School Admin Pages
import { SchoolDashboardPage } from './pages/school/SchoolDashboardPage.tsx';
import { SchoolTeachersPage } from './pages/school/SchoolTeachersPage.tsx';
import { SchoolReportsPage } from './pages/school/SchoolReportsPage.tsx';
import { SchoolSettingsPage } from './pages/school/SchoolSettingsPage.tsx';
import { SchoolSubscriptionPage } from './pages/school/SchoolSubscriptionPage.tsx';

// Superadmin Pages
import { SuperadminDashboardPage } from './pages/superadmin/SuperadminDashboardPage.tsx';
import { SuperadminOrganizationsPage } from './pages/superadmin/SuperadminOrganizationsPage.tsx';
import { SuperadminUsersPage } from './pages/superadmin/SuperadminUsersPage.tsx';
import { SuperadminPlansPage } from './pages/superadmin/SuperadminPlansPage.tsx';
import { SuperadminSubscriptionsPage } from './pages/superadmin/SuperadminSubscriptionsPage.tsx';
import { SuperadminUsagePage } from './pages/superadmin/SuperadminUsagePage.tsx';
import { SuperadminAICostsPage } from './pages/superadmin/SuperadminAICostsPage.tsx';
import { SuperadminAuditLogsPage } from './pages/superadmin/SuperadminAuditLogsPage.tsx';
import { SuperadminSystemHealthPage } from './pages/superadmin/SuperadminSystemHealthPage.tsx';
import { SuperadminSettingsPage } from './pages/superadmin/SuperadminSettingsPage.tsx';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Sync state with HTML5 History API
  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const existing = apiClient.getUser();
    if (existing) {
      setUser(existing);
      fetchPendingCount();
      setIsInitializing(false);
      // If at root or login, redirect to designated dashboard
      if (currentPath === '/' || currentPath === '/login') {
        const dest = getDefaultDashboard(existing.role);
        navigateTo(dest);
      }
    } else {
      // Auto-login to teacher demo for immediate interactive preview
      apiClient.switchDemoRole('TEACHER_SITI').then((res) => {
        setUser(res.user);
        fetchPendingCount();
        const initialDest = currentPath !== '/' && currentPath !== '/login' ? currentPath : getDefaultDashboard(res.user.role);
        navigateTo(initialDest);
      }).catch(() => {
        // Fallback to login if fetch fails
      }).finally(() => {
        setIsInitializing(false);
      });
    }
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res: any = await apiClient.request('/api/submissions?status=NEEDS_REVIEW');
      setPendingReviewCount(res.data?.length || 0);
    } catch {
      // silent
    }
  };

  const handleRoleSwitch = async (role: 'SUPERADMIN' | 'SCHOOL_ADMIN' | 'TEACHER_SITI' | 'TEACHER_BUDI') => {
    try {
      const res = await apiClient.switchDemoRole(role);
      setUser(res.user);
      fetchPendingCount();
      setSelectedExamId(null);
      setSelectedSubmissionId(null);
      const targetDashboard = getDefaultDashboard(res.user.role);
      navigateTo(targetDashboard);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    apiClient.clearSession();
    setUser(null);
    navigateTo('/login');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-xs text-slate-300 gap-2">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>Memuat AI Teacher Grader...</span>
      </div>
    );
  }

  // Unauthenticated user attempting to access protected route
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher
          user={null}
          activePath={currentPath}
          onRoleSwitch={handleRoleSwitch}
        />
        <LoginPage
          onSuccess={(u) => {
            setUser(u);
            fetchPendingCount();
            const target = getDefaultDashboard(u.role);
            navigateTo(target);
          }}
        />
      </div>
    );
  }

  // ==========================================
  // ROLE-BASED ROUTE GUARD & WORKSPACE DISPATCH
  // ==========================================

  // Explicit 403 route
  if (currentPath === '/403') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
        <Forbidden403Page
          user={user}
          attemptedPath={currentPath}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  // 1. TEACHER WORKSPACE (/teacher/*)
  if (currentPath.startsWith('/teacher/')) {
    if (!isTeacher(user.role)) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
          <Forbidden403Page
            user={user}
            attemptedPath={currentPath}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
        <TeacherLayout
          user={user}
          currentPath={currentPath}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          pendingReviewCount={pendingReviewCount}
        >
          {currentPath === '/teacher/dashboard' && (
            <TeacherDashboardPage
              onNavigate={(r) => {
                if (r === 'exams') navigateTo('/teacher/exams');
                else if (r === 'scan-upload') navigateTo('/teacher/scanner');
                else if (r === 'grading-queue') navigateTo('/teacher/grading-queue');
                else if (r === 'results') navigateTo('/teacher/results');
                else if (r === 'analytics') navigateTo('/teacher/analytics');
                else if (r === 'reports') navigateTo('/teacher/reports');
              }}
            />
          )}

          {currentPath === '/teacher/exams' && (
            <TeacherExamsPage
              onSelectExamQuestions={(examId) => {
                setSelectedExamId(examId);
                navigateTo(`/teacher/exams/${examId}/questions`);
              }}
            />
          )}

          {currentPath === '/teacher/exams/new' && (
            <TeacherExamsPage
              onSelectExamQuestions={(examId) => {
                setSelectedExamId(examId);
                navigateTo(`/teacher/exams/${examId}/questions`);
              }}
            />
          )}

          {currentPath.startsWith('/teacher/exams/') && currentPath.endsWith('/questions') && (
            <ExamQuestionsPage
              examId={selectedExamId || 'exam-bio-asas-9'}
              onBack={() => navigateTo('/teacher/exams')}
            />
          )}

          {currentPath === '/teacher/classes' && <ClassesPage />}
          {currentPath === '/teacher/students' && <StudentsPage />}

          {currentPath === '/teacher/scanner' && (
            <ScanUploadPage
              onGradingComplete={(subId) => {
                setSelectedSubmissionId(subId);
                navigateTo('/teacher/results');
                fetchPendingCount();
              }}
              onGoToQueue={() => navigateTo('/teacher/grading-queue')}
            />
          )}

          {currentPath === '/teacher/grading-queue' && (
            <GradingQueuePage
              onViewSubmission={(subId) => {
                setSelectedSubmissionId(subId);
                navigateTo('/teacher/results');
              }}
            />
          )}

          {currentPath === '/teacher/results' && (
            <SubmissionDetailPage
              initialSubmissionId={selectedSubmissionId}
              onBackToList={() => setSelectedSubmissionId(null)}
            />
          )}

          {currentPath === '/teacher/analytics' && <AnalyticsPage />}
          {currentPath === '/teacher/reports' && <ReportsPage />}
          {currentPath === '/teacher/settings' && <SettingsPage />}
        </TeacherLayout>
      </div>
    );
  }

  // 2. SCHOOL ADMIN WORKSPACE (/school/*)
  if (currentPath.startsWith('/school/')) {
    if (!isSchoolAdmin(user.role)) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
          <Forbidden403Page
            user={user}
            attemptedPath={currentPath}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
        <SchoolAdminLayout
          user={user}
          currentPath={currentPath}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        >
          {currentPath === '/school/dashboard' && (
            <SchoolDashboardPage onNavigate={navigateTo} />
          )}
          {currentPath === '/school/teachers' && <SchoolTeachersPage />}
          {currentPath === '/school/classes' && <ClassesPage />}
          {currentPath === '/school/students' && <StudentsPage />}
          {currentPath === '/school/exams' && (
            <TeacherExamsPage
              onSelectExamQuestions={(examId) => {
                setSelectedExamId(examId);
                navigateTo('/school/exams');
              }}
            />
          )}
          {currentPath === '/school/reports' && <SchoolReportsPage />}
          {currentPath === '/school/settings' && <SchoolSettingsPage />}
          {currentPath === '/school/subscription' && <SchoolSubscriptionPage />}
        </SchoolAdminLayout>
      </div>
    );
  }

  // 3. SUPERADMIN WORKSPACE (/superadmin/*)
  if (currentPath.startsWith('/superadmin/')) {
    if (!isSuperAdmin(user.role)) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
          <Forbidden403Page
            user={user}
            attemptedPath={currentPath}
            onNavigate={navigateTo}
            onLogout={handleLogout}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
        <DemoSwitcher user={user} activePath={currentPath} onRoleSwitch={handleRoleSwitch} />
        <SuperadminLayout
          user={user}
          currentPath={currentPath}
          onNavigate={navigateTo}
          onLogout={handleLogout}
        >
          {currentPath === '/superadmin/dashboard' && (
            <SuperadminDashboardPage onNavigate={navigateTo} />
          )}
          {currentPath === '/superadmin/organizations' && <SuperadminOrganizationsPage />}
          {currentPath === '/superadmin/users' && <SuperadminUsersPage />}
          {currentPath === '/superadmin/plans' && <SuperadminPlansPage />}
          {currentPath === '/superadmin/subscriptions' && <SuperadminSubscriptionsPage />}
          {currentPath === '/superadmin/usage' && <SuperadminUsagePage />}
          {currentPath === '/superadmin/ai-costs' && <SuperadminAICostsPage />}
          {currentPath === '/superadmin/audit-logs' && <SuperadminAuditLogsPage />}
          {currentPath === '/superadmin/system-health' && <SuperadminSystemHealthPage />}
          {currentPath === '/superadmin/settings' && <SuperadminSettingsPage />}
        </SuperadminLayout>
      </div>
    );
  }

  // Any other path: redirect to user's permitted dashboard
  const fallbackDashboard = getDefaultDashboard(user.role);
  if (currentPath !== fallbackDashboard) {
    navigateTo(fallbackDashboard);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
      Mengarahkan ke ruang kerja resmi Anda...
    </div>
  );
}
