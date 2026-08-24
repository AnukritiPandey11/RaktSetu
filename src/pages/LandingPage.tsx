import React from 'react';
import {
  Droplet,
  ShieldCheck,
  TrendingDown,
  ArrowRightLeft,
  UserCheck,
  Building2,
  HeartPulse,
  Shield,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onOpenLogin: (preselectedRole?: UserRole) => void;
  onOpenSignup: () => void;
  onDirectRoleLogin: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onOpenSignup,
  onDirectRoleLogin
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blood-600 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blood-700 to-blood-500 shadow-lg shadow-blood-600/30">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">RaktSetu</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-black uppercase rounded bg-blood-600 text-white tracking-wider">
                  <Sparkles className="w-3 h-3" /> AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Intelligent Blood Bank Coordination Layer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenLogin()}
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onOpenSignup}
              className="px-5 py-2 text-sm font-bold bg-blood-600 hover:bg-blood-500 text-white rounded-xl shadow-lg shadow-blood-600/25 transition-all flex items-center gap-1.5"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blood-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-blood-400 mb-6">
            <Activity className="w-4 h-4 text-blood-500 animate-pulse" />
            Next-Gen Coordination for India's Blood Bank Infrastructure
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            An Intelligent Coordination Layer for{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blood-400 via-rose-300 to-amber-200">
              India's Blood Banks
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminating preventable blood expiry and critical shortages across blood banks and hospitals
            through predictive intelligence and <strong>Human-in-the-Loop</strong> smart redistribution.
          </p>

          {/* Quick Sandbox Selector */}
          <div className="mt-10 p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md max-w-4xl mx-auto shadow-2xl">
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">
              ✨ Experience Live Role Dashboards (SIH Prototype Demo)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onDirectRoleLogin('admin')}
                className="flex flex-col items-center p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-200">National Admin</span>
                <span className="text-[10px] text-slate-400">Grid Overview & HITL</span>
              </button>

              <button
                onClick={() => onDirectRoleLogin('blood_bank')}
                className="flex flex-col items-center p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-rose-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-200">Blood Bank</span>
                <span className="text-[10px] text-slate-400">AIIMS Component Lab</span>
              </button>

              <button
                onClick={() => onDirectRoleLogin('hospital')}
                className="flex flex-col items-center p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-200">Hospital</span>
                <span className="text-[10px] text-slate-400">Safdarjung Trauma</span>
              </button>

              <button
                onClick={() => onDirectRoleLogin('donor')}
                className="flex flex-col items-center p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 transition-all group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-200">Donor</span>
                <span className="text-[10px] text-slate-400">Pledge & History</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Section */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How RaktSetu AI Transforms the Blood Grid
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Four interconnected intelligence mechanisms engineered for safety, speed, and zero wastage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blood-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blood-600/20 text-blood-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Predict Shortages</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Anticipates localized deficits 48-72 hours in advance using historical trauma patterns,
                hospital bed occupancies, and seasonal indicators.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Prevent Expiry</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Flags fragile blood components (Platelets ~5 days shelf-life) approaching expiration before
                they become clinical waste.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Smart Redistribution</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Calculates optimal transfer routes between surplus blood banks and deficit hospital clusters
                to balance supply across regions.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Human-in-the-Loop</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                No transfer executes automatically. Authorized medical officers retain 100% final authority
                with full immutable audit logging.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Stats Ticker */}
      <section className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-3xl font-black text-blood-400">4,200+</div>
              <div className="text-xs text-slate-400 mt-1">Licensed Indian Blood Banks</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-3xl font-black text-amber-400">~6.5 Lakh</div>
              <div className="text-xs text-slate-400 mt-1">Units Wasted Annually (Pre-AI)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-3xl font-black text-emerald-400">84%</div>
              <div className="text-xs text-slate-400 mt-1">Platelet Wastage Reduction Target</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800">
              <div className="text-3xl font-black text-sky-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Human-Verified Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory & Scope Disclaimer */}
      <section className="py-8 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 text-center leading-relaxed">
          <p className="font-semibold text-slate-400 mb-1">Healthcare Protocol & Regulatory Note</p>
          <p>
            RaktSetu AI functions strictly as an intelligent coordination and clinical decision-support layer.
            It does not perform real-world medical verification, physical transport logistics, or blood testing.
            All redistribution suggestions must be validated by certified blood bank officers in compliance with
            National Blood Transfusion Council (NBTC) and CDSCO guidelines.
          </p>
        </div>
      </section>
    </div>
  );
};
