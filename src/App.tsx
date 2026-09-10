import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { AlertProvider } from './context/AlertContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { HeatwaveWarningPage } from './pages/HeatwaveWarningPage';
import { HeatRiskMapPage } from './pages/HeatRiskMapPage';
import { ThermalStressPage } from './pages/ThermalStressPage';
import { AlertsPage } from './pages/AlertsPage';
import { SafetyPage } from './pages/SafetyPage';
import { HistoryPage } from './pages/HistoryPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { user } = useAuth();
  
  // URL Hash or state-based routing
  const getInitialPath = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) return hash;
    return user ? '/dashboard' : '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPath(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Public Unauthenticated Routes
  if (currentPath === '/') {
    return (
      <LandingPage
        onGetStarted={() => navigate(user ? '/dashboard' : '/signup')}
        onLogin={() => navigate('/login')}
        onExploreDemo={() => navigate('/dashboard')}
      />
    );
  }

  if (currentPath === '/login') {
    return (
      <LoginPage
        onNavigateToSignup={() => navigate('/signup')}
        onLoginSuccess={() => navigate('/dashboard')}
        onNavigateToHome={() => navigate('/')}
      />
    );
  }

  if (currentPath === '/signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => navigate('/login')}
        onSignupSuccess={() => navigate('/onboarding')}
        onNavigateToHome={() => navigate('/')}
      />
    );
  }

  if (currentPath === '/onboarding') {
    return (
      <OnboardingPage
        onComplete={() => navigate('/dashboard')}
      />
    );
  }

  // 2. Authenticated Protected Routes inside AppLayout
  return (
    <ProtectedRoute
      onRedirectToLogin={() => navigate('/login')}
      onRedirectToOnboarding={() => navigate('/onboarding')}
    >
      <AppLayout currentPath={currentPath} onNavigate={navigate}>
        {currentPath === '/dashboard' && (
          <DashboardPage onNavigate={navigate} />
        )}
        {currentPath === '/warning' && (
          <HeatwaveWarningPage onNavigateToSafety={() => navigate('/safety')} />
        )}
        {currentPath === '/map' && (
          <HeatRiskMapPage onNavigateToWarning={() => navigate('/warning')} />
        )}
        {currentPath === '/thermal-stress' && (
          <ThermalStressPage />
        )}
        {currentPath === '/alerts' && (
          <AlertsPage onNavigate={navigate} />
        )}
        {currentPath === '/safety' && (
          <SafetyPage />
        )}
        {currentPath === '/history' && (
          <HistoryPage />
        )}
        {currentPath === '/emergency' && (
          <EmergencyPage onNavigateToSafety={() => navigate('/safety')} />
        )}
        {currentPath === '/profile' && (
          <ProfilePage />
        )}
        {currentPath === '/settings' && (
          <SettingsPage onNavigateToProfile={() => navigate('/profile')} />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <AlertProvider>
            <AppContent />
          </AlertProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
