import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onRedirectToLogin: () => void;
  onRedirectToOnboarding?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  onRedirectToLogin,
  onRedirectToOnboarding
}) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        onRedirectToLogin();
      } else if (!user.onboarded && onRedirectToOnboarding) {
        onRedirectToOnboarding();
      }
    }
  }, [user, isLoading, onRedirectToLogin, onRedirectToOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#060911] p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (!user || (!user.onboarded && onRedirectToOnboarding)) {
    return null;
  }

  return <>{children}</>;
};
