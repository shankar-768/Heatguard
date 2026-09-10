import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { LocationSearchInput } from '../components/common/LocationSearchInput';
import {
  Settings,
  Bell,
  MapPin,
  Moon,
  Sun,
  Monitor,
  Shield,
  Key,
  CheckCircle2,
  LocateFixed,
  Save,
  Trash2
} from 'lucide-react';

export const SettingsPage: React.FC<{ onNavigateToProfile: () => void }> = ({ onNavigateToProfile }) => {
  const { user, updateUser } = useAuth();
  const { currentLocation, setLocation, detectLocation, isDetectingLocation } = useLocation();
  const { theme, setTheme } = useTheme();

  const [notifPrefs, setNotifPrefs] = useState(
    user?.notificationPreferences || {
      heatwaveWarnings: true,
      extremeAlerts: true,
      thermalStressAlerts: true,
      dailySummary: true,
      peakHourReminders: true
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveNotifications = async () => {
    await updateUser({ notificationPreferences: notifPrefs });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
          <Settings className="w-4 h-4 text-orange-400" />
          <span>Application Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          System & Alert Settings
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Configure notification dispatch, theme modes, meteorological station mapping, and security.
        </p>
      </div>

      {/* 1. Notifications Center Preferences */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              Early Warning & Notification Toggles
            </h3>
            <p className="text-xs text-slate-400">
              Customize real-time push alerts, SMS warnings, and diurnal summaries
            </p>
          </div>

          <button
            onClick={handleSaveNotifications}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

        <div className="space-y-3">
          {[
            {
              key: 'heatwaveWarnings',
              label: '48-Hour Heatwave Early Warnings',
              desc: 'High-confidence WRF predictive heatwave alerts forecasted across your region.'
            },
            {
              key: 'extremeAlerts',
              label: 'Critical Heat Stroke SOS Broadcasts',
              desc: 'Immediate high-priority alarms when temperatures exceed 44°C or thermal index hits 85+.'
            },
            {
              key: 'thermalStressAlerts',
              label: 'Real-Time Wet-Bulb & Thermal Stress Shifts',
              desc: 'Instant notifications when humidity saturation elevates your personal heat strain.'
            },
            {
              key: 'peakHourReminders',
              label: 'Diurnal Peak Hours Precaution Reminders',
              desc: 'Automated 11:30 AM advisory notifying you of upcoming 12 PM – 4 PM peak solar exposure.'
            },
            {
              key: 'dailySummary',
              label: 'Daily Heat Summary & Vulnerability Report',
              desc: 'Daily 8:00 AM dispatch summarizing temperature projections and hydration goals.'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800"
            >
              <div className="space-y-0.5 pr-4">
                <span className="text-sm font-bold text-white block">{item.label}</span>
                <span className="text-xs text-slate-400 block">{item.desc}</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={(notifPrefs as any)[item.key]}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
              </label>
            </div>
          ))}
        </div>

        {savedSuccess && (
          <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Notification settings successfully updated.
          </p>
        )}
      </div>

      {/* 2. Theme & Visual Appearance */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Visual Theme & Interface
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'dark'
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs font-bold">Dark Heat Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'light'
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs font-bold">High Contrast Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-2 ${
              theme === 'system'
                ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-5 h-5" />
            <span className="text-xs font-bold">System Default</span>
          </button>
        </div>
      </div>

      {/* 3. Location & GPS Telemetry */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            Monitoring Node Location
          </h3>
          <button
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <LocateFixed className="w-4 h-4" />
            <span>{isDetectingLocation ? 'Querying GPS...' : 'Auto-Detect Station'}</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 block font-semibold">Active Selected Station:</label>
          <LocationSearchInput
            currentValue={currentLocation.displayName || currentLocation.name}
            onSelectLocation={(loc) => setLocation(loc)}
            placeholder="Search city, town or location..."
            showGpsOption
          />
        </div>
      </div>

      {/* 4. Security & Privacy */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Security & Privacy
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div>
            <span className="text-sm font-bold text-white block">Password & Authentication</span>
            <span className="text-xs text-slate-400 block">Encrypted local session token active</span>
          </div>
          <button
            onClick={onNavigateToProfile}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition cursor-pointer self-start sm:self-center"
          >
            Update Profile & Password
          </button>
        </div>
      </div>
    </div>
  );
};
