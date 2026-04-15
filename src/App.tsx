import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Mandi from './pages/Mandi';
import MarketDashboard from './pages/MarketDashboard';
import MandiDashboard from './pages/MandiDashboard';
import MandiRates from './pages/MandiRates';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Profile from './pages/Profile';
import Weather from './pages/Weather';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Support from './pages/Support';
import ExpertAdvisor from './pages/ExpertAdvisor';
import Verified from './pages/Verified';
import VerifyEmail from './pages/VerifyEmail';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Global verification gate: Redirect unverified users to /verify-email
  // except for login, register, and verify-email pages themselves.
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isVerifyPage = location.pathname === '/verify-email' || location.pathname === '/verified';
  
  if (user && !user.emailVerified && !isVerifyPage && !isAuthPage) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crop-scan" element={<Scan />} />
        <Route path="/mandi-prices" element={<Mandi />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/expert-advisor" element={<ExpertAdvisor />} />
        <Route path="/scan" element={<Navigate to="/crop-scan" replace />} />
        <Route path="/mandi" element={<Navigate to="/mandi-prices" replace />} />
        <Route path="/market-dashboard" element={<MarketDashboard />} />
        <Route path="/market-intelligence" element={<MandiDashboard />} />
        <Route path="/mandi-analytics" element={<MandiRates />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/verified" element={<Verified />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
