import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { RiskGauge } from '../common/RiskGauge';
import { ArrowRight, Clock, Droplets, ShieldAlert, SunMedium, Thermometer, Wind } from 'lucide-react';

export const HeatRiskHeroCard: React.FC<{ onExploreAnalysis?: () => void }> = ({ onExploreAnalysis }) => {
  const { currentLocation, weather } = useLocation();

  // Use score or default 72
  const score = currentLocation?.thermalStressScore || 72;
  const category = currentLocation?.riskLevel ? `${currentLocation.riskLevel.toUpperCase()} RISK` : 'HIGH RISK';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: Professional Semicircular Risk Gauge Hero Card */}
      <div className="lg:col-span-6 flex">
        <RiskGauge
          score={score}
          category={category}
          subtitle="Heat stress conditions are elevated. Take precautions during peak afternoon hours."
          className="w-full h-full flex-1"
        />
      </div>

      {/* Right: Station Telemetry Overview Card */}
      <div className="lg:col-span-6 sih-card p-6 sm:p-8 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#23415A]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35D07F] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#9FB2C5]">
                Station Node: {currentLocation.name}
              </span>
            </div>
            <span className="text-xs text-[#9FB2C5] font-mono">
              Peak: <strong className="text-[#F4C95D]">12:00 PM – 4:00 PM</strong>
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-[#F4F8FC] tracking-tight font-mono">
              {weather.temperature}°C
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FF5C77]/15 text-[#FF5C77] border border-[#FF5C77]/30">
              Feels like {weather.feelsLike}°C
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#9FB2C5] mt-2 leading-relaxed">
            Composite meteorological parameters indicate elevated wet-bulb temperature saturation. Active cooling measures recommended for outdoor workers.
          </p>
        </div>

        {/* Telemetry quick pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#23415A]">
          <div className="p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] text-center">
            <span className="text-[10px] font-semibold text-[#9FB2C5] block">HUMIDITY</span>
            <span className="text-sm font-bold text-[#F4F8FC]">{weather.humidity}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] text-center">
            <span className="text-[10px] font-semibold text-[#9FB2C5] block">WIND SPEED</span>
            <span className="text-sm font-bold text-[#F4F8FC]">{weather.windSpeed} km/h</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] text-center">
            <span className="text-[10px] font-semibold text-[#9FB2C5] block">UV INDEX</span>
            <span className="text-sm font-bold text-[#F4F8FC]">{weather.uvIndex}</span>
          </div>
        </div>

        {/* Action Button */}
        {onExploreAnalysis && (
          <div className="pt-2">
            <button
              onClick={onExploreAnalysis}
              className="w-full py-2.5 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] text-[#07111F] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <span>Explore Early Warning Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
