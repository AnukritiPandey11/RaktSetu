import React from 'react';
import {
  LogOut,
  Shield,
  Building2,
  HeartPulse,
  UserCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { NotificationDropdown } from './NotificationDropdown';
import { UserRole } from '../../types';
import { initDatabase } from '../../services/db';

interface NavbarProps {
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab }) => {
  const { user, logout, loginAsRole } = useAuth();

  const roleMeta: Record<UserRole, { label: string; icon: any; color: string }> = {
    admin: { label: 'Admin (National Grid)', icon: Shield, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    blood_bank: { label: 'Blood Bank Officer', icon: Building2, color: 'bg-rose-100 text-rose-800 border-rose-200' },
    hospital: { label: 'Hospital Transfusion', icon: HeartPulse, color: 'bg-sky-100 text-sky-800 border-sky-200' },
    donor: { label: 'Registered Donor', icon: UserCheck, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data (units, requests, suggestions) to default SIH seed state?')) {
      initDatabase(true);
      window.location.reload();
    }
  };

  const currentMeta = user?.role ? roleMeta[user.role] : null;
  const RoleIcon = currentMeta?.icon || Shield;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-blood-500/20 bg-white border border-slate-200 shrink-0">
              <img src="/raktsetu-logo.jpeg" alt="RaktSetu Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">RaktSetu</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[11px] font-black uppercase rounded bg-blood-600 text-white tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                National Blood Grid Coordination Layer
              </p>
            </div>
          </div>

          {/* Center: Quick Role Switcher for SIH Prototype Evaluation */}
          <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
            <span className="text-[11px] font-bold text-slate-400 px-2.5 uppercase tracking-wider">
              Quick Role:
            </span>
            {(['admin', 'blood_bank', 'hospital', 'donor'] as UserRole[]).map(r => {
              const active = user?.role === r;
              const labels: Record<UserRole, string> = {
                admin: 'Admin',
                blood_bank: 'Blood Bank',
                hospital: 'Hospital',
                donor: 'Donor'
              };
              return (
                <button
                  key={r}
                  onClick={() => loginAsRole(r)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-white text-blood-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reset Demo Data button */}
            <button
              onClick={handleResetData}
              title="Reset Demo Data"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset Seed</span>
            </button>

            {/* In-app Notification Bell */}
            <NotificationDropdown onNavigateTab={onNavigateTab} />

            {/* Active User Badge & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[11px] text-slate-500">{user.location}</span>
                </div>

                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                    currentMeta?.color || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">{user.role.replace('_', ' ')}</span>
                </div>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
