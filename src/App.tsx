import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Header from './components/Header';
import ModeToggle from './components/ModeToggle';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import DocumentUpload from './pages/DocumentUpload';
import EmailIntegration from './pages/EmailIntegration';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import TaxCalculator from './pages/TaxCalculator';
import AIAssistant from './pages/AIAssistant';
import AccountantDashboard from './pages/AccountantDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Component to handle URL parameters
const AppContent = () => {
  const { isAuthenticated, user, isLoading } = useApp();
  const location = useLocation();
  const [initializing, setInitializing] = React.useState(true);

  // Check for URL parameters and apply filters
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    const view = params.get('view');

    if (filter || view) {
      // Store in sessionStorage for components to read
      if (filter) sessionStorage.setItem('dashboardFilter', filter);
      if (view) sessionStorage.setItem('analyticsView', view);
    }
  }, [location]);

  // Wait for initial auth check
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={() => {}} />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to={user?.userRole === 'accountant' ? '/accountant' : '/dashboard'} replace /> : <LandingPage />}
        />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/accountant" element={<ProtectedRoute><AccountantDashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><DocumentUpload /></ProtectedRoute>} />
        <Route path="/email" element={<ProtectedRoute><EmailIntegration /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/calculator" element={<ProtectedRoute><TaxCalculator /></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
      <ModeToggle />
    </div>
  );
};

function App() {

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;