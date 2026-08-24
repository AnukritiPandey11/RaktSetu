import React, { useState } from 'react';
import { Smartphone, CheckCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

interface OtpVerificationProps {
  contact: string;
  onVerify: () => void;
  onCancel: () => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({ contact, onVerify, onCancel }) => {
  const [otp, setOtp] = useState(['7', '4', '8', '2', '9', '1']);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleConfirm = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerify();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl border border-slate-700/80 sm:rounded-2xl sm:px-10 text-center backdrop-blur-md">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
            <Smartphone className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-white">Verify Phone Number</h3>
          <p className="text-xs text-slate-300 mt-1">
            Simulated OTP sent to <strong className="text-emerald-400">{contact || '+91 98765 43210'}</strong>
          </p>

          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Prototype Demo OTP: <strong>748291</strong> (prefilled)</span>
          </div>

          <div className="flex justify-center gap-2 mt-6 mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-input-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                className="w-11 h-12 text-center text-lg font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            ))}
          </div>

          <button
            onClick={handleConfirm}
            disabled={isVerifying}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
          >
            {isVerifying ? (
              <span>Verifying OTP...</span>
            ) : (
              <>
                Confirm & Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setOtp(['7', '4', '8', '2', '9', '1'])}
              className="hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Resend Code
            </button>
            <button onClick={onCancel} className="hover:text-rose-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
