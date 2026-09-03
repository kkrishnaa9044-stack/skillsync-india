import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Chatbot } from '@/components/Chatbot';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SkillGapPage } from '@/pages/SkillGapPage';
import { JobsPage } from '@/pages/JobsPage';
import { IndustryPage } from '@/pages/IndustryPage';
import { RegionalPage } from '@/pages/RegionalPage';
import { TrainingPage } from '@/pages/TrainingPage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { AdminPage } from '@/pages/AdminPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ResumeAnalyzerPage } from '@/pages/ResumeAnalyzerPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';
import type { ReactNode } from 'react';

const PROTECTED_PATHS = [
  '/dashboard', '/skill-gap', '/jobs', '/industry', '/regional',
  '/training', '/recommendations', '/students', '/reports',
  '/resume-analyzer', '/profile', '/admin', '/settings',
];

const ADMIN_PATHS = ['/admin'];

function ProtectedRoute({ children, isAdminOnly }: { children: ReactNode; isAdminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (isAdminOnly && user?.role !== 'Government/Administrator') {
    return (
      <Layout>
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">You don't have permission to access this page. This area is restricted to Government/Administrator accounts.</p>
        </div>
      </Layout>
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />

      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/skill-gap" element={<ProtectedRoute><SkillGapPage /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
              <Route path="/industry" element={<ProtectedRoute><IndustryPage /></ProtectedRoute>} />
              <Route path="/regional" element={<ProtectedRoute><RegionalPage /></ProtectedRoute>} />
              <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><RecommendationsPage /></ProtectedRoute>} />
              <Route path="/resume-analyzer" element={<ProtectedRoute><ResumeAnalyzerPage /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute isAdminOnly><AdminPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
          <Chatbot />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
