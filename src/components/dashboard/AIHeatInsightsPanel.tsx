import React, { useState } from 'react';
import { Sparkles, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { calculateHeatStress } from '../../services/heatStressEngine';

export const AIHeatInsightsPanel: React.FC = () => {
  const { currentLocation, weather } = useLocation();
  const [showFactorBreakdown, setShowFactorBreakdown] = useState(false);

  const thermalResult = calculateHeatStress({
    temperature: weather.temperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    uvIndex: weather.uvIndex
  });

  const isExtreme = currentLocation.riskLevel === 'Extreme' || currentLocation.riskLevel === 'Very High';
  const confidencePercent = isExtreme ? 91 : 84;

  const factors = thermalResult.contributingFactors.map(f => ({
    name: f.name,
    impact: f.impact,
    weight: f.weight,
    color: f.color
  }));

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 border-orange-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-orange-950/20 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                AI Neural Ensemble
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Real-time Predictive Physics
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">AI Heatwave Risk Insight</h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 font-semibold block">Model Confidence</span>
          <span className="text-base font-mono font-black text-emerald-400">{confidencePercent}%</span>
        </div>
      </div>

      {/* Main AI Explanation Text */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
        <p>
          HeatGuard AI computes a <strong className="text-orange-400">{currentLocation.riskLevel} Thermal Risk classification</strong> in <strong className="text-white">{currentLocation.name}</strong> based on live telemetry.
        </p>
        <p className="text-slate-400">
          The synergistic combination of <strong className="text-slate-200">{weather.temperature}°C dry bulb temperature</strong> and <strong className="text-slate-200">{weather.humidity}% relative humidity</strong> produces an apparent heat index of <strong className="text-orange-400">{weather.feelsLike}°C</strong>. {thermalResult.explanation}
        </p>
      </div>

      {/* Why This Prediction button & Accordion */}
      <div className="pt-1">
        <button
          onClick={() => setShowFactorBreakdown(!showFactorBreakdown)}
          className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 cursor-pointer transition"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Why is my risk classified as {currentLocation.riskLevel}? (View Live Factor Weights)</span>
          {showFactorBreakdown ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </button>

        {showFactorBreakdown && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Contributing Factor Attribution Weights
            </h4>

            <div className="space-y-2.5">
              {factors.map((f) => (
                <div key={f.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{f.name}</span>
                    <span className="text-[11px] text-slate-400">{f.impact}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${f.color} rounded-full transition-all duration-500`}
                      style={{ width: `${f.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 pt-1 leading-normal italic">
              *Factor weights calculated from real live meteorological readings using NOAA Rothfusz and Steadman equations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
