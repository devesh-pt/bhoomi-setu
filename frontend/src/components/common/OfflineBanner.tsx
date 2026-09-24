import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export const OfflineBanner: React.FC = () => {
  const { isOffline, toggleOfflineMode } = useOffline();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md z-40 border-b border-amber-600 animate-in fade-in">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
        <span>Offline Mode — Showing Cached Prototype Data (Demonstrates Field Usability)</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] bg-amber-600/30 px-2 py-0.5 rounded border border-amber-700/40">
          <Database className="w-3 h-3" />
          <span>Local Mock Service Active</span>
        </span>
        <button
          onClick={toggleOfflineMode}
          className="underline text-slate-950 hover:text-white font-extrabold text-[11px]"
        >
          Go Online
        </button>
      </div>
    </div>
  );
};
