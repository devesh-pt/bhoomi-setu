import React, { useState, useEffect } from 'react';
import './i18n';
import { useTranslation } from 'react-i18next';
import {
  Map, Route, Sparkles, Trees, LogOut, Globe, User, Shield, CheckCircle2,
  Search, HelpCircle, Scale, PlayCircle, FileText, Command, AlertTriangle, RefreshCw
} from 'lucide-react';

import { Login } from './pages/Login';
import { LandMapModule } from './components/map/LandMapModule';
import { CascadingLandSearch } from './components/land/CascadingLandSearch';
import { KhatauniB1View } from './components/bhuiyan/KhatauniB1View';
import { KhasraPIIView } from './components/bhuiyan/KhasraPIIView';
import { GirdawariModule } from './components/bhuiyan/GirdawariModule';
import { GrievanceModuleView } from './components/bhuiyan/GrievanceModuleView';
import { CertificateVerifyView } from './components/bhuiyan/CertificateVerifyView';
import { RevenueCourtView } from './components/bhuiyan/RevenueCourtView';
import { HighwaysModule } from './components/highways/HighwaysModule';
import { MuavjaModule } from './components/muavja/MuavjaModule';
import { ForestImpactModule } from './components/forest/ForestImpactModule';
import { ProfileView } from './components/profile/ProfileView';
import { GuidedDemoMode } from './components/demo/GuidedDemoMode';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SplashLoader } from './components/ui/SplashLoader';
import { CommandPalette } from './components/ui/CommandPalette';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { DemoProvider } from './context/DemoContext';
import { api } from './services/api';

import { BottomNav } from './components/common/BottomNav';
import { isDemoMode } from './services/api';

type ModuleType =
  | 'land_map'
  | 'cascading_search'
  | 'grievances'
  | 'court'
  | 'highways'
  | 'ai_detection'
  | 'forest_impact'
  | 'verify'
  | 'profile';

