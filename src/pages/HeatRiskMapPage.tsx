import React from 'react';
import { HeatRiskMap } from '../components/map/HeatRiskMap';
import { MapPin, Globe, Sparkles, Layers } from 'lucide-react';

interface HeatRiskMapPageProps {
  onNavigateToWarning: () => void;
}

export const HeatRiskMapPage: React.FC<HeatRiskMapPageProps> = ({ onNavigateToWarning }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
            <Globe className="w-4 h-4 text-orange-400" />
            <span>All-India Geospatial Disaster Grid • Live Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Geographical Heat Risk Map
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Explore human thermal stress, wet bulb index anomalies, and regional heatwave alerts across Indian meteorological stations.
          </p>
        </div>
      </div>

      {/* Geospatial Map Canvas Container */}
      <HeatRiskMap onNavigateToWarning={onNavigateToWarning} />
    </div>
  );
};
