import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { Calendar } from 'lucide-react';
import { RiskBadge } from '../common/RiskBadge';
import { DailyHeatForecast } from '../../types';

export const SevenDayForecastGrid: React.FC = () => {
  const { multiDayForecast } = useLocation();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#36C5F0]" />
          7-DAY METEOROLOGICAL HEAT RISK FORECAST
        </h3>
        <span className="text-xs text-[#9FB2C5]">WRF Predictive Model</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {multiDayForecast.slice(0, 7).map((d: DailyHeatForecast, index: number) => {
          const uvVal = d.uvIndexMax || 8;
          const maxT = d.maxTemp || 35;
          const riskScore = Math.min(95, Math.max(30, Math.round((maxT - 25) * 3 + uvVal * 2)));
          const riskLevel = d.riskLevel || (riskScore >= 75 ? 'High' : riskScore >= 55 ? 'Moderate' : 'Low');

          return (
            <div
              key={d.day + index}
              className="sih-card p-4 rounded-2xl flex flex-col justify-between space-y-3 transition hover:border-[#36C5F0]/40"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F4F8FC]">{d.day}</span>
                  <span className="text-[10px] text-[#9FB2C5] font-mono">{d.date}</span>
                </div>
                <p className="text-[11px] text-[#9FB2C5] mt-0.5 truncate">{d.condition}</p>
              </div>

              <div className="my-1">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xl font-black text-[#F4F8FC]">{d.maxTemp}°</span>
                  <span className="text-xs font-bold text-[#9FB2C5]">{d.minTemp}°C</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#23415A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#9FB2C5]">Risk Score:</span>
                  <span className="text-xs font-mono font-bold text-[#36C5F0]">{riskScore}/100</span>
                </div>
                <RiskBadge level={riskLevel} size="sm" className="w-full justify-center" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
