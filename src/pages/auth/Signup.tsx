import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Shield, Building2, HeartPulse, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { UserRole, BloodGroup } from '../../types';
import { OtpVerification } from './OtpVerification';

interface SignupProps {
  onGoToLogin: () => void;
  onGoToLanding: () => void;
  onSignupSuccess?: (role: UserRole) => void;
}

export const Signup: React.FC<SignupProps> = ({ onGoToLogin, onGoToLanding, onSignupSuccess }) => {
  const { signup } = useAuth();
  const [role, setRole] = useState<UserRole>('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('+91 98765 43210');
  const [location, setLocation] = useState('New Delhi, Delhi NCR');
  const [password, setPassword] = useState('demo123');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [showOtp, setShowOtp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'donor') {
      // Step 2: Show OTP modal for Donors
      setShowOtp(true);
    } else {
      finalizeSignup();
    }
  };

  const finalizeSignup = () => {
    const created = signup({
      name,
      role,
      email,
      contact,
      location,
      password,
      blood_group: role === 'donor' ? bloodGroup : undefined
    });
    if (onSignupSuccess) {
      onSignupSuccess(created.role);
    }
  };

  if (showOtp) {
    return (
      <OtpVerification
        contact={contact}
        onVerify={() => finalizeSignup()}
        onCancel={() => setShowOtp(false)}
      />
    );
  }

  const roleOptions: { id: UserRole; title: string; desc: string; icon: any }[] = [
    { id: 'donor', title: 'Blood Donor', desc: 'Donate blood, get urgent local alerts', icon: UserCheck },
    { id: 'blood_bank', title: 'Blood Bank', desc: 'Manage units, inventory & transfers', icon: Building2 },
    { id: 'hospital', title: 'Hospital', desc: 'Request blood & track availability', icon: HeartPulse },
    { id: 'admin', title: 'National Admin', desc: 'Grid oversight & audit control', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="flex justify-center cursor-pointer" onClick={onGoToLanding}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden shadow-xl shadow-blood-600/30 bg-white border border-slate-700 shrink-0">
              <img src="/raktsetu-logo.jpeg" alt="RaktSetu Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">RaktSetu</span>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[11px] font-black uppercase rounded bg-blood-600 text-white tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Create Network Account</p>
            </div>
          </div>
        </div>

        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-100">
          Register on RaktSetu AI
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl border border-slate-700/80 rounded-2xl backdrop-blur-md">
          {/* Role selector chips */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roleOptions.map(opt => {
                const Icon = opt.icon;
                const isSelected = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blood-600/20 border-blood-500 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blood-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{opt.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  {role === 'blood_bank' ? 'Blood Bank Name' : role === 'hospital' ? 'Hospital Name' : 'Full Name'}
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={role === 'donor' ? 'e.g. Ramesh Chandra' : 'e.g. Apollo Blood Centre'}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@entity.gov.in"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Phone / Contact</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">City / Location</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Parel, Mumbai"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-xs"
                  />
                </div>
              </div>
            </div>

            {role === 'donor' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300">Blood Group</label>
                <div className="mt-1 grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        bloodGroup === bg
                          ? 'bg-blood-600 text-white border-blood-500 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300">Create Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blood-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blood-600 hover:bg-blood-500 transition-all mt-4"
            >
              {role === 'donor' ? 'Verify via OTP & Continue' : 'Create Account & Enter'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="font-bold text-blood-400 hover:text-blood-300 transition-colors"
              >
                Sign In here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
