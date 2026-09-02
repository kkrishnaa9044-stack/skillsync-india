import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
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

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/skill-gap" element={<SkillGapPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/industry" element={<IndustryPage />} />
                  <Route path="/regional" element={<RegionalPage />} />
                  <Route path="/training" element={<TrainingPage />} />
                  <Route path="/recommendations" element={<RecommendationsPage />} />
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <Chatbot />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
