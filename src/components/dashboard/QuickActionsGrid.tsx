import React from 'react';
import { Thermometer, AlertTriangle, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface QuickActionsGridProps {
  onNavigate: (path: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onNavigate }) => {
  const actions = [
    {
      title: 'Check Personal Risk',
      desc: 'Calculate custom thermal stress based on activity, age & sun exposure.',
      path: '/thermal-stress',
      icon: Thermometer,
      iconColor: 'text-orange-400',
      bgGradient: 'from-orange-500/15 hover:from-orange-500/25',
      borderColor: 'border-orange-500/30'
    },
    {
      title: 'View Warnings',
      desc: 'Inspect 24h, 48h and 7-day multi-model heatwave early warnings.',
      path: '/warning',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      bgGradient: 'from-red-500/15 hover:from-red-500/25',
      borderColor: 'border-red-500/30'
    },
    {
      title: 'Explore Risk Map',
      desc: 'Live interactive geospatial heatwave map across Indian states & districts.',
      path: '/map',
      icon: MapPin,
      iconColor: 'text-amber-400',
      bgGradient: 'from-amber-500/15 hover:from-amber-500/25',
      borderColor: 'border-amber-500/30'
    },
    {
      title: 'Safety Guidelines',
      desc: 'Hydration protocols, heat illness symptoms & first-aid checklists.',
      path: '/safety',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      bgGradient: 'from-emerald-500/15 hover:from-emerald-500/25',
      borderColor: 'border-emerald-500/30'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-white tracking-tight">Quick Action Centers</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.title}
              onClick={() => onNavigate(act.path)}
              className={`glass-panel p-5 rounded-2xl border ${act.borderColor} bg-gradient-to-br ${act.bgGradient} to-transparent cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-xl group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${act.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{act.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
