import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Shield, Building2, HeartPulse, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { UserRole } from '../../types';

interface LoginProps {
  onGoToSignup: () => void;
  onGoToLanding: () => void;
  defaultRole?: UserRole;
}

export const Login: React.FC<LoginProps> = ({ onGoToSignup, onGoToLanding, defaultRole }) => {
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setError('Invalid credentials. You can use password "demo123" or use the 1-Click Role Login below.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-blood-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center cursor-pointer" onClick={onGoToLanding}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-blood-600/30 bg-white border border-slate-700 shrink-0">
              <img src="/raktsetu-logo.jpeg" alt="RaktSetu Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">RaktSetu</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[11px] font-black uppercase rounded bg-blood-600 text-white tracking-wider">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">National Blood Grid Sign In</p>
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-slate-100">
          Access Your Role Dashboard
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 py-8 px-4 shadow-2xl border border-slate-700/80 sm:rounded-2xl sm:px-10 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@hospital.gov.in"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blood-600 hover:bg-blood-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blood-500 transition-all mt-2"
            >
              Sign In to Portal <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Role Switcher Section for Evaluators */}
          <div className="mt-6 pt-6 border-t border-slate-700/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              ⚡ Instant 1-Click Demo Login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsRole('admin')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs font-medium text-purple-300"
              >
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200">Admin</div>
                  <div className="text-[10px] text-slate-400">National Grid</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => loginAsRole('blood_bank')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs font-medium text-rose-300"
              >
                <Building2 className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200">Blood Bank</div>
                  <div className="text-[10px] text-slate-400">AIIMS Lab</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => loginAsRole('hospital')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs font-medium text-sky-300"
              >
                <HeartPulse className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200">Hospital</div>
                  <div className="text-[10px] text-slate-400">Safdarjung</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => loginAsRole('donor')}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-700/80 border border-slate-700 text-left transition-all text-xs font-medium text-emerald-300"
              >
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-slate-200">Donor</div>
                  <div className="text-[10px] text-slate-400">Rahul Sharma</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Need a new account?{' '}
              <button
                type="button"
                onClick={onGoToSignup}
                className="font-bold text-blood-400 hover:text-blood-300 transition-colors"
              >
                Register Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
