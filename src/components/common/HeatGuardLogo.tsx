import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';

interface HeatGuardLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const HeatGuardLogo: React.FC<HeatGuardLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Enterprise Climate Icon */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#17324A] to-[#12263A] border border-[#23415A] text-[#36C5F0] flex items-center justify-center font-bold shadow-lg shadow-[#07111F]/60 shrink-0`}>
        <ShieldCheck className="w-5 h-5 text-[#36C5F0]" />
        <Activity className="w-3 h-3 text-[#7C83FD] absolute bottom-1 right-1" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight ${titleSizes[size]} text-[#F4F8FC]`}>
            Heat<span className="text-[#36C5F0]">Guard</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[#9FB2C5] text-[10px] font-medium tracking-wide mt-1">
            Extreme Heatwave Early Warning & Human Thermal Stress Index
          </span>
        )}
      </div>
    </div>
  );
};