export const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('land_map');
  const [showGuidedDemo, setShowGuidedDemo] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [backendOffline, setBackendOffline] = useState<boolean>(false);
  const [checkingBackend, setCheckingBackend] = useState<boolean>(false);

  // Modals for B-1, P-II, Girdawari
  const [activeKhatauni, setActiveKhatauni] = useState<string | null>(null);
  const [activeKhasra, setActiveKhasra] = useState<string | null>(null);
  const [activeGirdawari, setActiveGirdawari] = useState<string | null>(null);
  const [verifyHash, setVerifyHash] = useState<string | null>(null);

  useEffect(() => {
    checkBackendHealth();
    
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    } else if (isDemoMode()) {
      // Auto demo user for GitHub Pages / static demo mode
      const defaultUser = { username: 'admin', role: 'official', name: 'Demo Officer (CG)' };
      setToken('demo_token');
      setUser(defaultUser);
    }

    // Hash sync on init and hashchange
    const syncHashToModule = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('verify/')) {
        const hashVal = hash.replace('verify/', '');
        setVerifyHash(hashVal);
        setActiveModule('verify');
      } else if (hash && [
        'land_map', 'cascading_search', 'grievances', 'court',
        'highways', 'ai_detection', 'forest_impact', 'profile'
      ].includes(hash)) {
        setActiveModule(hash as ModuleType);
      }
    };

    syncHashToModule();
    window.addEventListener('hashchange', syncHashToModule);
    return () => window.removeEventListener('hashchange', syncHashToModule);
  }, []);

  const handleModuleChange = (module: ModuleType | string) => {
    const mod = module as ModuleType;
    setActiveModule(mod);
    window.location.hash = `#/${mod}`;
  };

  const checkBackendHealth = async () => {
    if (isDemoMode()) {
      setBackendOffline(false);
      return;
    }
    setCheckingBackend(true);
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/health`).catch(() => null);
      if (res && res.ok) {
        setBackendOffline(false);
      } else {
        setBackendOffline(true);
      }
    } catch (err) {
      setBackendOffline(true);
    } finally {
      setCheckingBackend(false);
    }
  };

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const handleDemoNavigate = (tab: string) => {
    if (tab === 'search') handleModuleChange('cascading_search');
    else if (tab === 'dispute' || tab === 'ai_detection') handleModuleChange('ai_detection');
    else if (tab === 'highways') handleModuleChange('highways');
    else if (tab === 'forest') handleModuleChange('forest_impact');
    else handleModuleChange('land_map');
  };

  if (showSplash) {
    return <SplashLoader onComplete={() => setShowSplash(false)} />;
  }

  if (activeModule === 'verify' && verifyHash) {
    return (
      <CertificateVerifyView
        hashParam={verifyHash}
        onBack={() => {
          setVerifyHash(null);
          handleModuleChange('land_map');
        }}
      />
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Backend Offline Warning Banner (hidden in static demo mode) */}
      {backendOffline && !isDemoMode() && (
        <div className="bg-amber-950/90 text-amber-200 border-b border-amber-500/40 px-4 py-2 text-xs font-bold flex justify-between items-center z-50 sticky top-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>Backend service (http://localhost:8000) unreachable. Features running in offline mode.</span>
          </div>
          <button
            onClick={checkBackendHealth}
            disabled={checkingBackend}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg font-bold flex items-center gap-1 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingBackend ? 'animate-spin' : ''}`} />
            <span>{checkingBackend ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>
      )}

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={(mod) => handleModuleChange(mod as ModuleType)}
      />

      {/* Guided Demo Top Floating Banner */}
      {showGuidedDemo && (
        <GuidedDemoMode
          onNavigateTab={handleDemoNavigate}
          onClose={() => setShowGuidedDemo(false)}
        />
      )}

      {/* App Header */}
      <Header
        onToggleNotifications={() => {}}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        unreadCount={2}
        onNavigate={(path) => handleModuleChange(path as ModuleType)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={activeModule}
          onNavigate={(tab) => handleModuleChange(tab as ModuleType)}
          unreadCount={2}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Module View Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 pb-20 lg:pb-6">
          <div key={activeModule} className="animate-page-slide min-h-full">
            <ErrorBoundary>
              {activeModule === 'land_map' && <LandMapModule />}
              {activeModule === 'cascading_search' && (
                <CascadingLandSearch
                  onSelectParcel={() => handleModuleChange('land_map')}
                  onOpenKhatauni={(khataNo) => setActiveKhatauni(khataNo)}
                  onOpenKhasra={(parcelId) => setActiveKhasra(parcelId)}
                />
              )}
              {activeModule === 'grievances' && <GrievanceModuleView />}
              {activeModule === 'court' && <RevenueCourtView />}
              {activeModule === 'highways' && <HighwaysModule />}
              {activeModule === 'ai_detection' && <MuavjaModule />}
              {activeModule === 'forest_impact' && <ForestImpactModule />}
              {activeModule === 'profile' && <ProfileView />}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={activeModule}
        onNavigate={(tab) => handleModuleChange(tab as ModuleType)}
        unreadCount={2}
      />

      {/* B-1 Khatauni Modal */}
      {activeKhatauni && (
        <KhatauniB1View
          isOpen={!!activeKhatauni}
          onClose={() => setActiveKhatauni(null)}
          khataNo={activeKhatauni}
        />
      )}

      {/* P-II Khasra Modal */}
      {activeKhasra && (
        <KhasraPIIView
          isOpen={!!activeKhasra}
          onClose={() => setActiveKhasra(null)}
          parcelId={activeKhasra}
        />
      )}

      {/* Girdawari Modal */}
      {activeGirdawari && (
        <GirdawariModule
          isOpen={!!activeGirdawari}
          onClose={() => setActiveGirdawari(null)}
          parcelId={activeGirdawari}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => (
  <ErrorBoundary>
    <AuthProvider>
      <OfflineProvider>
        <DemoProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DemoProvider>
      </OfflineProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
