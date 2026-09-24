import React, { createContext, useContext, useState } from 'react';

interface OfflineContextType {
  isOffline: boolean;
  toggleOfflineMode: () => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);

  const toggleOfflineMode = () => {
    setIsOffline((prev) => !prev);
  };

  return (
    <OfflineContext.Provider value={{ isOffline, toggleOfflineMode }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
