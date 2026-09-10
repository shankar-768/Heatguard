import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const DataFreshnessStatus: React.FC = () => {
  const { weather, isLive, isCached, lastUpdatedTime, refreshWeather, isLoading } = useLocation();

  return (
    <div className="glass-panel rounded-2xl p-4 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : isCached ? 'bg-amber-400' : 'bg-slate-500'}`} />
        <span className="font-bold text-slate-200">
          {isLive ? 'Live API Telemetry Synchronized' : isCached ? 'Cached API Telemetry Active' : 'Station Syncing...'}
        </span>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <span className="text-slate-300 font-medium bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
          {weather.provider || 'WeatherAPI.com'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Last Updated: <strong className="text-slate-200">{lastUpdatedTime}</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <span>Status: <strong className="text-emerald-400 font-semibold">{isCached ? 'Cached (10m TTL)' : 'Real-time Live'}</strong></span>
        </div>

        <button
          onClick={refreshWeather}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          title="Force fresh API synchronization"
        >
          <RefreshCw className={`w-3 h-3 text-orange-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>
    </div>
  );
};
