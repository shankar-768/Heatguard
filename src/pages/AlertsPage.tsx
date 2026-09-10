import React, { useState } from 'react';
import { useAlerts } from '../context/AlertContext';
import { EmptyState } from '../components/common/EmptyState';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCheck,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';

interface AlertsPageProps {
  onNavigate: (path: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigate }) => {
  const { alerts, markAsRead, markAllAsRead, deleteAlert, refreshAlerts } = useAlerts();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'moderate' | 'resolved'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return a.severity === 'extreme';
    if (filter === 'high') return a.severity === 'high';
    if (filter === 'moderate') return a.severity === 'moderate';
    if (filter === 'resolved') return a.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23415A]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#36C5F0] mb-1">
            <Bell className="w-4 h-4" />
            <span>DISASTER MANAGEMENT EARLY WARNING SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F4F8FC] tracking-tight">
            Alert & Warning Center
          </h1>
          <p className="text-sm text-[#9FB2C5] mt-1">
            Real-time heatwave bulletins, wet-bulb strain alarms, and automated community advisories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshAlerts}
            className="px-3.5 py-2 rounded-xl bg-[#17324A] hover:bg-[#23415A] text-[#36C5F0] border border-[#23415A] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Live Telemetry</span>
          </button>

          {alerts.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3.5 py-2 rounded-xl bg-[#12263A] hover:bg-[#17324A] border border-[#23415A] text-xs font-semibold text-[#9FB2C5] flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-[#35D07F]" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs: Critical, High Risk, Moderate, Resolved */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#23415A]">
        {[
          { key: 'all', label: 'All Alerts' },
          { key: 'critical', label: 'Critical Alerts' },
          { key: 'high', label: 'High Risk' },
          { key: 'moderate', label: 'Moderate' },
          { key: 'resolved', label: 'Resolved' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filter === tab.key
                ? 'bg-[#36C5F0] text-[#07111F] shadow-md'
                : 'text-[#9FB2C5] hover:text-[#F4F8FC] hover:bg-[#12263A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`sih-card p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                alt.severity === 'extreme' ? 'border-[#FF5C77]/50 bg-[#FF5C77]/10' : 'border-[#23415A]'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] text-[#36C5F0] shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#F4F8FC]">{alt.title}</h3>
                    <RiskBadge level={alt.severity === 'extreme' ? 'Extreme' : alt.severity === 'high' ? 'High' : 'Moderate'} size="sm" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#9FB2C5] leading-relaxed max-w-3xl">
                    {alt.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#9FB2C5]">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#36C5F0]" /> {alt.timestamp}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#36C5F0]" /> {alt.location}
                    </span>
                    {alt.actualValue && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#F4F8FC]">Value: <strong>{alt.actualValue}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {alt.actionUrl && (
                  <button
                    onClick={() => onNavigate(alt.actionUrl!)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#36C5F0] hover:bg-[#2cb0d9] text-[#07111F] text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{alt.actionLabel || 'View Guidance'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}

                {!alt.isRead && (
                  <button
                    onClick={() => markAsRead(alt.id)}
                    title="Mark as read"
                    className="p-2 rounded-xl bg-[#17324A] hover:bg-[#23415A] text-[#9FB2C5] hover:text-white border border-[#23415A] transition cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4 text-[#35D07F]" />
                  </button>
                )}

                <button
                  onClick={() => deleteAlert(alt.id)}
                  title="Dismiss alert"
                  className="p-2 rounded-xl bg-[#17324A] hover:bg-[#FF5C77]/20 text-[#9FB2C5] hover:text-[#FF5C77] border border-[#23415A] transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No active alerts in this category."
          description="Meteorological telemetry and Wet-Bulb strain indices are currently operating within nominal safety thresholds."
        />
      )}
    </div>
  );
};
