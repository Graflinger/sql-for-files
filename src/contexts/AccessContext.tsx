import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

export type AccessLevel = "guest" | "user" | "paid";
export type FeatureKey = "advancedUpload";

interface AccessContextType {
  level: AccessLevel;
  setLevel: (level: AccessLevel) => void;
  can: (feature: FeatureKey) => boolean;
  features: Record<FeatureKey, boolean>;
  isGuest: boolean;
  isUser: boolean;
  isPaid: boolean;
}

const ACCESS_STORAGE_KEY = "access-level";

const featureMatrix: Record<AccessLevel, Record<FeatureKey, boolean>> = {
  guest: {
    advancedUpload: false,
  },
  user: {
    advancedUpload: false,
  },
  paid: {
    advancedUpload: true,
  },
};

const AccessContext = createContext<AccessContextType | undefined>(undefined);

function getInitialLevel(): AccessLevel {
  if (typeof window === "undefined") return "guest";
  const stored = window.localStorage.getItem(ACCESS_STORAGE_KEY);
  if (stored === "guest" || stored === "user" || stored === "paid") {
    return stored;
  }
  return "guest";
}

export function AccessProvider({ children }: { children: React.ReactNode }) {
  const [level, setLevelState] = useState<AccessLevel>(getInitialLevel);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_STORAGE_KEY, level);
  }, [level]);

  const setLevel = useCallback((nextLevel: AccessLevel) => {
    setLevelState(nextLevel);
  }, []);

  const features = useMemo(() => featureMatrix[level], [level]);

  const can = useCallback(
    (feature: FeatureKey) => features[feature],
    [features]
  );

  const value = useMemo(
    () => ({
      level,
      setLevel,
      can,
      features,
      isGuest: level === "guest",
      isUser: level === "user",
      isPaid: level === "paid",
    }),
    [level, setLevel, can, features]
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}
