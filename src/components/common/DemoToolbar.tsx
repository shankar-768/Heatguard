import React, { useState } from 'react';
import { Sliders, Flame, MapPin, RefreshCw, LocateFixed, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAlerts } from '../../context/AlertContext';
import { LocationSearchInput } from './LocationSearchInput';

export const DemoToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLocation, setLocation, refreshWeather, detectLocation, isDetectingLocation, isLoading } = useLocation();
  const { refreshAlerts, setShowEmergencyModal } = useAlerts();

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-40">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-orange-400 border border-orange-500/40 shadow-lg text-xs font-bold transition-all cursor-pointer hover:scale-105"
        title="Live Telemetry & Diagnostics Controls"
      >
        <Sliders className="w-3.5 h-3.5 text-orange-400" />
        <span>Telemetry Controls</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Control Drawer */}
      {isOpen && (
        <div className="absolute bottom-11 right-0 w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl p-4 text-xs space-y-3 animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Gateway
            </span>
            <span className="text-[10px] text-stone-400 font-mono">HeatGuard API v2.0</span>
          </div>

          {/* Quick Location Switcher */}
          <div>
            <label className="text-stone-400 font-medium mb-1 flex items-center gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-orange-400" /> Switch Station Telemetry:
            </label>
            <LocationSearchInput
              currentValue={currentLocation.displayName || currentLocation.name}
              onSelectLocation={(loc) => setLocation(loc)}
              placeholder="Search city, town or location..."
              showGpsOption={false}
            />
          </div>

          {/* Real Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={async () => {
                await detectLocation();
                refreshAlerts();
              }}
              disabled={isDetectingLocation}
              className="w-full py-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{isDetectingLocation ? 'Requesting GPS Geolocation...' : 'Auto-Detect Browser Geolocation'}</span>
            </button>

            <button
              onClick={async () => {
                await refreshWeather();
                refreshAlerts();
              }}
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Synchronizing Telemetry...' : 'Force Live API Synchronization'}</span>
            </button>
          </div>

          {/* Emergency trigger */}
          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="w-full py-2 rounded-lg bg-red-600/30 hover:bg-red-600/40 border border-red-500/50 text-red-200 font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Launch Emergency Protocol Modal</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
