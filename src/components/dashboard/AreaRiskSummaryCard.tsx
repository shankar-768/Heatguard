import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { RiskBadge } from '../common/RiskBadge';
import { MapPin, ArrowRight, Activity, Thermometer, Droplets, Clock } from 'lucide-react';

interface AreaRiskSummaryCardProps {
  onViewDetails?: () => void;
}

export const AreaRiskSummaryCard: React.FC<AreaRiskSummaryCardProps> = ({ onViewDetails }) => {
  const { currentLocation, weather } = useLocation();

  return (
    <div className="glass-panel rounded-3xl p-6 border-slate-800/80 hover:border-slate-700 transition relative overflow-hidden flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Local Area Assessment</span>
              <h3 className="text-xl font-black text-white">{currentLocation.name}</h3>
            </div>
          </div>
          <RiskBadge level={currentLocation.riskLevel} size="md" />
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          What is the heat risk in your immediate area right now? High combined temperatures and humidity values represent elevated physical distress risks.
        </p>

        {/* Telemetry Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Thermometer className="w-3 h-3 text-orange-400" /> Temperature
            </span>
            <span className="text-base font-black font-mono text-white mt-0.5 block">
              {weather.temperature}°C
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Droplets className="w-3 h-3 text-blue-400" /> Humidity
            </span>
            <span className="text-base font-black font-mono text-white mt-0.5 block">
              {weather.humidity}%
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Activity className="w-3 h-3 text-red-400" /> Thermal Stress
            </span>
            <span className="text-base font-black font-mono text-white mt-0.5 block">
              {currentLocation.thermalStressScore} / 100
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
              <Clock className="w-3 h-3 text-amber-400" /> Peak Interval
            </span>
            <span className="text-xs font-bold text-amber-300 mt-1 block">
              12 PM – 4 PM
            </span>
          </div>
        </div>
      </div>

      <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Model: <strong>HeatGuard High-Resolution AI v2.4</strong>
        </span>
        <button
          onClick={onViewDetails}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>View Full Analysis</span>
          <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
        </button>
      </div>
    </div>
  );
};
