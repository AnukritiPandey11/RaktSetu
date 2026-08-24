import React from 'react';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Boxes,
  PlusCircle,
  Clock,
  HeartHandshake,
  User,
  History,
  FileCheck2,
  MapPin,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { user } = useAuth();

  if (!user) return null;

  const roleNavMap: Record<UserRole, NavItem[]> = {
    admin: [
      { id: 'overview', label: 'Network Overview', icon: LayoutDashboard },
      { id: 'bloodbanks', label: 'Blood Banks Directory', icon: Building2 },
      { id: 'redistribution', label: 'Redistribution Board', icon: ArrowLeftRight, badge: 'HITL' },
      { id: 'alerts', label: 'Shortage & Expiry Alerts', icon: AlertTriangle },
      { id: 'analytics', label: 'Network Analytics', icon: BarChart3 },
      { id: 'audit', label: 'Feedback Audit Log', icon: FileCheck2 }
    ],
    blood_bank: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Stock Inventory', icon: Boxes },
      { id: 'manage-stock', label: 'Add & Update Stock', icon: PlusCircle },
      { id: 'redistribution', label: 'Redistribution', icon: ArrowLeftRight },
      { id: 'predicted-risks', label: 'Predicted Risks', icon: TrendingUp, badge: 'AI Preview' },
      { id: 'alerts', label: 'Shortage Alerts', icon: AlertTriangle }
    ],
    hospital: [
      { id: 'overview', label: 'Hospital Dashboard', icon: LayoutDashboard },
      { id: 'request-form', label: 'Request Blood', icon: PlusCircle, badge: 'Priority' },
      { id: 'request-history', label: 'Request History', icon: History },
      { id: 'predicted-availability', label: 'Predicted Availability', icon: MapPin, badge: 'AI Forecast' }
    ],
    donor: [
      { id: 'overview', label: 'Donor Dashboard', icon: LayoutDashboard },
      { id: 'urgent-needs', label: 'Urgent Need Near You', icon: AlertTriangle, badge: 'Urgent' },
      { id: 'donation-history', label: 'Donation History', icon: Clock },
      { id: 'register-donation', label: 'Pledge / Donate', icon: HeartHandshake },
      { id: 'profile', label: 'Availability & Profile', icon: User }
    ]
  };

  const navItems = roleNavMap[user.role] || [];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm sticky top-20">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation Menu
        </div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blood-600 text-white shadow-md shadow-blood-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'HITL'
                        ? 'bg-amber-100 text-amber-800'
                        : item.badge === 'Urgent' || item.badge === 'Priority'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Info card at bottom of sidebar */}
        <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-700">RaktSetu SIH Prototype</p>
          <p className="mt-0.5 text-[10px] leading-relaxed">
            Role-based access active. Human-in-the-loop validation enforced for all unit transfers.
          </p>
        </div>
      </div>
    </aside>
  );
};
