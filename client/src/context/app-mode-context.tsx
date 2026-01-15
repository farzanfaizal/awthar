import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { errorHandler } from '@/lib/error-handler';

type AppMode = 'customer' | 'provider';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isCustomerMode: boolean;
  isProviderMode: boolean;
  userCanBeProvider: boolean;
  isAppModeLoading: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

interface AppModeProviderProps {
  children: ReactNode;
}

export const AppModeProvider = ({ children }: AppModeProviderProps) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [mode, setModeState] = useState<AppMode>('customer');
  const [isAppModeLoading, setIsAppModeLoading] = useState(true);

  // Determine if the user has a provider profile
  const userCanBeProvider = isAuthenticated && (user?.role === 'provider' || user?.role === 'both');

  // Initialize mode from localStorage or based on user role
  useEffect(() => {
    if (isAuthLoading) {
      // Still loading auth, defer mode initialization
      return;
    }

    const savedMode = localStorage.getItem('awthar-app-mode') as AppMode;

    if (savedMode && userCanBeProvider) {
      // If a mode is saved and user is eligible for provider mode, use it
      setModeState(savedMode);
    } else if (userCanBeProvider) {
      // If user is provider but no mode saved, default to provider
      setModeState('provider');
    } else {
      // Default to customer mode for all other cases
      setModeState('customer');
    }
    setIsAppModeLoading(false);
  }, [isAuthenticated, userCanBeProvider, isAuthLoading]);

  // Persist mode to localStorage when it changes
  const setMode = useCallback((newMode: AppMode) => {
    if (newMode === 'provider' && !userCanBeProvider) {
      // Prevent setting provider mode if user is not eligible
      errorHandler.warn("User is not eligible to be a provider");
      return;
    }
    setModeState(newMode);
    localStorage.setItem('awthar-app-mode', newMode);
  }, [userCanBeProvider]);

  const isCustomerMode = mode === 'customer';
  const isProviderMode = mode === 'provider';

  const value = {
    mode,
    setMode,
    isCustomerMode,
    isProviderMode,
    userCanBeProvider,
    isAppModeLoading,
  };

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
