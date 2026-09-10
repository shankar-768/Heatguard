import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  sublabel?: string;
  alertLevel?: 'normal' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  iconColor = 'text-[#36C5F0]',
  trendText,
  sublabel,
  className = '',
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`sih-card p-4 sm:p-5 rounded-2xl transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-[#36C5F0]/50 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {/* Icon & Title */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-[#9FB2C5] uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl bg-[#17324A] border border-[#23415A] ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Large Value */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-black text-[#F4F8FC] tracking-tight font-mono">
          {value}
        </span>
        {unit && <span className="text-sm font-bold text-[#9FB2C5]">{unit}</span>}
      </div>

      {/* Contextual Indicator / Sublabel */}
      {(trendText || sublabel) && (
        <div className="mt-2.5 pt-2 border-t border-[#23415A]/60 flex items-center justify-between text-[11px]">
          {trendText && (
            <span className="font-semibold text-[#36C5F0]">
              {trendText}
            </span>
          )}
          {sublabel && <span className="text-[#9FB2C5] ml-auto">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
