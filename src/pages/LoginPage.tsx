import React, { useState } from 'react';
import { HeatGuardLogo } from '../components/common/HeatGuardLogo';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Eye, EyeOff, ArrowRight, Sparkles, SunMedium, AlertTriangle, KeyRound, CheckCircle2, X } from 'lucide-react';

interface LoginPageProps {
  onNavigateToSignup: () => void;
  onLoginSuccess: () => void;
  onNavigateToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToSignup,
  onLoginSuccess,
  onNavigateToHome
}) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean; resetToken?: string } | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  // Quotes
  const quotes = [
    "It's 42°C outside. Let's make sure you don't boil today.",
    "Logging in before the thermometer mercury hits the ceiling.",
    "Drink some water. We'll handle the rest.",
    "Thermal stress is real. Your cool head is too."
  ];
  const [randomQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  const validate = () => {
    const newErrors: { identifier?: string; password?: string; general?: string } = {};

    if (!identifier.trim() && !password) {
      newErrors.general = 'Please enter your email and password.';
    } else {
      if (!identifier.trim()) {
        newErrors.identifier = 'Please enter your email address.';
      }
      if (!password) {
        newErrors.password = 'Password is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(identifier, password);
      onLoginSuccess();
    } catch (err: any) {
      setErrors({ general: err.message || 'Invalid email or password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoQuickFill = () => {
    setIdentifier('krishna.sai@heatguard.ai');
    setPassword('DemoPass2026!');
    setErrors({});
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotMsg({ text: 'Please enter your account email address.', isError: true });
      return;
    }
    setIsForgotSubmitting(true);
    try {
      const res = await authService.requestPasswordReset(forgotEmail);
      setForgotMsg({
        text: res.message,
        isError: false,
        resetToken: res.resetToken
      });
    } catch (err: any) {
      setForgotMsg({ text: err.message || 'Failed to request reset.', isError: true });
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F8FC] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Ambient Heat Tint */}
      <div className="absolute top-12 w-72 h-72 bg-[#36C5F0]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md sih-card rounded-2xl p-6 sm:p-8 border border-[#23415A] shadow-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div
            onClick={onNavigateToHome}
            className="inline-block cursor-pointer hover:opacity-90 transition"
          >
            <HeatGuardLogo size="md" showSubtitle={false} />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 animate-heat-wiggle">
              <SunMedium className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
            </div>
            <span className="text-xs font-mono text-stone-400 bg-stone-900/80 px-2.5 py-1 rounded-full border border-stone-800">
              🌡️ 42°C Alert Active
            </span>
          </div>

          <p className="text-xs text-stone-400 font-medium italic pt-1">
            "{randomQuote}"
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. krishna.sai@heatguard.ai"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-hidden transition ${
                errors.identifier || errors.general ? 'border-red-500' : 'border-stone-700/80 focus:border-orange-500'
              }`}
            />
            {errors.identifier && (
              <p className="text-[11px] text-red-400">{errors.identifier}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-300">Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(identifier);
                  setForgotMsg(null);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-orange-400 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 pr-10 py-2.5 rounded-xl bg-stone-900 border text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-hidden transition ${
                  errors.password || errors.general ? 'border-red-500' : 'border-stone-700/80 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-stone-400 hover:text-stone-200 absolute right-1.5 top-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] active:scale-[0.99] disabled:opacity-50 text-[#07111F] font-bold text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer mt-2"
          >
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Enter HeatGuard Platform'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Demo Button */}
          <button
            type="button"
            onClick={handleDemoQuickFill}
            className="w-full py-2 rounded-xl bg-[#12263A] hover:bg-[#17324A] border border-[#23415A] text-[#9FB2C5] hover:text-[#F4F8FC] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#36C5F0]" />
            <span>Fill Verified Demo Credentials</span>
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-800 text-center text-xs text-stone-400">
          New here?{' '}
          <button
            onClick={onNavigateToSignup}
            className="text-orange-400 font-bold hover:underline ml-1 cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute right-4 top-4 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-orange-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-sm text-white">Reset Account Password</h3>
            </div>

            <p className="text-xs text-stone-400">
              Enter your registered email address to receive password reset authorization.
            </p>

            {forgotMsg && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                forgotMsg.isError ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}>
                {forgotMsg.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <div>
                  <p>{forgotMsg.text}</p>
                  {forgotMsg.resetToken && (
                    <p className="mt-1 font-mono text-[10px] text-amber-300">
                      [Demo Mode Token]: {forgotMsg.resetToken}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <input
                type="email"
                placeholder="registered@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-orange-500 focus:outline-hidden"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold"
                >
                  {isForgotSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
