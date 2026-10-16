import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { FeatureFlagsProvider } from './context/FeatureFlagsContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import {
  Home, About, Services, TrainingAcademy, InnovationLab,
  Ecosystem, Resources, Insights, Contact, Admin, DeveloperDashboard,
  LearnerPortal, LecturerPortal, LecturerRegistration, AdminPortal, LmisPortal,
  ModuleDetail, PrivacyPolicy, TermsOfService,
  // School LMIS — code preserved, removed from live until ready
  // SchoolPortal, SchoolsShowcase, SchoolLmisHub,
  // SchoolAdminPortal, SchoolTeacherPortal, SchoolStudentPortal
} from './pages';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <ErrorBoundary name="RootAppBoundary">
      <ThemeProvider>
        <DataProvider>
          <FeatureFlagsProvider>
            <Router>
              <AnalyticsProvider>
                <Routes>
                  {/* Public Website Routes (Wrapped in Layout with Header/Footer) */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<About />} />
                    <Route path="services" element={<Services />} />
                    {/* <Route path="schools" element={<SchoolsShowcase />} /> */}{/* School LMIS — coming soon */}
                    <Route path="training-academy" element={<TrainingAcademy />} />
                    <Route path="training-academy/:slug" element={<ModuleDetail />} />
                    <Route path="modules/:slug" element={<ModuleDetail />} />
                    <Route path="programmes/:slug" element={<ModuleDetail />} />
                    <Route path="innovation-lab" element={<InnovationLab />} />
                    <Route path="ecosystem" element={<Ecosystem />} />
                    <Route path="resources" element={<Resources />} />
                    <Route path="insights" element={<Insights />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="terms" element={<TermsOfService />} />
                    <Route path="terms-of-service" element={<TermsOfService />} />
                  </Route>

                  {/* Admin Dashboard (Standalone Layout) */}
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/dev-dashboard" element={<DeveloperDashboard />} />
                  
                  {/* NexaTransform Hub LMIS Standalone Shell Routes (Skills Academy) */}
                  <Route path="/lmis" element={<LmisPortal />} />
                  <Route path="/lmis/learner" element={<ErrorBoundary name="LearnerPortalBoundary"><LearnerPortal /></ErrorBoundary>} />
                  <Route path="/lmis/lecturer" element={<ErrorBoundary name="LecturerPortalBoundary"><LecturerPortal /></ErrorBoundary>} />
                  <Route path="/lmis/lecturer/register" element={<LecturerRegistration />} />
                  <Route path="/lmis/faculty-registration" element={<LecturerRegistration />} />
                  <Route path="/lmis/admin" element={<ErrorBoundary name="AdminPortalBoundary"><AdminPortal /></ErrorBoundary>} />

                  {/* NexaTransform School LMIS Standalone Shell Routes (K-12 Edition) */}
                  {/* NOTE: School LMIS removed from live — code preserved for continued development */}
                  {/* <Route path="/schools" element={<SchoolsShowcase />} /> */}
                  {/* <Route path="/school-portal" element={<SchoolLmisHub />} /> */}
                  {/* <Route path="/school-lmis" element={<SchoolLmisHub />} /> */}
                  {/* <Route path="/schools/lmis" element={<SchoolLmisHub />} /> */}
                  {/* <Route path="/schools/lmis/admin" element={<ErrorBoundary name="SchoolAdminBoundary"><SchoolAdminPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/schools/lmis/teacher" element={<ErrorBoundary name="SchoolTeacherBoundary"><SchoolTeacherPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/schools/lmis/student" element={<ErrorBoundary name="SchoolStudentBoundary"><SchoolStudentPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/schools/lmis/learner" element={<ErrorBoundary name="SchoolStudentBoundary"><SchoolStudentPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/school-portal/admin" element={<ErrorBoundary name="SchoolAdminBoundary"><SchoolAdminPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/school-portal/teacher" element={<ErrorBoundary name="SchoolTeacherBoundary"><SchoolTeacherPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/school-portal/student" element={<ErrorBoundary name="SchoolStudentBoundary"><SchoolStudentPortal /></ErrorBoundary>} /> */}
                  {/* <Route path="/school-portal/demo" element={<ErrorBoundary name="SchoolPortalBoundary"><SchoolPortal /></ErrorBoundary>} /> */}

                  {/* Supabase Auth email-link handlers */}
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </AnalyticsProvider>
            </Router>
          </FeatureFlagsProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
