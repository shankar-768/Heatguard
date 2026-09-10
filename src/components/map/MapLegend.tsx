import React from 'react';

export const MapLegend: React.FC<{ className?: string }> = ({ className = '' }) => {
  const levels = [
    { label: 'Low (0–25)', color: 'bg-emerald-500', text: 'text-emerald-400' },
    { label: 'Moderate (26–45)', color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'High (46–65)', color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Very High (66–82)', color: 'bg-red-500', text: 'text-red-400' },
    { label: 'Extreme (83–100)', color: 'bg-purple-500', text: 'text-purple-400' }
  ];

  return (
    <div className={`p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs shadow-xl space-y-2 ${className}`}>
      <span className="font-bold text-white uppercase tracking-wider text-[10px] block">
        Thermal Stress Index Legend
      </span>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {levels.map((lvl) => (
          <div key={lvl.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${lvl.color} shrink-0 shadow-xs`} />
            <span className="text-[11px] font-medium text-slate-300">{lvl.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
