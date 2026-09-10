import React, { useState } from 'react';
import { HeatGuardLogo } from '../components/common/HeatGuardLogo';
import { useAuth } from '../context/AuthContext';
import { UserCategory } from '../types';
import { LocationSearchInput } from '../components/common/LocationSearchInput';
import {
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface SignupPageProps {
  onNavigateToLogin: () => void;
  onSignupSuccess: () => void;
  onNavigateToHome: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateToLogin,
  onSignupSuccess,
  onNavigateToHome
}) => {
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: 'Vijayawada',
    userCategory: 'Outdoor Worker' as UserCategory
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
      case 2:
        return { score: 35, label: 'Weak', color: 'bg-red-500' };
      case 3:
        return { score: 70, label: 'Good', color: 'bg-orange-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 15, label: 'Too short', color: 'bg-red-500' };
    }
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = 'Full name is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      err.email = 'Please provide a valid email address.';
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      err.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.password || formData.password.length < 8) {
      err.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      err.password = 'Password must include uppercase, lowercase, and number.';
    }

    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = 'Passwords do not match.';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        userCategory: formData.userCategory,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      onSignupSuccess();
    } catch (err: any) {
      setErrors({ form: err.message || 'Registration failed. Please check your information.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userCategories: UserCategory[] = [
    'General Public',
    'Student',
    'Outdoor Worker',
    'Farmer',
    'Elderly',
    'Delivery Agent',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F8FC] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-xl w-full mx-auto sih-card rounded-3xl border border-[#23415A] p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="flex items-center justify-between pb-6 border-b border-[#23415A]">
          <div onClick={onNavigateToHome} className="cursor-pointer">
            <HeatGuardLogo size="md" />
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#36C5F0]/20 text-[#36C5F0] border border-[#36C5F0]/30">
            Account Registration
          </span>
        </div>

        <div className="mt-6 mb-6">
          <h2 className="text-2xl font-black text-white">Create Your HeatGuard Account</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Get personalized heat stress alerts and tailored safety advisories.
          </p>
        </div>

        {/* Global Error Alert */}
        {errors.form && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-300 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="e.g. Sri Krishna Sai"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden ${
                  errors.name ? 'border-red-500' : 'border-slate-800 focus:border-orange-500'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  placeholder="krishna@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden ${
                    errors.email ? 'border-red-500' : 'border-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  placeholder="+91 98480 22338"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden ${
                    errors.phone ? 'border-red-500' : 'border-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Location & User Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Primary Location</label>
              <LocationSearchInput
                currentValue={formData.location}
                onSelectLocation={(loc) => setFormData({ ...formData, location: loc.displayName || loc.name })}
                placeholder="Search city, town or location..."
                showGpsOption
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">User Category</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select
                  value={formData.userCategory}
                  onChange={(e) => setFormData({ ...formData, userCategory: e.target.value as UserCategory })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-hidden focus:border-orange-500 font-semibold"
                >
                  {userCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="Min. 8 chars (A-Z, a-z, 0-9)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden ${
                    errors.password ? 'border-red-500' : 'border-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Password Strength:</span>
                <span className="font-bold text-slate-300">{strength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] disabled:opacity-50 text-[#07111F] font-black text-sm shadow-xl flex items-center justify-center gap-2 transition cursor-pointer mt-4"
          >
            <span>{isSubmitting ? 'Creating Secure Account...' : 'Complete Registration & Proceed'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#23415A] text-center text-xs text-[#9FB2C5]">
          Already registered?{' '}
          <button
            onClick={onNavigateToLogin}
            className="text-[#36C5F0] font-bold hover:underline ml-1 cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};
