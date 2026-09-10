import React, { useState } from 'react';
import { History, TrendingUp, Calendar, BarChart3, Clock, AlertTriangle } from 'lucide-react';
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
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  // Sample analytics historical data
  const trendData = [
    { date: 'May 01', maxTemp: 37, heatRisk: 58, stressIndex: 62, alerts: 2, peakHour: '13:00' },
    { date: 'May 02', maxTemp: 39, heatRisk: 68, stressIndex: 70, alerts: 3, peakHour: '14:00' },
    { date: 'May 03', maxTemp: 41, heatRisk: 78, stressIndex: 82, alerts: 5, peakHour: '14:30' },
    { date: 'May 04', maxTemp: 43, heatRisk: 88, stressIndex: 90, alerts: 8, peakHour: '15:00' },
    { date: 'May 05', maxTemp: 40, heatRisk: 72, stressIndex: 75, alerts: 4, peakHour: '14:00' },
    { date: 'May 06', maxTemp: 38, heatRisk: 62, stressIndex: 65, alerts: 2, peakHour: '13:30' },
    { date: 'May 07', maxTemp: 42, heatRisk: 84, stressIndex: 86, alerts: 6, peakHour: '14:30' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23415A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#36C5F0] mb-1">
            <History className="w-4 h-4" />
            <span>CLIMATE DATA ANALYTICS ARCHIVE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F4F8FC] tracking-tight">
            Heat Risk Trends & Predictive Analytics
          </h1>
          <p className="text-sm text-[#9FB2C5] mt-1">
            Multi-diurnal historical trends, thermal stress distribution, and alert volume statistics.
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
          <p className="text-2xl font-black text-[#F4F8FC] font-mono">40.0°C</p>
          <span className="text-[10px] text-[#FF5C77] font-semibold">+2.1°C vs Historical Norm</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Peak Thermal Stress</span>
          <p className="text-2xl font-black text-[#FF5C77] font-mono">90 / 100</p>
          <span className="text-[10px] text-[#F4C95D] font-semibold">May 04 Extreme Window</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Total Heat Alerts</span>
          <p className="text-2xl font-black text-[#36C5F0] font-mono">30 Alerts</p>
          <span className="text-[10px] text-[#9FB2C5]">Across 7 Monitoring Days</span>
        </div>

        <div className="sih-card p-4 space-y-1">
          <span className="text-[10px] font-bold text-[#9FB2C5] uppercase">Peak Heat Hours</span>
          <p className="text-2xl font-black text-[#F4F8FC] font-mono">14:00 - 15:00</p>
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
