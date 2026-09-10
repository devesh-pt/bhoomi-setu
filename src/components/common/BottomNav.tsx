import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Search,
  BookOpen,
  Bot,
  FolderKanban,
  Menu,
  X,
  Sliders,
  LineChart,
  Bell,
  User,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  unreadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, unreadCount }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'official';

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    count?: number;
  }

  const primaryItems: NavItem[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'gis', label: 'GIS Map', icon: Map },
    { id: 'ai', label: 'AI Assist', icon: Bot },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
  ];

  const secondaryItems: NavItem[] = [
    { id: 'research', label: 'Research Hub', icon: BookOpen },
    { id: 'policylab', label: 'Policy Lab', icon: Sliders },
    { id: 'predictive', label: 'Predictive Analytics', icon: LineChart },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldCheck }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Drawer Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-xs bg-white h-full p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <img
                    src="/logo.jpg"
                    alt="BHOOMI SETU Emblem"
                    className="w-8 h-8 rounded-lg object-cover shadow-sm border border-slate-300"
                  />
                  <span className="font-extrabold text-slate-900 text-sm">BHOOMI SETU</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-1 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  All Platform Modules
                </p>
                {[...primaryItems, ...secondaryItems].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setShowMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-full">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center py-2 border-t border-slate-100">
              BHOOMI SETU — SIH26019 Platform
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-2 px-3 lg:hidden flex items-center justify-around shadow-lg">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center space-y-1 transition ${
                isActive ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMenu(true)}
          className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-800"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>
    </>
  );
};
