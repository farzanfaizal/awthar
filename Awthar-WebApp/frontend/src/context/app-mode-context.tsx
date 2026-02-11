"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type AppMode = "customer" | "provider";

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isCustomerMode: boolean;
  isProviderMode: boolean;
  userCanBeProvider: boolean;
  isAppModeLoading: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [mode, setModeState] = useState<AppMode>("customer");
  const [isAppModeLoading, setIsAppModeLoading] = useState(true);

  const userCanBeProvider =
    isAuthenticated && (user?.role === "provider" || user?.role === "both");

  useEffect(() => {
    if (isAuthLoading) return;

    const savedMode = localStorage.getItem("awthar-app-mode") as AppMode;

    if (savedMode && userCanBeProvider) {
      setModeState(savedMode);
    } else if (userCanBeProvider) {
      setModeState("provider");
    } else {
      setModeState("customer");
    }
    setIsAppModeLoading(false);
  }, [isAuthenticated, userCanBeProvider, isAuthLoading]);

  const setMode = useCallback(
    (newMode: AppMode) => {
      if (newMode === "provider" && !userCanBeProvider) return;
      setModeState(newMode);
      localStorage.setItem("awthar-app-mode", newMode);
    },
    [userCanBeProvider]
  );

  return (
    <AppModeContext.Provider
      value={{
        mode,
        setMode,
        isCustomerMode: mode === "customer",
        isProviderMode: mode === "provider",
        userCanBeProvider,
        isAppModeLoading,
      }}
    >
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppMode must be used within an AppModeProvider");
  }
  return context;
}
