import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  MapPin,
  Activity,
  Bell,
  HeartPulse,
  History,
  UserCheck,
  Settings,
  AlertOctagon,
  LogOut,
  CalendarDays
} from 'lucide-react';
import { HeatGuardLogo } from '../common/HeatGuardLogo';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { logout, user } = useAuth();
  const { unreadCount, setShowEmergencyModal } = useAlerts();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Heat Risk', path: '/warning', icon: ShieldAlert, badge: 'Live' },
    { label: 'Forecast', path: '/history', icon: CalendarDays },
    { label: 'Live Monitoring', path: '/thermal-stress', icon: Activity },
    { label: 'Alerts', path: '/alerts', icon: Bell, count: unreadCount },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'Health Guidance', path: '/safety', icon: HeartPulse },
    { label: 'History', path: '/history', icon: History },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-[#07111F] border-r border-[#23415A] p-4 sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div
        onClick={() => onNavigate('/dashboard')}
        className="px-2 py-3 mb-2 cursor-pointer hover:opacity-90 transition"
      >
        <HeatGuardLogo size="md" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        <div className="px-2 mb-2 text-[10px] font-bold text-[#9FB2C5] uppercase tracking-wider">
          Climate Disaster Control
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path + item.label}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs sm:text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#36C5F0]/15 text-[#36C5F0] font-bold border border-[#36C5F0]/30 shadow-xs'
                  : 'text-[#9FB2C5] hover:text-[#F4F8FC] hover:bg-[#12263A]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#36C5F0]' : 'text-[#9FB2C5]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FF5C77]/20 text-[#FF5C77] border border-[#FF5C77]/30">
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#36C5F0] text-[#07111F] font-mono">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Quick Info */}
      {user && (
        <div className="p-2.5 my-2 rounded-xl bg-[#12263A] border border-[#23415A] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#36C5F0]/20 text-[#36C5F0] font-bold flex items-center justify-center text-xs border border-[#36C5F0]/30">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#F4F8FC] truncate">{user.name}</p>
            <p className="text-[10px] text-[#9FB2C5] truncate">{user.userCategory}</p>
          </div>
        </div>
      )}

      {/* Bottom Emergency Action & Logout */}
      <div className="pt-2 border-t border-[#23415A] space-y-1.5">
        <button
          onClick={() => {
            onNavigate('/emergency');
            setShowEmergencyModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FF5C77] hover:bg-[#ff4765] text-white font-bold text-xs shadow-md transition cursor-pointer"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Emergency Relief Action</span>
        </button>

        <button
          onClick={async () => {
            await logout();
            onNavigate('/login');
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[#9FB2C5] hover:text-[#FF5C77] hover:bg-[#12263A] text-xs font-medium transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
