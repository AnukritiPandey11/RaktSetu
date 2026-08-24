import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../services/authContext';

import { UserRole } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onNavigateHome?: () => void;
  onRoleChange?: (role: UserRole) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onSelectTab,
  onNavigateHome,
  onRoleChange,
  onLogout
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        onNavigateTab={onSelectTab}
        onNavigateHome={onNavigateHome}
        onRoleChange={onRoleChange}
        onLogout={onLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <Sidebar activeTab={activeTab} onSelectTab={onSelectTab} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 <strong>RaktSetu AI</strong> — An Intelligent Coordination Layer for India's Blood Bank Network
            </p>
            <p className="text-[11px] text-slate-400 font-semibold">
              Smart India Hackathon Prototype • Demonstration Dataset
            </p>
          </div>
          <p className="text-[10px] text-slate-400 max-w-4xl mx-auto leading-relaxed">
            Prototype environment — production deployment would require centralized authentication, secure backend storage, audit controls and integration with authorized healthcare infrastructure.
          </p>
        </div>
      </footer>
    </div>
  );
};
