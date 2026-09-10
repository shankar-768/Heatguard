import React, { useState } from 'react';
import { MapPin, Plus, Minus, Layers, LocateFixed, ShieldAlert } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const LiveHeatMapPreview: React.FC<{ onViewFullMap?: () => void }> = ({ onViewFullMap }) => {
  const { currentLocation, detectLocation, isDetectingLocation } = useLocation();
  const [zoomLevel, setZoomLevel] = useState(11);
  const [activeLayer, setActiveLayer] = useState<'thermal' | 'station' | 'radar'>('thermal');

  return (
    <div className="sih-card p-6 space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#23415A] pb-3">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#36C5F0]" />
            GIS LIVE HEAT RISK MAP & ZONAL TELEMETRY
          </h3>
          <p className="text-xs text-[#9FB2C5] mt-0.5">
            Spatial distribution of wet-bulb thermal stress across monitoring stations
          </p>
        </div>

        {onViewFullMap && (
          <button
            onClick={onViewFullMap}
            className="text-xs font-bold text-[#36C5F0] hover:underline cursor-pointer"
          >
            Open Interactive GIS Station →
          </button>
        )}
      </div>

      {/* Map Container Viewport */}
      <div className="relative w-full h-80 rounded-2xl bg-[#0D1B2A] border border-[#23415A] overflow-hidden flex items-center justify-center">
        {/* Subtle GIS Topographic Grid Background */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(54, 197, 240, 0.15) 0%, transparent 70%),
              radial-gradient(circle at 20% 30%, rgba(255, 92, 119, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(244, 201, 93, 0.15) 0%, transparent 50%),
              linear-gradient(to right, rgba(35, 65, 90, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(35, 65, 90, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 100% 100%, 30px 30px, 30px 30px'
          }}
        />

        {/* GIS Interactive Controls Overlay (Top Right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-20">
          <button
            onClick={() => setZoomLevel(prev => Math.min(18, prev + 1))}
            className="p-2 rounded-xl bg-[#12263A]/90 hover:bg-[#17324A] border border-[#23415A] text-[#F4F8FC] shadow-md cursor-pointer"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(5, prev - 1))}
            className="p-2 rounded-xl bg-[#12263A]/90 hover:bg-[#17324A] border border-[#23415A] text-[#F4F8FC] shadow-md cursor-pointer"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="p-2 rounded-xl bg-[#12263A]/90 hover:bg-[#17324A] border border-[#23415A] text-[#36C5F0] shadow-md cursor-pointer disabled:opacity-50"
            title="Current Location"
          >
            <LocateFixed className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Layer Controls (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20 bg-[#12263A]/90 p-1 rounded-xl border border-[#23415A] backdrop-blur-md">
          <button
            onClick={() => setActiveLayer('thermal')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              activeLayer === 'thermal' ? 'bg-[#36C5F0] text-[#07111F]' : 'text-[#9FB2C5] hover:text-white'
            }`}
          >
            Thermal Heat
          </button>
          <button
            onClick={() => setActiveLayer('station')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              activeLayer === 'station' ? 'bg-[#36C5F0] text-[#07111F]' : 'text-[#9FB2C5] hover:text-white'
            }`}
          >
            Stations
          </button>
          <button
            onClick={() => setActiveLayer('radar')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
              activeLayer === 'radar' ? 'bg-[#36C5F0] text-[#07111F]' : 'text-[#9FB2C5] hover:text-white'
            }`}
          >
            Radar
          </button>
        </div>

        {/* Map Center Location Marker Node */}
        <div className="relative z-10 flex flex-col items-center animate-bounce">
          <div className="px-3 py-1.5 rounded-xl bg-[#17324A] border border-[#36C5F0] text-white text-xs font-bold shadow-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF5C77] animate-pulse" />
            <span>{currentLocation.name} Station Node</span>
          </div>
          <div className="w-3 h-3 bg-[#36C5F0] rotate-45 -mt-1.5" />
        </div>

        {/* Bottom Map Legend */}
        <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#12263A]/90 border border-[#23415A] backdrop-blur-md text-[11px]">
          <span className="text-[#9FB2C5] font-semibold">GIS Heat Risk Zones:</span>
          <div className="flex items-center gap-3 font-semibold">
            <div className="flex items-center gap-1 text-[#35D07F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#35D07F]" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1 text-[#F4C95D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F4C95D]" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1 text-[#FF5C77]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C77]" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1 text-[#E63946]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
              <span>Extreme</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
