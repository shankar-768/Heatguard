import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const getBadgeStyle = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'Low':
        return {
          bg: 'bg-[#35D07F]/15',
          text: 'text-[#35D07F]',
          border: 'border-[#35D07F]/30',
          icon: ShieldCheck
        };
      case 'Moderate':
        return {
          bg: 'bg-[#F4C95D]/15',
          text: 'text-[#F4C95D]',
          border: 'border-[#F4C95D]/30',
          icon: AlertCircle
        };
      case 'High':
      case 'Very High':
        return {
          bg: 'bg-[#FF5C77]/15',
          text: 'text-[#FF5C77]',
          border: 'border-[#FF5C77]/30',
          icon: AlertTriangle
        };
      case 'Extreme':
        return {
          bg: 'bg-[#FF5C77]/25',
          text: 'text-[#FF5C77]',
          border: 'border-[#FF5C77]/50',
          icon: ShieldAlert
        };
      default:
        return {
          bg: 'bg-[#36C5F0]/15',
          text: 'text-[#36C5F0]',
          border: 'border-[#36C5F0]/30',
          icon: ShieldCheck
        };
    }
  };

  const style = getBadgeStyle(level);
  const IconComponent = style.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5" />}
      <span className="tracking-wider">{level.toUpperCase()}</span>
    </span>
  );
};
