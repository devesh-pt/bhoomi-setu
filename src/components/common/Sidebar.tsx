import React from 'react';
import {
  LayoutDashboard,
  Map,
  Search,
  BookOpen,
  Sliders,
  Bot,
  LineChart,
  FolderKanban,
  Bell,
  User,
  Shield,
  Sparkles,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate, unreadCount }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'official';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Land Search', icon: Search, badge: 'SEARCH' },
    { id: 'gis', label: 'Land Intelligence', icon: Map, badge: 'GIS' },
    { id: 'research', label: 'Research Hub', icon: BookOpen },
    { id: 'policylab', label: 'Policy Lab', icon: Sliders },
    { id: 'ai', label: 'BHOOMI AI', icon: Bot, badge: 'RAG' },
    { id: 'predictive', label: 'Predictive Analytics', icon: LineChart, badge: 'ML' },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Portal', icon: ShieldCheck, badge: 'ADMIN' }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0f2942] text-white border-r border-slate-800 shrink-0 min-h-screen select-none">
      {/* Platform Header / Logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <img
          src="/logo.jpg"
          alt="BHOOMI SETU Emblem"
          className="w-10 h-10 rounded-xl object-cover shadow-lg border border-emerald-500/30"
        />
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">
            BHOOMI SETU
          </h1>
          <p className="text-[10px] text-emerald-400 font-medium tracking-wide mt-1">
            National Land Governance Platform
          </p>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-300 capitalize">{user?.role} Portal</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 bg-emerald-900/50 text-emerald-300 rounded font-bold border border-emerald-700/50">
          SIH 2026
        </span>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : item.badge === 'ADMIN'
                      ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-full font-bold">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Prototype Footer Banner */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIH26019 Platform</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Evidence-driven land governance & decision support system.
          </p>
        </div>
      </div>
    </aside>
  );
};
