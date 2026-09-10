import React from 'react';
import { HeatGuardLogo } from '../components/common/HeatGuardLogo';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  ShieldCheck,
  Activity,
  ArrowRight,
  Droplets,
  Thermometer,
  SunMedium,
  CheckCircle2,
  Bell,
  MapPin,
  HeartPulse,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogin,
  onExploreDemo
}) => {
  return (
    <div className="min-h-screen bg-[#0E121A] text-stone-100 overflow-x-hidden relative selection:bg-orange-500/30 selection:text-orange-200">
      {/* Warm ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-1/3 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute top-[50px] right-1/4 w-[350px] h-[350px] bg-amber-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-stone-800/80">
        <HeatGuardLogo size="lg" />

        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-300 hover:text-white hover:bg-stone-900 transition cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-xl bg-[#E05822] hover:bg-[#D04D18] text-white font-bold text-xs sm:text-sm transition shadow-sm cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 sm:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 border border-orange-500/30 text-xs font-semibold text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Extreme Heatwave Early Warning Platform</span>
              <span className="text-stone-500">•</span>
              <span className="text-stone-300 font-mono">Live Telemetry</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Know the Heat.{' '}
              <span className="text-[#E05822]">
                Predict the Risk.
              </span>{' '}
              Protect Lives.
            </h1>

            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Extreme heat builds up silently before the body feels acute distress. HeatGuard analyzes atmospheric telemetry and human thermal stress index to deliver timely warnings and tailored safety guidance.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E05822] hover:bg-[#D04D18] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-950/40 transition cursor-pointer"
              >
                <span>Launch HeatGuard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreDemo}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                <span>Explore Live Station Telemetry</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-stone-800/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Real-Time Telemetry</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Thermal Stress AI</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>Early Warnings</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Personal Safety</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Live Telemetry Preview Card */}
          <div className="lg:col-span-5">
            <div className="warm-card rounded-2xl p-6 border border-stone-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                    Vijayawada Monitoring Station
                  </span>
                </div>
                <RiskBadge level="Very High" size="sm" />
              </div>

              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-semibold block">Thermal Stress Index</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-4xl font-black font-mono text-red-400">84</span>
                    <span className="text-stone-400 font-bold text-xs">/100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-stone-400 block">Peak Risk Today</span>
                  <span className="text-xs font-bold text-amber-300 mt-1 block">12 PM – 4 PM</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-400 flex items-center gap-1 font-semibold">
                    <Thermometer className="w-3 h-3 text-orange-400" /> Temperature
                  </span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5 block">42.4°C</span>
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-[10px] text-stone-400 flex items-center gap-1 font-semibold">
                    <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                  </span>
                  <span className="text-lg font-bold font-mono text-white mt-0.5 block">68%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-950/20 border border-orange-500/30 text-xs text-stone-300 flex items-start gap-2">
                <SunMedium className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p>
                  Elevated ambient temperature combined with high humidity limits sweat evaporation. Stay hydrated and avoid strenuous outdoor activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why HeatGuard Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-14 border-t border-stone-800/80">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Why HeatGuard?
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm">
            Extreme heat can become dangerous before people realize the risk. HeatGuard combines weather data, thermal stress modeling, AI prediction, and early warning to protect communities.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="warm-card p-5 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs font-mono font-bold text-orange-400">01</span>
            <h3 className="text-base font-bold text-white">Weather Data</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Real-time dry bulb temperature, relative humidity, solar UV radiation, and wind velocity.
            </p>
          </div>

          <div className="warm-card p-5 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs font-mono font-bold text-red-400">02</span>
            <h3 className="text-base font-bold text-white">Thermal Stress</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Human physiological stress index (0–100) assessing sweat evaporation and metabolic burden.
            </p>
          </div>

          <div className="warm-card p-5 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs font-mono font-bold text-amber-400">03</span>
            <h3 className="text-base font-bold text-white">AI Prediction</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Predictive models forecasting diurnal heat peaks and heatwave duration up to 7 days ahead.
            </p>
          </div>

          <div className="warm-card p-5 rounded-xl border border-stone-800 space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-400">04</span>
            <h3 className="text-base font-bold text-white">Early Warning</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Proactive community warnings, emergency red alerts, and customized protection recommendations.
            </p>
          </div>
        </div>

        {/* Quick Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
              <MapPin className="w-4 h-4" />
              <span>Geospatial Risk Mapping</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Interactive heat stress visualization across Indian stations and districts with danger zone markers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <HeartPulse className="w-4 h-4" />
              <span>Personal Risk Calculator</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Personalized vulnerability calculation factoring age, physical labor, sun exposure, and duration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Bell className="w-4 h-4" />
              <span>Early Warning Advisories</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Direct notifications and emergency cooling center locator to prevent heat stroke before peak hours.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 py-6 px-6 text-center text-xs text-stone-400">
        <p>© 2026 HeatGuard. Extreme Heatwave Early Warning & Human Thermal Stress Index.</p>
      </footer>
    </div>
  );
};
