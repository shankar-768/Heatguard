import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, Clock, Flame } from 'lucide-react';

interface EarlyWarningCardProps {
  onViewSafetyGuidance?: () => void;
}

export const EarlyWarningCard: React.FC<EarlyWarningCardProps> = ({ onViewSafetyGuidance }) => {
  return (
    <div className="sih-card p-6 sm:p-7 border border-[#FF5C77]/40 bg-gradient-to-r from-[#FF5C77]/10 via-[#12263A] to-[#12263A] relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FF5C77] text-white uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              EARLY WARNING
            </span>
            <span className="text-xs text-[#9FB2C5] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F4C95D]" />
              Today • 12:00 PM – 4:00 PM
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-[#F4F8FC]">
            Extreme heat conditions expected
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 max-w-md pt-1">
            <div className="p-3 rounded-xl bg-[#17324A] border border-[#23415A]">
              <span className="text-[10px] font-bold text-[#9FB2C5] uppercase block">Expected Temperature</span>
              <span className="text-xl font-black text-[#FF5C77] font-mono">42°C</span>
            </div>

            <div className="p-3 rounded-xl bg-[#17324A] border border-[#23415A]">
              <span className="text-[10px] font-bold text-[#9FB2C5] uppercase block">Expected Heat Stress Index</span>
              <span className="text-xl font-black text-[#F4C95D] font-mono">84 / 100</span>
            </div>
          </div>

          <p className="text-xs text-[#9FB2C5] leading-relaxed">
            <strong>Recommended action:</strong> Avoid prolonged outdoor exposure during peak heat. Hydrate frequently and rest in shade.
          </p>
        </div>

        {/* CTA Button */}
        {onViewSafetyGuidance && (
          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={onViewSafetyGuidance}
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] text-[#07111F] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <span>View Safety Guidance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
