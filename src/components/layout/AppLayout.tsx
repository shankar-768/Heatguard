import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { MobileNavigation } from './MobileNavigation';
import { WarningBanner } from '../common/WarningBanner';
import { EmergencyModal } from '../common/EmergencyModal';
import { DemoToolbar } from '../common/DemoToolbar';
import { DisclaimerBadge } from '../common/DisclaimerBadge';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07111F] text-[#F4F8FC] flex flex-col antialiased">
      {/* Top Early Warning Banner */}
      <WarningBanner onViewWarning={() => onNavigate('/warning')} />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
          <TopNavbar
            onNavigate={onNavigate}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {children}
            <div className="mt-12 no-print">
              <DisclaimerBadge />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation & Drawer */}
      <MobileNavigation
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpenMenu={mobileMenuOpen}
        onCloseMenu={() => setMobileMenuOpen(false)}
      />

      {/* Emergency Assistance Modal */}
      <EmergencyModal />

      {/* SIH Judge Demo Controls */}
      <DemoToolbar />
    </div>
  );
};
