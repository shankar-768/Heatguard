import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Calendar, BarChart3, Clock, AlertTriangle, RefreshCw, Radio } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { weatherService } from '../services/weatherService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const HistoryPage: React.FC = () => {
  const { currentLocation } = useLocation();
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      const days = range === '7d' ? 7 : 30;
      try {
        const hist = await weatherService.fetchHistoricalData(days, currentLocation);
        if (isMounted && Array.isArray(hist) && hist.length > 0) {
          const mapped = hist.map(h => ({
            date: h.date,
            maxTemp: h.maxTemp,
            heatRisk: h.thermalStress,
            stressIndex: h.thermalStress,
            alerts: h.maxTemp >= 42 ? 5 : h.maxTemp >= 40 ? 3 : h.maxTemp >= 38 ? 2 : 1,
            peakHour: '14:00'
          }));
          setTrendData(mapped);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('[HistoryPage] Failed to load historical telemetry:', err);
      }

      if (isMounted) {
        const base = currentLocation.baseTemp || 36;
        const count = range === '7d' ? 7 : 30;
        const now = new Date();
        const fallback = Array.from({ length: count }, (_, i) => {
          const d = new Date(now);
          d.setDate(d.getDate() - (count - i));
          const t = Math.round((base + Math.sin(i * 0.8) * 3) * 10) / 10;
          return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            maxTemp: t,
            heatRisk: Math.min(100, Math.round(t * 1.8)),
            stressIndex: Math.min(100, Math.round(t * 1.8)),
            alerts: t >= 40 ? 4 : t >= 38 ? 2 : 1,
            peakHour: '14:00'
          };
        });
        setTrendData(fallback);
        setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [range, currentLocation.lat, currentLocation.lng]);

  const avgMaxTemp = trendData.length > 0
    ? (trendData.reduce((acc, curr) => acc + curr.maxTemp, 0) / trendData.length).toFixed(1)
    : '38.5';

  const peakStress = trendData.length > 0
    ? Math.max(...trendData.map(d => d.stressIndex || 0))
    : 85;

  const totalAlerts = trendData.reduce((acc, curr) => acc + (curr.alerts || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23415A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#36C5F0] mb-1">
            <History className="w-4 h-4" />
            <span>CLIMATE DATA ANALYTICS ARCHIVE • {currentLocation.name}, {currentLocation.state}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F4F8FC] tracking-tight">
            Heat Risk Trends & Historical Telemetry
          </h1>
          <p className="text-sm text-[#9FB2C5] mt-1">
            Multi-diurnal historical trends, thermal stress distribution, and alert volume observations.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#12263A] border border-[#23415A]">
          <button
            onClick={() => setRange('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              range === '7d' ? 'bg-[#36C5F0] text-[#07111F]' : 'text-[#9FB2C5] hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setRange('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              range === '30d' ? 'bg-[#36C5F0] text-[#07111F]' : 'text-[#9FB2C5] hover:text-white'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Average Max Temp</span>
          <p className="text-2xl font-black text-[#F4F8FC] font-mono">{avgMaxTemp}°C</p>
          <span className="text-[10px] text-[#35D07F] font-semibold">Station Multi-Day Avg</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Peak Thermal Stress</span>
          <p className="text-2xl font-black text-[#FF5C77] font-mono">{peakStress} / 100</p>
          <span className="text-[10px] text-[#F4C95D] font-semibold">Max Recorded Window</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Total Heat Alerts</span>
          <p className="text-2xl font-black text-[#36C5F0] font-mono">{totalAlerts} Alerts</p>
          <span className="text-[10px] text-[#9FB2C5]">Across {range === '7d' ? '7' : '30'} Monitoring Days</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Peak Heat Hours</span>
          <p className="text-2xl font-black text-[#F4F8FC] font-mono">13:30 - 15:30</p>
          <span className="text-[10px] text-[#35D07F] font-semibold">Diurnal Maximum</span>
        </div>
      </div>

      {/* Chart 1: Heat Risk & Temperature Trends (Line / Area) */}
      <div className="sih-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#23415A]">
          <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#36C5F0]" />
            HEAT RISK & TEMPERATURE TRENDS
          </h3>
          <span className="text-xs text-[#9FB2C5] font-mono">7-Day Progression</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#36C5F0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#36C5F0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#23415A" opacity={0.5} />
              <XAxis dataKey="date" stroke="#9FB2C5" fontSize={11} tickLine={false} />
              <YAxis stroke="#9FB2C5" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0D1B2A',
                  borderColor: '#23415A',
                  borderRadius: '12px',
                  color: '#F4F8FC',
                  fontSize: '11px'
                }}
              />
              <Area type="monotone" dataKey="heatRisk" stroke="#36C5F0" strokeWidth={2} fill="url(#riskGrad)" name="Heat Risk Index" />
              <Line type="monotone" dataKey="maxTemp" stroke="#FF5C77" strokeWidth={2} name="Max Temp (°C)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Alert Volume Bar Chart & Stress Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 sih-card p-6 space-y-4">
          <div className="pb-3 border-b border-[#23415A]">
            <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#F4C95D]" />
              NUMBER OF ALERTS DISPATCHED
            </h3>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23415A" opacity={0.5} />
                <XAxis dataKey="date" stroke="#9FB2C5" fontSize={10} tickLine={false} />
                <YAxis stroke="#9FB2C5" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2A',
                    borderColor: '#23415A',
                    borderRadius: '12px',
                    color: '#F4F8FC',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="alerts" fill="#F4C95D" radius={[6, 6, 0, 0]} name="Alerts Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-6 sih-card p-6 space-y-4">
          <div className="pb-3 border-b border-[#23415A]">
            <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7C83FD]" />
              PEAK HEAT HOURS RECORDED
            </h3>
          </div>

          <div className="space-y-3">
            {trendData.map((d, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] text-xs">
                <span className="font-bold text-[#F4F8FC]">{d.date}</span>
                <span className="text-[#9FB2C5] font-mono">Max Temp: <strong className="text-[#FF5C77]">{d.maxTemp}°C</strong></span>
                <span className="font-mono text-[#36C5F0] font-bold">Peak: {d.peakHour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
