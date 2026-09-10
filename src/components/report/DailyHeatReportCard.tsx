import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { reportService } from '../../services/reportService';
import { RiskBadge } from '../common/RiskBadge';
import { HeatGuardLogo } from '../common/HeatGuardLogo';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  MapPin,
  Flame,
  Thermometer,
  Droplets,
  Clock,
  ShieldAlert,
  Users
} from 'lucide-react';

export const DailyHeatReportCard: React.FC = () => {
  const { currentLocation, weather, multiDayForecast } = useLocation();
  const report = reportService.generateDailyReport(currentLocation, weather, multiDayForecast);

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Official Daily Heat & Disaster Action Report
          </h3>
          <p className="text-xs text-slate-400">
            Standardized microclimate assessment report for municipal administrators and public safety
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => reportService.downloadReportJSON(report)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-orange-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => reportService.printReport()}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel print-card rounded-3xl p-6 sm:p-8 border-slate-800 shadow-2xl space-y-6">
        {/* Report Official Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <HeatGuardLogo size="md" />
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">
              Document ID: HG-REP-{Date.now().toString().slice(-6)} | National Telemetry Node
            </span>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-300 font-bold">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>{report.date}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{report.locationName}, {report.state}</span>
            </div>
          </div>
        </div>

        {/* Executive Risk Status Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Disaster Management Classification
            </span>
            <div className="flex items-center gap-3">
              <h4 className="text-2xl font-black text-white">{report.heatwaveStatus}</h4>
              <RiskBadge level={report.highestRisk} size="md" />
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-semibold block">Maximum Thermal Stress</span>
            <span className="text-3xl font-black font-mono text-orange-400">
              {report.maxThermalStress} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </span>
          </div>
        </div>

        {/* 4 Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" /> Peak Temperature
            </span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              {report.peakTemp}°C
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{report.peakTempTime}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Average Diurnal Temp
            </span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              {report.avgTemp}°C
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">24h Mean</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" /> Average Humidity
            </span>
            <span className="text-xl font-black font-mono text-white mt-1 block">
              {report.avgHumidity}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Moisture Saturation</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-400" /> Critical Risk Window
            </span>
            <span className="text-sm font-bold text-amber-300 mt-1 block">
              {report.peakRiskPeriod}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Peak Solar Azimuth</span>
          </div>
        </div>

        {/* Vulnerability & Action Directives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" />
              Vulnerable Population Impact
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {report.totalVulnerablePopulationRiskEstimate}. Special advisories issued for construction workers, farmers, delivery personnel, and elderly citizens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Municipal Precaution Protocols
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {report.precautionsTakenSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
