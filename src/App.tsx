/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { apiClient } from './services/apiClient.ts';
import { UserSession } from './types/index.ts';
import { Header } from './components/Header.tsx';
import { Sidebar, NavRoute } from './components/Sidebar.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ExamsPage } from './pages/ExamsPage.tsx';
import { ExamQuestionsPage } from './pages/ExamQuestionsPage.tsx';
import { ScanUploadPage } from './pages/ScanUploadPage.tsx';
import { GradingQueuePage } from './pages/GradingQueuePage.tsx';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage.tsx';
import { ClassesPage } from './pages/ClassesPage.tsx';
import { StudentsPage } from './pages/StudentsPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { BillingPage } from './pages/BillingPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentRoute, setCurrentRoute] = useState<NavRoute | 'exam-questions'>('dashboard');
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    // Check existing stored session
    const existing = apiClient.getUser();
    if (existing) {
      setUser(existing);
      fetchPendingCount();
    } else {
      // Auto-login to teacher demo for immediate interactive preview
      apiClient.switchDemoRole('TEACHER_SITI').then((res) => {
        setUser(res.user);
        fetchPendingCount();
      }).catch(() => {
        // Fallback to login page if fetch fails
      }).finally(() => {
        setIsInitializing(false);
      });
      return;
    }
    setIsInitializing(false);
  }, []);

  const fetchPendingCount = async () => {
    try {
      const res: any = await apiClient.request('/api/submissions?status=NEEDS_REVIEW');
      setPendingReviewCount(res.data?.length || 0);
    } catch {
      // silent
    }
  };

  const handleRoleSwitch = async (role: 'TEACHER_SITI' | 'TEACHER_BUDI' | 'SCHOOL_ADMIN' | 'PLATFORM_ADMIN') => {
    try {
      const res = await apiClient.switchDemoRole(role);
      setUser(res.user);
      fetchPendingCount();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    apiClient.clearSession();
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-700 animate-pulse">
        Memuat AI Teacher Grader...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSuccess={(u) => { setUser(u); fetchPendingCount(); }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <Header
        user={user}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      />

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <Sidebar
          currentRoute={currentRoute === 'exam-questions' ? 'exams' : currentRoute}
          onRouteChange={(r) => {
            setCurrentRoute(r);
            if (r !== 'results') setSelectedSubmissionId(null);
          }}
          userRole={user.role}
          pendingReviewCount={pendingReviewCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-80px)]">
          {currentRoute === 'dashboard' && (
            <DashboardPage
              onNavigate={(r) => {
                setCurrentRoute(r);
                if (r === 'results') setSelectedSubmissionId(null);
              }}
            />
          )}

          {currentRoute === 'exams' && (
            <ExamsPage
              onSelectExamQuestions={(examId) => {
                setSelectedExamId(examId);
                setCurrentRoute('exam-questions');
              }}
            />
          )}

          {currentRoute === 'exam-questions' && selectedExamId && (
            <ExamQuestionsPage
              examId={selectedExamId}
              onBack={() => setCurrentRoute('exams')}
            />
          )}

          {currentRoute === 'scan-upload' && (
            <ScanUploadPage
              onGradingComplete={(subId) => {
                setSelectedSubmissionId(subId);
                setCurrentRoute('results');
                fetchPendingCount();
              }}
              onGoToQueue={() => setCurrentRoute('grading-queue')}
            />
          )}

          {currentRoute === 'grading-queue' && (
            <GradingQueuePage
              onViewSubmission={(subId) => {
                setSelectedSubmissionId(subId);
                setCurrentRoute('results');
              }}
            />
          )}

          {currentRoute === 'results' && (
            <SubmissionDetailPage
              initialSubmissionId={selectedSubmissionId}
              onBackToList={() => setSelectedSubmissionId(null)}
            />
          )}

          {currentRoute === 'classes' && <ClassesPage />}
          {currentRoute === 'students' && <StudentsPage />}
          {currentRoute === 'analytics' && <AnalyticsPage />}
          {currentRoute === 'reports' && <ReportsPage />}
          {currentRoute === 'billing' && <BillingPage />}
          {currentRoute === 'settings' && <SettingsPage />}
          {currentRoute === 'admin' && <AdminPage />}
        </main>
      </div>
    </div>
  );
}
