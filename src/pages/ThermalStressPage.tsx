import React from 'react';
import { useLocation } from '../context/LocationContext';
import { heatRiskService } from '../services/heatRiskService';
import { RiskBadge } from '../components/common/RiskBadge';
import { RiskGauge } from '../components/common/RiskGauge';
import { PersonalRiskCalculator } from '../components/calculator/PersonalRiskCalculator';
import {
  Activity,
  HeartPulse,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Clock,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const ThermalStressPage: React.FC = () => {
  const { currentLocation, weather } = useLocation();
  const colors = heatRiskService.getRiskColor(currentLocation.riskLevel);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
          <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Biometeorology & Human Physiology Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Human Thermal Stress Index (HTSI)
        </h1>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl">
          Thermal stress represents the combined effect of air temperature, relative humidity, direct solar irradiance, and wind velocity on the human body's core thermoregulatory capacity.
        </p>
      </div>

      {/* Hero Index Analysis Box */}
      <div className={`glass-panel rounded-3xl p-6 sm:p-8 border ${colors.border} relative overflow-hidden shadow-2xl`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Breakdown (7 Columns) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 uppercase tracking-wider">
                Current Ambient State: {currentLocation.name}
              </span>
              <RiskBadge level={currentLocation.riskLevel} size="md" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Ambient Temperature Alone Is Misleading
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When relative humidity is elevated (<strong className="text-white">{weather.humidity}%</strong>), the air is near vapor saturation. Sweat cannot evaporate effectively, causing heat to rapidly accumulate inside the human core and triggering dangerous physiological heat strain.
            </p>

            {/* Factor Grid Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Thermometer className="w-3 h-3 text-orange-400" /> Dry Bulb Temp
                </span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">{weather.temperature}°C</span>
                <span className="text-[10px] text-red-400">High Heat Impact</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Droplets className="w-3 h-3 text-blue-400" /> Relative Humidity
                </span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">{weather.humidity}%</span>
                <span className="text-[10px] text-orange-400">Inhibits Sweating</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Wind className="w-3 h-3 text-teal-400" /> Wind Velocity
                </span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">{weather.windSpeed} km/h</span>
                <span className="text-[10px] text-teal-400">Marginal Cooling</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Sun className="w-3 h-3 text-purple-400" /> UV / Solar Load
                </span>
                <span className="text-base font-bold font-mono text-white mt-0.5 block">{weather.uvIndex} / 12</span>
                <span className="text-[10px] text-red-400">Severe Radiation</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-2">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Clock className="w-3 h-3 text-amber-400" /> Diurnal Exposure Window
                </span>
                <span className="text-xs font-bold text-amber-300 mt-1 block">
                  12:00 PM – 4:00 PM (Peak Solar Elevation)
                </span>
              </div>
            </div>
          </div>

          {/* Right Radial Gauge Display (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <RiskGauge
              score={currentLocation.thermalStressScore}
              riskLevel={currentLocation.riskLevel}
              size={290}
            />
          </div>
        </div>
      </div>

      {/* Personal Thermal Risk Calculator Section */}
      <div className="space-y-4 pt-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Personalized Physiological Risk Modeling</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Personal Thermal Risk Calculator
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Input your specific working conditions, duration, age, and exposure level to determine your unique vulnerability score.
          </p>
        </div>

        <PersonalRiskCalculator />
      </div>
    </div>
  );
};
