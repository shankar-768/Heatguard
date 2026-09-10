import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AlertItem } from '../types';
import { alertService } from '../services/alertService';
import { useLocation } from './LocationContext';

interface AlertContextType {
  alerts: AlertItem[];
  unreadCount: number;
  criticalAlert: AlertItem | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteAlert: (id: string) => void;
  refreshAlerts: () => void;
  dismissCriticalBanner: () => void;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { weather, hourlyForecast, multiDayForecast, airQuality, currentLocation, isLoading } = useLocation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Generate dynamic alerts whenever live telemetry is updated
  const syncAlerts = useCallback(() => {
    if (isLoading && weather.temperature === 32.0 && weather.condition === 'Loading Telemetry') {
      return;
    }
    const dynamicAlerts = alertService.generateAlertsFromTelemetry(
      weather,
      hourlyForecast,
      multiDayForecast,
      airQuality || undefined,
      currentLocation.name
    );
    setAlerts(dynamicAlerts);
  }, [weather, hourlyForecast, multiDayForecast, airQuality, currentLocation.name, isLoading]);

  useEffect(() => {
    syncAlerts();
  }, [syncAlerts]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const criticalAlert =
    !bannerDismissed
      ? alerts.find(a => a.severity === 'extreme' || a.severity === 'high') || null
      : null;

  const markAsRead = (id: string) => {
    alertService.setReadAlertId(id);
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
  };

  const markAllAsRead = () => {
    const ids = alerts.map(a => a.id);
    alertService.setAllReadAlertIds(ids);
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const refreshAlerts = () => {
    syncAlerts();
  };

  const dismissCriticalBanner = () => {
    setBannerDismissed(true);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        criticalAlert,
        markAsRead,
        markAllAsRead,
        deleteAlert,
        refreshAlerts,
        dismissCriticalBanner,
        showEmergencyModal,
        setShowEmergencyModal
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlerts must be used within an AlertProvider');
  return context;
};
