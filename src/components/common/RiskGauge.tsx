import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface RiskGaugeProps {
  score?: number;
  category?: string;
  subtitle?: string;
  riskLevel?: string;
  size?: number;
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score = 72,
  category = 'HIGH RISK',
  subtitle = 'Heat stress conditions are elevated. Take precautions during peak afternoon hours.',
  riskLevel,
  size,
  className = ''
}) => {
  const validScore = Math.min(100, Math.max(0, score));

  const getRiskColor = (val: number) => {
    if (val <= 30) return { main: '#35D07F', bg: 'bg-[#35D07F]/15', text: 'text-[#35D07F]', border: 'border-[#35D07F]/30', label: 'LOW RISK' };
    if (val <= 60) return { main: '#F4C95D', bg: 'bg-[#F4C95D]/15', text: 'text-[#F4C95D]', border: 'border-[#F4C95D]/30', label: 'MODERATE RISK' };
    if (val <= 85) return { main: '#FF5C77', bg: 'bg-[#FF5C77]/15', text: 'text-[#FF5C77]', border: 'border-[#FF5C77]/30', label: 'HIGH RISK' };
    return { main: '#E63946', bg: 'bg-[#E63946]/20', text: 'text-[#E63946]', border: 'border-[#E63946]/40', label: 'EXTREME RISK' };
  };

  const riskInfo = getRiskColor(validScore);
  const displayCategory = category || (riskLevel ? `${riskLevel.toUpperCase()} RISK` : riskInfo.label);

  return (
    <div className={`sih-card p-6 sm:p-8 relative overflow-hidden flex flex-col items-center justify-between ${className}`}>
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-[#23415A]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#36C5F0]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#9FB2C5]">
            HEAT RISK ASSESSMENT INDEX
          </span>
        </div>
        <span className={`text-xs font-black px-3 py-1 rounded-full border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
          {displayCategory}
        </span>
      </div>

      {/* SVG Semicircular Gauge */}
      <div className="relative my-4 w-64 h-36 flex flex-col items-center justify-end">
        <svg viewBox="0 0 200 115" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#35D07F" />
              <stop offset="35%" stopColor="#F4C95D" />
              <stop offset="75%" stopColor="#FF5C77" />
              <stop offset="100%" stopColor="#E63946" />
            </linearGradient>
          </defs>

          <path
            d="M 25,100 A 75,75 0 0,1 175,100"
            fill="none"
            stroke="#17324A"
            strokeWidth="14"
            strokeLinecap="round"
          />

          <path
            d="M 25,100 A 75,75 0 0,1 175,100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray="235.6"
            strokeDashoffset={235.6 - (235.6 * (validScore / 100))}
            className="transition-all duration-700 ease-out"
          />

          <circle cx="25" cy="100" r="2" fill="#9FB2C5" />
          <circle cx="100" cy="25" r="2" fill="#9FB2C5" />
          <circle cx="175" cy="100" r="2" fill="#9FB2C5" />
        </svg>

        <div className="absolute bottom-2 flex flex-col items-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl sm:text-5xl font-black text-[#F4F8FC] tracking-tight font-mono">
              {validScore}
            </span>
            <span className="text-lg font-bold text-[#9FB2C5]">/ 100</span>
          </div>
          <span className="text-[11px] font-semibold text-[#9FB2C5] uppercase tracking-wider mt-0.5">
            Thermal Strain Score
          </span>
        </div>
      </div>

      {/* Advisory */}
      <div className="w-full pt-4 border-t border-[#23415A] text-center">
        <p className="text-xs sm:text-sm font-medium text-[#9FB2C5] max-w-md mx-auto leading-relaxed">
          "{subtitle}"
        </p>
      </div>
    </div>
  );
};
