import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineProvider } from './context/OfflineContext';
import { DemoProvider, useDemo } from './context/DemoContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { OfflineBanner } from './components/common/OfflineBanner';
import { GuidedDemoBanner } from './components/common/GuidedDemoBanner';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DatabaseAuditPanel } from './components/common/DatabaseAuditPanel';
import { WelcomeLanding } from './components/auth/WelcomeLanding';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardView } from './components/dashboard/DashboardView';
import { LandIntelligenceView } from './components/gis/LandIntelligenceView';
import { BhoomiAIView } from './components/ai/BhoomiAIView';
import { ResearchHubView } from './components/research/ResearchHubView';
import { PolicyLabView } from './components/policylab/PolicyLabView';
import { PredictiveAnalyticsView } from './components/predictive/PredictiveAnalyticsView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { ProfileView } from './components/profile/ProfileView';
import { LandSearchView } from './components/land/LandSearchView';
import { AdminLandManagementView } from './components/admin/AdminLandManagementView';
import { MOCK_NOTIFICATIONS } from './data/mockData';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [authView, setAuthView] = useState<'welcome' | 'login'>('welcome');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDbAuditOpen, setIsDbAuditOpen] = useState(false);

  if (!isAuthenticated) {
    if (authView === 'welcome') {
      return (
        <WelcomeLanding
          onLoginClick={() => setAuthView('login')}
          onExploreDemoClick={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginScreen
        onBackToLanding={() => setAuthView('welcome')}
        onExploreDemo={() => setAuthView('login')}
      />
    );
  }

  const handleNavigate = (tab: string, projId?: string) => {
    setCurrentTab(tab);
    if (projId) {
      setSelectedProjectId(projId);
    } else if (tab !== 'projects') {
      setSelectedProjectId(null);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'official';

  const renderActiveModule = () => {
    if (selectedProjectId) {
      return (
        <ProjectDetailView
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
          onNavigateGIS={() => {
            setSelectedProjectId(null);
            setCurrentTab('gis');
          }}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={handleNavigate} />;
      case 'search':
        return <LandSearchView />;
      case 'gis':
        return (
          <LandIntelligenceView
            onSelectProjectDetail={(id) => handleNavigate('projects', id)}
          />
        );
      case 'ai':
        return (
          <BhoomiAIView
            onNavigateResearch={() => setCurrentTab('research')}
            onNavigateProject={(id) => handleNavigate('projects', id)}
          />
        );
      case 'research':
        return <ResearchHubView />;
      case 'policylab':
        return <PolicyLabView />;
      case 'predictive':
        return <PredictiveAnalyticsView />;
      case 'projects':
        return (
          <ProjectsView
            onSelectProject={(id) => handleNavigate('projects', id)}
          />
        );
      case 'admin':
        if (!isAdmin) {
          return (
            <div className="p-12 text-center text-red-600 font-bold bg-white rounded-3xl m-8 border border-red-200 shadow">
              ⚠️ Access Denied: Admin / Authorized Officer privileges required to view Land Management.
            </div>
          );
        }
        return <AdminLandManagementView />;
      case 'notifications':
        return (
          <NotificationsView
            onSelectProject={(id) => handleNavigate('projects', id)}
          />
        );
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <DemoProvider onNavigate={(path, projId) => handleNavigate(path, projId)}>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* Offline Banner */}
        <OfflineBanner />

        {/* Guided SIH Demo Banner */}
        <GuidedDemoBanner />

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onNavigate={(tab) => handleNavigate(tab)}
            unreadCount={MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-0">
            <Header
              onToggleNotifications={() => setIsNotificationsOpen(true)}
              onOpenDatabaseAudit={() => setIsDbAuditOpen(true)}
              unreadCount={MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
              onNavigate={(tab) => handleNavigate(tab)}
            />

            <main className="flex-1">{renderActiveModule()}</main>
          </div>
        </div>

        {/* Responsive Mobile Bottom Nav */}
        <BottomNav
          currentTab={currentTab}
          onNavigate={(tab) => handleNavigate(tab)}
          unreadCount={MOCK_NOTIFICATIONS.filter((n) => !n.read).length}
        />

        {/* Sliding Notification Drawer */}
        <NotificationDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={MOCK_NOTIFICATIONS}
          onSelectProject={(id) => handleNavigate('projects', id)}
        />

        {/* Database Audit Log Inspection Modal */}
        <DatabaseAuditPanel
          isOpen={isDbAuditOpen}
          onClose={() => setIsDbAuditOpen(false)}
          onRefreshData={() => handleNavigate(currentTab)}
        />
      </div>
    </DemoProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <MainAppContent />
      </OfflineProvider>
    </AuthProvider>
  );
}

export default App;
