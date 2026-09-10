import React from 'react';
import { Info } from 'lucide-react';

export const DisclaimerBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2.5 ${className}`}>
      <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
      <p className="leading-relaxed">
        <strong className="text-stone-300">Public Safety Notice:</strong> HeatGuard provides advisory heat-risk awareness and biometeorological modeling. Calculated risk scores and forecasts are intended for early warning and do not replace official emergency directives or medical advice.
      </p>
    </div>
  );
};
