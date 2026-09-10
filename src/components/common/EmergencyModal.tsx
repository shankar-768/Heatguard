import React from 'react';
import { X, PhoneCall, AlertOctagon, HeartHandshake, MapPin, Share2, Check } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAlerts } from '../../context/AlertContext';

export const EmergencyModal: React.FC = () => {
  const { currentLocation } = useLocation();
  const { showEmergencyModal, setShowEmergencyModal } = useAlerts();
  const [copied, setCopied] = React.useState(false);

  if (!showEmergencyModal) return null;

  const handleShare = () => {
    const text = `🚨 EMERGENCY HEAT ADVISORY: Extreme heatwave conditions detected in ${currentLocation.name} (${currentLocation.state}). Current Thermal Stress Index: ${currentLocation.thermalStressScore}/100. Drink fluids and move vulnerable individuals to cool shelter. - HeatGuard AI`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-red-500/80 rounded-3xl shadow-2xl shadow-red-950/80 p-6 sm:p-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-2xl text-red-400 animate-pulse">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500 text-slate-950 uppercase tracking-wide">
                  High Priority SOS
                </span>
                <span className="text-xs text-slate-400 font-mono">📍 {currentLocation.name}, {currentLocation.state}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Extreme Heat Emergency Protocol
              </h2>
            </div>
          </div>
          <button
            onClick={() => setShowEmergencyModal(false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate Life-Saving Steps */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-4 h-4" />
            Immediate Life-Saving Actions (Heat Stroke Response)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">1</span>
              <span><strong>Move to Cool Shade:</strong> Relocate individual to an air-conditioned room or tree canopy immediately.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">2</span>
              <span><strong>Rapid Evaporative Cooling:</strong> Loosen clothing, spray cool water, and fan vigorously. Place ice packs on neck/armpits.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">3</span>
              <span><strong>Sip Electrolytes:</strong> Provide ORS / salted buttermilk only if conscious. DO NOT give fluids if vomiting or unconscious.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">4</span>
              <span><strong>Call Emergency 108 / 112:</strong> If body temp exceeds 40°C or speech slurs, treat as a medical critical emergency.</span>
            </div>
          </div>
        </div>

        {/* Quick Emergency Helplines */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            National Disaster & Medical Helplines (India)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <a
              href="tel:108"
              className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 flex items-center justify-center gap-2 font-bold transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Ambulance: 108</span>
            </a>
            <a
              href="tel:112"
              className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center gap-2 font-bold transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>National SOS: 112</span>
            </a>
            <a
              href="tel:1078"
              className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center gap-2 font-bold transition col-span-2 sm:col-span-1"
            >
              <PhoneCall className="w-4 h-4" />
              <span>NDMA Helpline: 1078</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Nearest Cooling Shelter: <strong>Government General Hospital (0.8 km)</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Alert Copied!' : 'Share Emergency Broadcast'}</span>
            </button>
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
