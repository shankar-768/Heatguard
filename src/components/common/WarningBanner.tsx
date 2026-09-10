import React from 'react';
import { AlertTriangle, ChevronRight, X, Flame } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';
import { useLocation } from '../../context/LocationContext';

interface WarningBannerProps {
  onViewWarning?: () => void;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({ onViewWarning }) => {
  const { currentLocation } = useLocation();
  const { criticalAlert, dismissCriticalBanner } = useAlerts();

  const isSevere = currentLocation.riskLevel === 'Very High' || currentLocation.riskLevel === 'Extreme';

  if (!isSevere && !criticalAlert) return null;

  const isExtreme = currentLocation.riskLevel === 'Extreme' || criticalAlert?.severity === 'extreme';

  return (
    <div
      className={`relative z-40 border-b px-4 py-2.5 sm:px-6 transition-all duration-300 ${
        isExtreme
          ? 'bg-gradient-to-r from-red-950 via-purple-950/80 to-red-950 border-red-500/40 text-red-200'
          : 'bg-gradient-to-r from-amber-950/90 via-orange-950/70 to-amber-950/90 border-amber-500/40 text-amber-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <div className={`p-1.5 rounded-lg shrink-0 ${isExtreme ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-amber-500/20 text-amber-400'}`}>
            {isExtreme ? <Flame className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <span className="font-bold tracking-wide uppercase text-white mr-1.5">
              {isExtreme ? '🚨 CRITICAL HEATWAVE ALERT:' : '⚠️ HIGH HEAT RISK ADVISORY:'}
            </span>
            <span>
              {criticalAlert
                ? criticalAlert.title
                : `${currentLocation.riskLevel} heat stress active in ${currentLocation.name} (Peak Risk: 12 PM – 4 PM)`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onViewWarning}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
              isExtreme
                ? 'bg-red-500 hover:bg-red-400 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
            }`}
          >
            <span>View Safety Action</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={dismissCriticalBanner}
            title="Dismiss notification banner"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
