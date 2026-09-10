import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { HeatGuardLogo } from '../components/common/HeatGuardLogo';
import { Thermometer, Bell, ShieldCheck, MapPin, ArrowRight, ArrowLeft, Check, CheckCircle2 } from 'lucide-react';
import { LocationSearchInput } from '../components/common/LocationSearchInput';
import { CityLocation } from '../types';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const { completeOnboarding, user, updateUser } = useAuth();
  const { currentLocation, setLocation } = useLocation();
  const [step, setStep] = useState<number>(1);
  const [chosenLocation, setChosenLocation] = useState<CityLocation>(currentLocation);

  const steps = [
    {
      step: 1,
      icon: Thermometer,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20 border-orange-500/40',
      glowColor: 'bg-orange-600/20',
      title: 'Monitor Heat Risk',
      subtitle: 'Real-Time Environmental Intelligence',
      description:
        'Track ambient temperature, relative humidity, UV radiation, and composite Human Thermal Stress Index across global meteorological stations with live sub-hourly updates.'
    },
    {
      step: 2,
      icon: Bell,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20 border-red-500/40',
      glowColor: 'bg-red-600/20',
      title: 'Get Early Warnings',
      subtitle: 'AI-Powered Disaster Foresight',
      description:
        'Receive proactive alerts up to 48 hours before dangerous wet-bulb temperature thresholds are reached, enabling vulnerable outdoor communities to take shelter in time.'
    },
    {
      step: 3,
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 border-emerald-500/40',
      glowColor: 'bg-emerald-600/20',
      title: 'Protect Yourself',
      subtitle: 'Tailored Public Safety Recommendations',
      description:
        'Calculate your personal physiological risk score based on age, work category, and sun exposure, and access emergency cooling centers during severe heatwave events.'
    },
    {
      step: 4,
      icon: MapPin,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 border-cyan-500/40',
      glowColor: 'bg-cyan-600/20',
      title: 'Set Your Primary Location',
      subtitle: 'Search for your location',
      description:
        'Search for any city, town, or region worldwide to calibrate your local thermal telemetry station, heat stress calculations, and heatwave alerts.'
    }
  ];

  const current = steps[step - 1];
  const Icon = current.icon;

  const handleLocationSelect = (loc: CityLocation) => {
    setChosenLocation(loc);
    setLocation(loc);
    updateUser({ location: loc.name });
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      setLocation(chosenLocation);
      await updateUser({ location: chosenLocation.name });
      await completeOnboarding();
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F8FC] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${current.glowColor} rounded-full blur-3xl pointer-events-none transition-colors duration-500`} />

      {/* Top Header */}
      <div className="flex items-center justify-between max-w-2xl w-full mx-auto relative z-10">
        <HeatGuardLogo size="md" />
        <button
          onClick={handleSkip}
          className="text-xs text-[#9FB2C5] hover:text-white font-semibold cursor-pointer transition"
        >
          Skip Introduction
        </button>
      </div>

      {/* Center Onboarding Card */}
      <div className="max-w-xl w-full mx-auto sih-card rounded-3xl border border-[#23415A] p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Step Indicator Dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-orange-500'
                  : s < step
                  ? 'w-2.5 bg-emerald-500'
                  : 'w-2.5 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Large Animated Illustration Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-3xl ${current.iconBg} border flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105`}>
            <Icon className={`w-10 h-10 ${current.iconColor}`} />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block">
            {current.subtitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{current.title}</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Interactive Location Step (Step 4) */}
        {step === 4 && (
          <div className="space-y-4 pt-2 text-left">
            <label className="text-xs font-bold text-slate-300 block">
              Search for your location:
            </label>
            <LocationSearchInput
              onSelectLocation={handleLocationSelect}
              placeholder="Search city, town or location..."
              currentValue={chosenLocation?.displayName || chosenLocation?.name}
              showGpsOption
              autoFocus
            />

            {chosenLocation && (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">
                      {chosenLocation.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {chosenLocation.state ? `${chosenLocation.state}, ` : ''}{chosenLocation.country || 'Global Station'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[11px] text-slate-400 block">
                    {chosenLocation.lat.toFixed(2)}°, {chosenLocation.lng.toFixed(2)}°
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Calibrated</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 font-mono">
              Welcome, {user?.name.split(' ')[0] || 'User'}
            </div>
          )}

          <button
            onClick={handleNext}
            className="px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition cursor-pointer ml-auto"
          >
            <span>{step === 4 ? 'Enter Dashboard' : 'Next Step'}</span>
            {step === 4 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 relative z-10">
        HeatGuard • Extreme Heatwave Early Warning & Thermal Stress Platform
      </div>
    </div>
  );
};
