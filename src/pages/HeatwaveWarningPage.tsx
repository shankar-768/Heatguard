import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { heatRiskService } from '../services/heatRiskService';
import { RiskBadge } from '../components/common/RiskBadge';
import {
  Flame,
  AlertTriangle,
  Clock,
  TrendingUp,
  Droplets,
  Thermometer,
  ShieldCheck,
  Calendar,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  ReferenceLine
} from 'recharts';

export const HeatwaveWarningPage: React.FC<{ onNavigateToSafety?: () => void }> = ({
  onNavigateToSafety
}) => {
  const { currentLocation, hourlyForecast, multiDayForecast } = useLocation();
  const [activeTab, setActiveTab] = useState<'24h' | '48h' | '7d'>('24h');
  const [chartType, setChartType] = useState<'thermalStress' | 'temperature' | 'humidity'>('thermalStress');

  const tomorrow = multiDayForecast[1] || multiDayForecast[0];

  // 24H data from real API
  const data24h = hourlyForecast.slice(0, 24).map((h) => ({
    time: h.time,
    temperature: h.temperature,
    humidity: h.humidity,
    thermalStress: h.thermalStress,
    riskLevel: h.riskLevel
  }));

  // 48H data from real API (up to 48 hours)
  const data48h = hourlyForecast.slice(0, 48).map((h, index) => ({
    time: index < 12 ? h.time : index < 24 ? `Tdy ${h.time}` : `Tmrw ${h.time}`,
    temperature: h.temperature,
    humidity: h.humidity,
    thermalStress: h.thermalStress,
    riskLevel: h.riskLevel
  }));

  // 7D data
  const data7d = multiDayForecast.map((d) => ({
    time: `${d.day} (${d.date})`,
    temperature: d.maxTemp,
    humidity: d.avgHumidity,
    thermalStress: d.peakThermalStress,
    riskLevel: d.riskLevel
  }));

  const activeChartData = activeTab === '24h' ? data24h : activeTab === '48h' ? data48h : data7d;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span>Predictive Meteorological Intelligence • Multi-Model Forecast</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Heatwave Early Warning System
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Predicting dangerous heat conditions before they become critical across {currentLocation.name}.
        </p>
      </div>

      {/* Top Critical Warning Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-red-950 via-red-900/60 to-purple-950 border-2 border-red-500/50 p-6 sm:p-8 shadow-2xl shadow-red-950/60 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-red-500/30">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                <Flame className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-300">
                  🚨 High Priority Weather Directive
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  Extreme Heat Risk Expected Tomorrow Afternoon ({tomorrow.date})
                </h2>
              </div>
            </div>

            <RiskBadge level={tomorrow.riskLevel} size="lg" />
          </div>

          {/* Warning Key Telemetry Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/20">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Expected Temp
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {tomorrow.maxTemp}°C
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/20">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Droplets className="w-3.5 h-3.5 text-blue-400" /> Expected Humidity
              </span>
              <span className="text-2xl font-black font-mono text-white mt-1 block">
                {tomorrow.avgHumidity}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/20">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Activity className="w-3.5 h-3.5 text-red-400" /> Expected Stress
              </span>
              <span className="text-2xl font-black font-mono text-red-400 mt-1 block">
                {tomorrow.peakThermalStress} <span className="text-xs text-slate-400">/ 100</span>
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/20">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Risk Probability
              </span>
              <span className="text-2xl font-black font-mono text-purple-300 mt-1 block">
                {tomorrow.riskProbability}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-red-500/20 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Peak Risk Window
              </span>
              <span className="text-sm font-bold text-amber-300 mt-1.5 block">
                {tomorrow.peakRiskPeriod}
              </span>
            </div>
          </div>

          {/* Primary Directive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
            <p className="text-xs sm:text-sm text-red-100 font-medium">
              <strong>Mandatory Advisory:</strong> Avoid strenuous outdoor exposure between 12:00 PM and 4:30 PM. Ensure active hydration stations for field personnel.
            </p>
            {onNavigateToSafety && (
              <button
                onClick={onNavigateToSafety}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-black text-xs whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>View Full Safety Protocol</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Day Risk Prediction Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          Multi-Day Probabilistic Risk Projections
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {multiDayForecast.slice(1, 4).map((f) => (
            <div
              key={f.day}
              className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{f.day}</span>
                  <h4 className="text-base font-black text-white">{f.date}</h4>
                </div>
                <RiskBadge level={f.riskLevel} size="sm" />
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Max Temp</span>
                  <span className="text-2xl font-black font-mono text-white">{f.maxTemp}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Probability</span>
                  <span className="text-2xl font-black font-mono text-orange-400">{f.riskProbability}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Peak Stress</span>
                  <span className="text-2xl font-black font-mono text-red-400">{f.peakThermalStress}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 pt-2 border-t border-slate-800 leading-relaxed">
                {f.aiSummary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Interactive Charts & Tabs */}
      <div className="glass-panel rounded-3xl p-6 border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Meteorological & Thermal Stress Trends</h3>
            <p className="text-xs text-slate-400">
              Interactive high-resolution projections with threshold danger lines
            </p>
          </div>

          {/* Forecast Time Horizon Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('24h')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === '24h'
                  ? 'bg-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Next 24 Hours
            </button>
            <button
              onClick={() => setActiveTab('48h')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === '48h'
                  ? 'bg-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Next 48 Hours
            </button>
            <button
              onClick={() => setActiveTab('7d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === '7d'
                  ? 'bg-orange-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7-Day Outlook
            </button>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('thermalStress')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              chartType === 'thermalStress'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Thermal Stress Index (0–100)
          </button>
          <button
            onClick={() => setChartType('temperature')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              chartType === 'temperature'
                ? 'bg-red-500/20 text-red-300 border-red-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Air Temperature (°C)
          </button>
          <button
            onClick={() => setChartType('humidity')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              chartType === 'humidity'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Relative Humidity (%)
          </button>
        </div>

        {/* Recharts Line / Area Visual */}
        <div className="h-72 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chartGradTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chartGradHum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                domain={chartType === 'humidity' ? [20, 100] : chartType === 'temperature' ? [20, 50] : [0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />

              {chartType === 'thermalStress' && (
                <>
                  <ReferenceLine y={80} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Danger Threshold (80)', fill: '#EF4444', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="thermalStress"
                    stroke="#F97316"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#chartGradStress)"
                    name="Thermal Stress"
                  />
                </>
              )}

              {chartType === 'temperature' && (
                <>
                  <ReferenceLine y={42} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Heatwave Criteria (42°C)', fill: '#EF4444', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="temperature"
                    stroke="#EF4444"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#chartGradTemp)"
                    name="Temperature (°C)"
                  />
                </>
              )}

              {chartType === 'humidity' && (
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#38BDF8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#chartGradHum)"
                  name="Humidity (%)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
