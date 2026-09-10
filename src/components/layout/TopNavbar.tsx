import React, { useState } from 'react';
import {
  MapPin,
  Bell,
  ChevronDown,
  Menu,
  X,
  User as UserIcon,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../common/RiskBadge';
import { LocationSearchInput } from '../common/LocationSearchInput';

interface TopNavbarProps {
  onNavigate: (path: string) => void;
  onOpenMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onNavigate, onOpenMobileMenu }) => {
  const { currentLocation, setLocation } = useLocation();
  const { unreadCount } = useAlerts();
  const { user } = useAuth();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#07111F]/90 backdrop-blur-xl border-b border-[#23415A] px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Mobile Menu Toggle & Location Selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-[#12263A] text-[#9FB2C5] hover:text-[#F4F8FC] border border-[#23415A]"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Location Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12263A] hover:bg-[#17324A] border border-[#23415A] text-xs sm:text-sm font-semibold text-[#F4F8FC] transition cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4 text-[#36C5F0] shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-[#F4F8FC] leading-tight truncate max-w-[140px] sm:max-w-[200px]">
                  {currentLocation.name}
                </span>
                <span className="text-[10px] text-[#9FB2C5] font-normal leading-none hidden sm:inline truncate max-w-[200px]">
                  {currentLocation.state ? `${currentLocation.state}, ` : ''}{currentLocation.country || ''}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9FB2C5] ml-0.5" />
            </button>

            {/* Location Dropdown Modal */}
            {showLocationDropdown && (
              <div className="absolute top-12 left-0 w-80 sm:w-96 bg-[#0D1B2A]/95 border border-[#23415A] rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#23415A]">
                  <span className="text-xs font-bold text-[#F4F8FC]">Meteorological Telemetry Station</span>
                  <button
                    onClick={() => setShowLocationDropdown(false)}
                    className="text-[#9FB2C5] hover:text-white text-xs p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <LocationSearchInput
                  onSelectLocation={(loc) => {
                    setLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                  placeholder="Search city, town or district..."
                  autoFocus
                  showGpsOption
                  onClose={() => setShowLocationDropdown(false)}
                />
              </div>
            )}
          </div>

          {/* Last Updated Telemetry Status */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#9FB2C5] px-2.5 py-1 rounded-xl bg-[#12263A]/80 border border-[#23415A]">
            <Clock className="w-3.5 h-3.5 text-[#36C5F0]" />
            <span>Updated Just Now</span>
          </div>
        </div>

        {/* Right: Risk Indicator, Alerts, User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Active Risk Badge Preview */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#12263A] border border-[#23415A]">
            <span className="text-xs text-[#9FB2C5] font-medium">Station Risk:</span>
            <RiskBadge level={currentLocation.riskLevel} size="sm" />
          </div>

          {/* Alerts Notification Button */}
          <button
            onClick={() => onNavigate('/alerts')}
            className="relative p-2 rounded-xl bg-[#12263A] text-[#9FB2C5] hover:text-[#F4F8FC] hover:bg-[#17324A] border border-[#23415A] transition cursor-pointer"
            aria-label="View Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#36C5F0] text-[#07111F] rounded-full text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            onClick={() => onNavigate('/profile')}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-[#12263A] hover:bg-[#17324A] border border-[#23415A] transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#36C5F0] to-[#7C83FD] flex items-center justify-center text-[#07111F] font-bold text-xs shadow-inner">
              {user ? user.name.slice(0, 1).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <span className="text-xs font-semibold text-[#F4F8FC] hidden sm:inline pr-1">
              {user?.name.split(' ')[0] || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
