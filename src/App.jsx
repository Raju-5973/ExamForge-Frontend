import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Login } from './pages/Login';
import { StaffDashboard } from './pages/StaffDashboard';
import { PrincipalDashboard } from './pages/PrincipalDashboard';
import { GeneratedPapers } from './pages/GeneratedPapers';
import { Settings } from './pages/Settings';
import { QuestionBank } from './pages/QuestionBank';
import { QuestionPaper } from './pages/QuestionPaper';
import { StaffAccounts } from './pages/StaffAccounts';
import { LandingPage } from './pages/LandingPage';
import AIGenerator from './pages/AIGenerator';
import BlueprintBuilder from './pages/BlueprintBuilder';
import ApprovalWorkflowPage from './pages/ApprovalWorkflow';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import OBEMapping from './pages/OBEMapping';
import RecommendationEngine from './pages/RecommendationEngine';
import SecurePaperManager from './pages/SecurePaperManager';
import ExportFormats from './pages/ExportFormats';
import FormattingTemplates from './pages/FormattingTemplates';
import LMSIntegration from './pages/LMSIntegration';
import AuditTrail from './pages/AuditTrail';
import { Toaster } from 'react-hot-toast';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router - directs to role-specific dashboard
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'principal') {
    return <PrincipalDashboard />;
  }

  return <StaffDashboard />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/generated-papers"
        element={
          <ProtectedRoute allowedRoles={['principal', 'staff']}>
            <GeneratedPapers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-bank"
        element={
          <ProtectedRoute allowedRoles={['staff', 'principal']}>
            <QuestionBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-generator"
        element={
          <ProtectedRoute allowedRoles={['staff', 'principal']}>
            <AIGenerator />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blueprints"
        element={
          <ProtectedRoute allowedRoles={['principal', 'staff']}>
            <BlueprintBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/question-paper"
        element={
          <ProtectedRoute allowedRoles={['principal', 'staff']}>
            <QuestionPaper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-accounts"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <StaffAccounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <ApprovalWorkflowPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/obe-mapping"
        element={
          <ProtectedRoute allowedRoles={['principal', 'staff']}>
            <OBEMapping />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <ProtectedRoute allowedRoles={['staff', 'principal']}>
            <RecommendationEngine />
          </ProtectedRoute>
        }
      />
      <Route
        path="/secure-papers"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <SecurePaperManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-formats"
        element={
          <ProtectedRoute allowedRoles={['principal', 'staff']}>
            <ExportFormats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <FormattingTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lms-integration"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <LMSIntegration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-trail"
        element={
          <ProtectedRoute allowedRoles={['principal']}>
            <AuditTrail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white dark:border-gray-700 font-medium',
              duration: 3000,
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
