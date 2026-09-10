import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserCategory } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    userCategory: UserCategory;
    password?: string;
    confirmPassword?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  checkAuthSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthSession = async () => {
    try {
      const active = await authService.getCurrentUser();
      setUser(active);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, pass);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    userCategory: UserCategory;
    password?: string;
    confirmPassword?: string;
  }) => {
    setIsLoading(true);
    try {
      const newUser = await authService.signup(data);
      setUser(newUser);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await userService.updateProfile(data);
      setUser(updated);
    } catch (err) {
      console.error('Failed to update user profile on server:', err);
    }
  };

  const completeOnboarding = async () => {
    try {
      const updated = await authService.setOnboardingComplete();
      if (updated) {
        setUser(updated);
      } else if (user) {
        setUser({ ...user, onboarded: true });
      }
    } catch (err) {
      console.error('Failed to complete onboarding on server:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        completeOnboarding,
        checkAuthSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
