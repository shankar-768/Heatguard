import React from 'react';
import { Activity, Thermometer, Droplets, Wind, Sun } from 'lucide-react';

interface ThermalStressCardProps {
  score?: number;
}

export const ThermalStressCard: React.FC<ThermalStressCardProps> = ({ score = 72 }) => {
  const parameters = [
    { label: 'Ambient Temperature', impact: '+38%', value: '38°C', icon: Thermometer, color: 'bg-[#FF5C77]', text: 'text-[#FF5C77]' },
    { label: 'Relative Humidity', impact: '+26%', value: '64%', icon: Droplets, color: 'bg-[#36C5F0]', text: 'text-[#36C5F0]' },
    { label: 'Solar Exposure (UV)', impact: '+20%', value: '9 UV', icon: Sun, color: 'bg-[#F4C95D]', text: 'text-[#F4C95D]' },
    { label: 'Wind Cooling Dissipation', impact: '-12%', value: '14 km/h', icon: Wind, color: 'bg-[#35D07F]', text: 'text-[#35D07F]' },
  ];

  return (
    <div className="sih-card p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#23415A]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#7C83FD]" />
          <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider">
            HUMAN THERMAL STRESS INDEX
          </h3>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-[#F4F8FC] font-mono">{score}</span>
          <span className="text-xs font-bold text-[#9FB2C5]">/ 100</span>
        </div>
      </div>

      <p className="text-xs text-[#9FB2C5] leading-relaxed">
        Composite Wet-Bulb & Steadman Strain Model. Indicates elevated physiological heat load on outdoor workers and vulnerable demographics.
      </p>

      {/* Horizontal Parameters Contribution Breakdown */}
      <div className="space-y-3.5 pt-1">
        {parameters.map((param) => {
          const Icon = param.icon;
          const percentage = parseInt(param.impact.replace(/[^0-9]/g, ''), 10) || 20;

          return (
            <div key={param.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${param.text}`} />
                  <span className="font-semibold text-[#F4F8FC]">{param.label}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-[#9FB2C5]">{param.value}</span>
                  <span className={`font-bold ${param.text}`}>{param.impact}</span>
                </div>
              </div>

              {/* Clean Horizontal Contribution Meter */}
              <div className="w-full h-2 rounded-full bg-[#17324A] overflow-hidden">
                <div
                  className={`h-full ${param.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage * 2}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
