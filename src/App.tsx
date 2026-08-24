import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './services/authContext';
import { NotificationProvider } from './services/notificationContext';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { BloodBankDashboard } from './pages/bloodbank/BloodBankDashboard';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { UserRole } from './types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, loginAsRole } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Reset tab to overview whenever the role changes
  useEffect(() => {
    setActiveTab('overview');
  }, [user?.role]);

  // Unauthenticated view
  if (!isAuthenticated) {
    if (authView === 'login') {
      return (
        <Login
          onGoToSignup={() => setAuthView('signup')}
          onGoToLanding={() => setAuthView('landing')}
        />
      );
    }
    if (authView === 'signup') {
      return (
        <Signup
          onGoToLogin={() => setAuthView('login')}
          onGoToLanding={() => setAuthView('landing')}
        />
      );
    }
    return (
      <LandingPage
        onOpenLogin={() => setAuthView('login')}
        onOpenSignup={() => setAuthView('signup')}
        onDirectRoleLogin={(role: UserRole) => loginAsRole(role)}
      />
    );
  }

  // Authenticated Role Dashboards
  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard activeTab={activeTab} onNavigateTab={setActiveTab} />;
      case 'blood_bank':
        return <BloodBankDashboard activeTab={activeTab} onNavigateTab={setActiveTab} />;
      case 'hospital':
        return <HospitalDashboard activeTab={activeTab} onNavigateTab={setActiveTab} />;
      case 'donor':
        return <DonorDashboard activeTab={activeTab} onNavigateTab={setActiveTab} />;
      default:
        return <AdminDashboard activeTab={activeTab} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderDashboard()}
    </Layout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
