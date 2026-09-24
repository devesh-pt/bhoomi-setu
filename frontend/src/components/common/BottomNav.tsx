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
    { id: 'land_map', label: 'GIS Map', icon: Map },
    { id: 'cascading_search', label: 'Search', icon: Search },
    { id: 'highways', label: 'Highways', icon: LineChart },
    { id: 'ai_detection', label: 'Muavja', icon: Bot },
  ];

  const secondaryItems: NavItem[] = [
    { id: 'forest_impact', label: 'Forest Impact', icon: BookOpen },
    { id: 'court', label: 'Revenue Court', icon: Sliders },
    { id: 'grievances', label: 'Corrections', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Drawer Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-4/5 max-w-xs bg-slate-900 border-l border-slate-800 text-slate-100 h-full p-5 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <img
                    src="/logo.svg"
                    alt="BHOOMI SETU Emblem"
                    className="w-8 h-8 rounded-lg object-contain bg-slate-950 p-1 border border-emerald-500/30"
                  />
                  <span className="font-extrabold text-slate-100 text-sm">BHOOMI SETU</span>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80'
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

            <div className="text-[11px] text-slate-400 text-center py-2 border-t border-slate-800">
              BHOOMI SETU — SIH26019 Platform
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 py-1 px-2 lg:hidden flex items-center justify-around shadow-2xl backdrop-blur-md">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 min-h-[44px] min-w-[44px] rounded-xl transition ${
                isActive ? 'text-emerald-400 font-bold bg-emerald-950/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setShowMenu(true)}
          className="flex flex-col items-center justify-center p-1.5 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>
    </>
  );
};
