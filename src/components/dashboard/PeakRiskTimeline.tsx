import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { Clock, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const PeakRiskTimeline: React.FC = () => {
  const { hourlyForecast } = useLocation();

  const chartData = hourlyForecast.map((item) => ({
    time: item.time,
    thermalStress: item.thermalStress,
    temperature: item.temperature,
    feelsLike: item.feelsLike,
    riskLevel: item.riskLevel,
    isPeak: item.isPeak
  }));

  return (
    <div className="sih-card p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#23415A] pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#36C5F0]" />
            24-HOUR HEAT RISK TIMELINE
          </h3>
          <p className="text-xs text-[#9FB2C5] mt-0.5">
            Predictive diurnal thermal stress progression across meteorological forecast windows
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#FF5C77]/15 border border-[#FF5C77]/30 text-[#FF5C77]">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Peak Risk: 12:00 PM – 4:00 PM</span>
        </div>
      </div>

      {/* Hourly Timeline visual cards */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {hourlyForecast.slice(0, 8).map((h) => {
          return (
            <div
              key={h.time}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                h.isPeak
                  ? 'bg-[#FF5C77]/15 border-[#FF5C77]/40 text-[#FF5C77]'
                  : 'bg-[#17324A] border-[#23415A] text-[#F4F8FC]'
              }`}
            >
              <span className="text-[10px] font-bold text-[#9FB2C5] block">{h.time}</span>
              <span className="text-sm font-black font-mono mt-0.5 block">
                {h.temperature}°C
              </span>
              <span className="text-[10px] text-[#9FB2C5] block">
                Feels {h.feelsLike}°C
              </span>
              <div className="text-[9px] font-bold mt-1 py-0.5 px-1 rounded-full bg-[#23415A] text-[#36C5F0] uppercase">
                {h.riskLevel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Recharts Area Chart */}
      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#36C5F0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#36C5F0" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#9FB2C5" fontSize={10} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#9FB2C5" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0D1B2A',
                borderColor: '#23415A',
                borderRadius: '12px',
                color: '#F4F8FC',
                fontSize: '11px',
                padding: '8px 12px'
              }}
              formatter={(val: any, name: any) => [
                `${val}${name === 'thermalStress' ? ' / 100' : '°C'}`,
                name === 'thermalStress' ? 'Thermal Stress Score' : 'Temperature'
              ]}
            />
            <Area
              type="monotone"
              dataKey="thermalStress"
              stroke="#36C5F0"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#cyanAreaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
