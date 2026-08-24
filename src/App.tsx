import React, { useState, useEffect, useCallback } from 'react';
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
import { AppRoute, parsePath, formatPath } from './services/navigation';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, loginAsRole, logout } = useAuth();

  // Initialize routing state from the current browser URL
  const [route, setRoute] = useState<AppRoute>(() => parsePath(window.location.pathname));
  const [activeTab, setActiveTab] = useState<string>(() => {
    const initial = parsePath(window.location.pathname);
    return initial.tab || 'overview';
  });

  // Listen for browser Back and Forward navigation events (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const nextRoute = parsePath(window.location.pathname);
      setRoute(nextRoute);
      setActiveTab(nextRoute.tab || 'overview');

      // If popping into a role dashboard, ensure user role matches in demo mode
      if (nextRoute.page === 'dashboard' && nextRoute.role) {
        if (!user || user.role !== nextRoute.role) {
          loginAsRole(nextRoute.role);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, loginAsRole]);

  // Ensure direct route access / refresh on dashboard URLs syncs with session
  useEffect(() => {
    if (route.page === 'dashboard' && route.role) {
      if (!user || user.role !== route.role) {
        loginAsRole(route.role);
      }
      if (route.tab && route.tab !== activeTab) {
        setActiveTab(route.tab);
      }
    }
  }, []);

  // Central programmatic navigation handler that pushes to browser history
  const navigateTo = useCallback((targetPath: string, replace: boolean = false) => {
    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ path: targetPath }, '', targetPath);
      } else {
        window.history.pushState({ path: targetPath }, '', targetPath);
      }
    }
    const nextRoute = parsePath(targetPath);
    setRoute(nextRoute);
    setActiveTab(nextRoute.tab || 'overview');

    if (nextRoute.page === 'dashboard' && nextRoute.role) {
      if (!user || user.role !== nextRoute.role) {
        loginAsRole(nextRoute.role);
      }
    }
  }, [user, loginAsRole]);

  // Handle tab switching within a dashboard
  const handleSelectTab = useCallback((tab: string) => {
    setActiveTab(tab);
    const currentRole = user?.role || route.role || 'admin';
    const targetPath = formatPath('dashboard', currentRole, tab);
    navigateTo(targetPath);
  }, [user?.role, route.role, navigateTo]);

  // Handle switching user role (Quick Role Switcher)
  const handleRoleChange = useCallback((role: UserRole) => {
    loginAsRole(role);
    const targetPath = formatPath('dashboard', role, 'overview');
    navigateTo(targetPath);
  }, [loginAsRole, navigateTo]);

  // Handle login success
  const handleLoginSuccess = useCallback((role?: UserRole) => {
    const targetRole = role || user?.role || 'admin';
    const targetPath = formatPath('dashboard', targetRole, 'overview');
    navigateTo(targetPath);
  }, [user?.role, navigateTo]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigateTo('/', false);
  }, [logout, navigateTo]);

  // Render Login page
  if (route.page === 'login') {
    return (
      <Login
        onGoToSignup={() => navigateTo('/signup')}
        onGoToLanding={() => navigateTo('/')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Signup page
  if (route.page === 'signup') {
    return (
      <Signup
        onGoToLogin={() => navigateTo('/login')}
        onGoToLanding={() => navigateTo('/')}
        onSignupSuccess={handleLoginSuccess}
      />
    );
  }

  // Render Landing page when explicitly on '/' or when unauthenticated
  if (route.page === 'landing' || (!isAuthenticated && route.page !== 'dashboard')) {
    return (
      <LandingPage
        onOpenLogin={() => navigateTo('/login')}
        onOpenSignup={() => navigateTo('/signup')}
        onDirectRoleLogin={(role: UserRole) => handleRoleChange(role)}
      />
    );
  }

  // Render Authenticated Role Dashboards
  const renderDashboard = () => {
    const currentRole = user?.role || route.role || 'admin';
    switch (currentRole) {
      case 'admin':
        return <AdminDashboard activeTab={activeTab} onNavigateTab={handleSelectTab} />;
      case 'blood_bank':
        return <BloodBankDashboard activeTab={activeTab} onNavigateTab={handleSelectTab} />;
      case 'hospital':
        return <HospitalDashboard activeTab={activeTab} onNavigateTab={handleSelectTab} />;
      case 'donor':
        return <DonorDashboard activeTab={activeTab} onNavigateTab={handleSelectTab} />;
      default:
        return <AdminDashboard activeTab={activeTab} onNavigateTab={handleSelectTab} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onNavigateHome={() => navigateTo('/')}
      onRoleChange={handleRoleChange}
      onLogout={handleLogout}
    >
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
