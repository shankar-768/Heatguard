import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { CityLocation } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { LocationSearchInput } from '../common/LocationSearchInput';
import { MapLegend } from './MapLegend';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Thermometer,
  Droplets,
  Activity,
  ArrowRight,
  ShieldAlert,
  Check
} from 'lucide-react';

interface HeatRiskMapProps {
  onSelectCity?: (city: CityLocation) => void;
  onNavigateToWarning?: () => void;
}

export const HeatRiskMap: React.FC<HeatRiskMapProps> = ({ onSelectCity, onNavigateToWarning }) => {
  const { allLocations, currentLocation, setLocation, weather } = useLocation();
  const [selectedCity, setSelectedCity] = useState<CityLocation>(currentLocation);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showHeatLayer, setShowHeatLayer] = useState<boolean>(true);

  const getCoordinates = (lat: number, lng: number) => {
    const minLat = 6.5;
    const maxLat = 37.5;
    const minLng = 67.0;
    const maxLng = 97.5;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;

    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const filteredCities = allLocations.filter((c) => {
    if (filterRisk === 'all') return true;
    if (filterRisk === 'critical') return c.riskLevel === 'Extreme' || c.riskLevel === 'Very High';
    return c.riskLevel.toLowerCase() === filterRisk.toLowerCase();
  });

  const handleCityClick = (city: CityLocation) => {
    setSelectedCity(city);
    setLocation(city);
    if (onSelectCity) onSelectCity(city);
  };

  return (
    <div className="space-y-4">
      {/* Top Map Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <LocationSearchInput
            onSelectLocation={(loc) => {
              setSelectedCity(loc);
              setLocation(loc);
              if (onSelectCity) onSelectCity(loc);
            }}
            placeholder="Search city, town or station..."
            showGpsOption
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterRisk('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterRisk === 'all'
                ? 'bg-[#36C5F0] text-[#07111F] font-bold'
                : 'bg-[#12263A] border border-[#23415A] text-[#9FB2C5] hover:bg-[#17324A]'
            }`}
          >
            All Stations ({allLocations.length})
          </button>
          <button
            onClick={() => setFilterRisk('critical')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filterRisk === 'critical'
                ? 'bg-[#FF5C77] text-white font-bold'
                : 'bg-[#12263A] border border-[#23415A] text-[#FF5C77] hover:bg-[#17324A]'
            }`}
          >
            Critical Zones
          </button>
          <button
            onClick={() => setShowHeatLayer(!showHeatLayer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap border transition cursor-pointer ${
              showHeatLayer
                ? 'bg-[#36C5F0]/20 text-[#36C5F0] border-[#36C5F0]/40'
                : 'bg-[#12263A] border-[#23415A] text-[#9FB2C5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thermal Layer</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative h-[520px] sm:h-[600px] rounded-2xl sih-card border border-[#23415A] overflow-hidden bg-[#07111F] shadow-2xl flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#23415A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* Regional Heat Glow Overlay */}
          {showHeatLayer && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[22%] left-[32%] w-64 h-64 rounded-full bg-[#FF5C77]/20 blur-3xl" />
              <div className="absolute top-[42%] left-[38%] w-72 h-72 rounded-full bg-[#F4C95D]/15 blur-3xl" />
              <div className="absolute top-[55%] left-[50%] w-60 h-60 rounded-full bg-[#36C5F0]/20 blur-3xl" />
            </div>
          )}

          {/* India SVG Boundary */}
          <svg
            viewBox="0 0 800 900"
            className="w-full h-full max-h-[540px] opacity-75 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <defs>
              <linearGradient id="gisLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#12263A" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0D1B2A" stopOpacity="0.95" />
              </linearGradient>
            </defs>

            <path
              d="M 310 70 
                 C 320 60, 360 50, 380 75 
                 C 400 100, 420 120, 410 150 
                 C 400 180, 430 200, 450 210 
                 C 480 220, 520 220, 560 210 
                 C 600 200, 680 200, 720 230 
                 C 740 250, 750 290, 710 320 
                 C 680 340, 640 330, 610 350 
                 C 590 370, 570 380, 540 370 
                 C 520 400, 530 450, 550 490 
                 C 570 530, 560 570, 530 610 
                 C 500 650, 470 700, 430 760 
                 C 410 800, 390 840, 380 880 
                 C 370 850, 350 780, 340 730 
                 C 320 670, 290 600, 280 540 
                 C 260 480, 240 450, 210 420 
                 C 180 390, 190 360, 210 340 
                 C 230 320, 230 290, 240 260 
                 C 250 220, 270 190, 270 150 
                 C 270 110, 290 80, 310 70 Z"
              fill="url(#gisLandGrad)"
              stroke="#23415A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </svg>

          {/* Markers */}
          <div
            className="absolute inset-0 transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {filteredCities.map((city) => {
              const { x, y } = getCoordinates(city.lat, city.lng);
              const isSelected = selectedCity.id === city.id;

              return (
                <div
                  key={city.id}
                  onClick={() => handleCityClick(city)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center font-bold text-[10px] shadow-lg transition-transform group-hover:scale-125 bg-[#17324A] ${
                      city.riskLevel === 'Extreme' ? 'border-[#FF5C77] text-[#FF5C77]' : 'border-[#36C5F0] text-[#36C5F0]'
                    } ${isSelected ? 'ring-4 ring-[#36C5F0]/50 scale-125' : ''}`}
                  >
                    {city.baseTemp.toFixed(0)}°
                  </div>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-7 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md transition-opacity ${
                      isSelected
                        ? 'bg-[#07111F] text-[#36C5F0] border border-[#36C5F0] opacity-100 z-30'
                        : 'bg-[#12263A] text-[#9FB2C5] border border-[#23415A] opacity-90'
                    }`}
                  >
                    {city.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30">
            <button
              onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
              className="p-2 rounded-xl bg-[#12263A] hover:bg-[#17324A] text-[#F4F8FC] border border-[#23415A] shadow-lg cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.1))}
              className="p-2 rounded-xl bg-[#12263A] hover:bg-[#17324A] text-[#F4F8FC] border border-[#23415A] shadow-lg cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl bg-[#12263A] hover:bg-[#17324A] text-[#F4F8FC] border border-[#23415A] shadow-lg cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Station Sidebar Detail */}
        <div className="sih-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-[#23415A] pb-3">
              <div>
                <span className="text-xs font-semibold text-[#9FB2C5]">Monitoring Station</span>
                <h3 className="text-2xl font-black text-[#F4F8FC]">{selectedCity.name}</h3>
                <p className="text-xs text-[#9FB2C5]">{selectedCity.district}, {selectedCity.state}</p>
              </div>
              <RiskBadge level={selectedCity.riskLevel} size="md" />
            </div>

            <div className="p-4 rounded-2xl bg-[#17324A] border border-[#23415A] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#9FB2C5] block">Thermal Stress Index</span>
                <span className="text-3xl font-black font-mono text-[#F4F8FC] mt-1 block">
                  {selectedCity.thermalStressScore} <span className="text-xs font-normal text-[#9FB2C5]">/ 100</span>
                </span>
              </div>
              <span className="text-xs font-bold text-[#FF5C77] uppercase tracking-wide">
                Warning Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-[#17324A] border border-[#23415A]">
                <span className="text-[11px] text-[#9FB2C5] font-semibold">Temperature</span>
                <span className="text-lg font-bold font-mono text-[#F4F8FC] block">{selectedCity.baseTemp}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-[#17324A] border border-[#23415A]">
                <span className="text-[11px] text-[#9FB2C5] font-semibold">Humidity</span>
                <span className="text-lg font-bold font-mono text-[#F4F8FC] block">{selectedCity.baseHumidity}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-[#23415A]">
            <button
              onClick={() => {
                setLocation(selectedCity);
                if (onNavigateToWarning) onNavigateToWarning();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] text-[#07111F] font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>View Heatwave Warning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setLocation(selectedCity)}
              className="w-full py-2 px-3 rounded-xl bg-[#17324A] hover:bg-[#23415A] text-[#9FB2C5] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#35D07F]" />
              <span>Set Active Station</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
