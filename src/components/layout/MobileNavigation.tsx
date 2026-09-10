import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Bell,
  MapPin,
  HeartPulse,
  X,
  History,
  Activity,
  UserCheck,
  Settings,
  LogOut,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { HeatGuardLogo } from '../common/HeatGuardLogo';

interface MobileNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpenMenu: boolean;
  onCloseMenu: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPath,
  onNavigate,
  isOpenMenu,
  onCloseMenu
}) => {
  const { logout, user } = useAuth();
  const { unreadCount, setShowEmergencyModal } = useAlerts();

  // Primary bottom navigation items (5 items)
  const bottomItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Heat Risk', path: '/warning', icon: ShieldAlert },
    { label: 'Alerts', path: '/alerts', icon: Bell, count: unreadCount },
    { label: 'Map', path: '/map', icon: MapPin },
    { label: 'Guidance', path: '/safety', icon: HeartPulse },
  ];

  // Secondary drawer items
  const drawerItems = [
    { label: 'Live Monitoring', path: '/thermal-stress', icon: Activity },
    { label: 'Historical Trends', path: '/history', icon: History },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Fixed Navigation Bar for Mobile (390px / Mobile view) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/95 backdrop-blur-xl border-t border-[#23415A] px-2 py-2 select-none">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer relative ${
                  isActive ? 'text-[#36C5F0] font-bold' : 'text-[#9FB2C5] hover:text-[#F4F8FC]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-none">{item.label}</span>

                {typeof item.count === 'number' && item.count > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-[#36C5F0] text-[#07111F] rounded-full text-[9px] font-black flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Slide-over Drawer Menu for Mobile */}
      {isOpenMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-4/5 max-w-xs h-full bg-[#07111F] border-l border-[#23415A] p-5 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#23415A]">
                <HeatGuardLogo size="sm" showSubtitle={false} />
                <button
                  onClick={onCloseMenu}
                  className="p-1.5 rounded-lg bg-[#12263A] text-[#9FB2C5] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-[10px] font-bold text-[#9FB2C5] uppercase tracking-wider px-2 mb-2">
                  Navigation Menu
                </p>

                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        onNavigate(item.path);
                        onCloseMenu();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#36C5F0]/15 text-[#36C5F0] border border-[#36C5F0]/30'
                          : 'text-[#9FB2C5] hover:bg-[#12263A] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#23415A] space-y-2">
              <button
                onClick={() => {
                  onNavigate('/emergency');
                  setShowEmergencyModal(true);
                  onCloseMenu();
                }}
                className="w-full py-2.5 rounded-xl bg-[#FF5C77] text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Emergency Heat SOS</span>
              </button>

              <button
                onClick={async () => {
                  await logout();
                  onNavigate('/login');
                  onCloseMenu();
                }}
                className="w-full py-2 rounded-xl bg-[#12263A] text-[#9FB2C5] hover:text-[#FF5C77] font-semibold text-xs flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
