import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { HeatRiskHeroCard } from '../components/dashboard/HeatRiskHeroCard';
import { WeatherSummaryGrid } from '../components/dashboard/WeatherSummaryGrid';
import { PeakRiskTimeline } from '../components/dashboard/PeakRiskTimeline';
import { SevenDayForecastGrid } from '../components/dashboard/SevenDayForecastGrid';
import { EarlyWarningCard } from '../components/dashboard/EarlyWarningCard';
import { ThermalStressCard } from '../components/dashboard/ThermalStressCard';
import { LiveHeatMapPreview } from '../components/dashboard/LiveHeatMapPreview';
import { QuickActionsGrid } from '../components/dashboard/QuickActionsGrid';
import { DataFreshnessStatus } from '../components/dashboard/DataFreshnessStatus';
import { MapPin, ShieldAlert, AlertCircle, RefreshCw, Radio, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { currentLocation, error, isLoading, refreshWeather, locationSource } = useLocation();

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23415A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#36C5F0] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH 2026 Climate Intelligence Platform • Station Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F4F8FC] tracking-tight">
            {getGreeting()}, {user?.name || 'Sri Krishna Sai'}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#9FB2C5] mt-1">
            <MapPin className="w-3.5 h-3.5 text-[#36C5F0]" />
            <span>Station: <strong className="text-[#F4F8FC]">{currentLocation.name}, {currentLocation.state}</strong></span>
            <span className="text-[#23415A]">•</span>
            <span>Demographic: <strong className="text-[#F4F8FC]">{user?.userCategory || 'Outdoor Worker'}</strong></span>
            <span className="text-[#23415A]">•</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#12263A] border border-[#23415A] text-[#36C5F0] flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-[#35D07F] animate-pulse" />
              {locationSource === 'geolocation' ? 'GPS Sensor Node' : 'Configured Station'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/warning')}
            className="px-4 py-2.5 rounded-xl bg-[#FF5C77] hover:bg-[#ff4765] text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Active Heatwave Warnings</span>
          </button>
        </div>
      </div>

      {/* Error Alert if connection fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-[#FF5C77]/15 border border-[#FF5C77]/30 text-[#FF5C77] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={refreshWeather}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-[#FF5C77]/20 border border-[#FF5C77]/40 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* 1. MAIN HERO CARD: Semicircular Risk Gauge & Telemetry Overview */}
      <HeatRiskHeroCard onExploreAnalysis={() => onNavigate('/warning')} />

      {/* 2. EARLY WARNING SECTION */}
      <EarlyWarningCard onViewSafetyGuidance={() => onNavigate('/safety')} />

      {/* 3. WEATHER METRICS GRID (38°C, 43°C, 64%, 14 km/h, 9 UV, 27°C) */}
      <WeatherSummaryGrid />

      {/* 4. HUMAN THERMAL STRESS INDEX & 24-HOUR TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ThermalStressCard score={currentLocation.thermalStressScore || 72} />
        </div>
        <div className="lg:col-span-7">
          <PeakRiskTimeline />
        </div>
      </div>

      {/* 5. 7-DAY METEOROLOGICAL FORECAST */}
      <SevenDayForecastGrid />

      {/* 6. GIS LIVE HEAT MAP PREVIEW */}
      <LiveHeatMapPreview onViewFullMap={() => onNavigate('/map')} />

      {/* 7. QUICK ACTIONS GRID */}
      <QuickActionsGrid onNavigate={onNavigate} />

      {/* 8. SYSTEM DATA FRESHNESS STATUS */}
      <DataFreshnessStatus />
    </div>
  );
};
