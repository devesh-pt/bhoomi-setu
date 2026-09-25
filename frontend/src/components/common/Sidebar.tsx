import React, { useState } from 'react';
import {
  Map,
  Search,
  User,
  Shield,
  Sparkles,
  HelpCircle,
  Scale,
  PanelLeftClose,
  PanelLeftOpen,
  Route,
  Trees,
  Layers,
  Bot,
  FolderKanban,
  FileText,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  unreadCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  isCollapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) onToggleCollapse();
    else setInternalCollapsed(!internalCollapsed);
  };

  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
    count?: number;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers, badge: 'HOME' },
    { id: 'land_map', label: 'Bhu-Naksha GIS Map', icon: Map, badge: 'GIS' },
    { id: 'cascading_search', label: 'Land Search', icon: Search, badge: 'SEARCH' },
    { id: 'highways', label: 'Highways Corridor', icon: Route, badge: 'HIGHWAYS' },
    { id: 'muavja', label: 'Muavja & Ready-Map', icon: Sparkles, badge: 'MUAVJA' },
    { id: 'forest_impact', label: 'Forest Impact', icon: Trees, badge: 'FOREST' },
    { id: 'grievances', label: 'Record Corrections', icon: HelpCircle },
    { id: 'court', label: 'Revenue Court', icon: Scale },
    { id: 'predictive', label: 'Risk Predictor', icon: Sparkles, badge: 'AI' },
    { id: 'bhoomi_ai', label: 'Ask Bhoomi AI', icon: Bot, badge: 'ASSIST' },
    { id: 'projects', label: 'Projects Directory', icon: FolderKanban },
    { id: 'research', label: 'Research Hub', icon: FileText },
    { id: 'policy', label: 'Policy Lab', icon: Sliders },
    { id: 'admin', label: 'Admin Management', icon: ShieldCheck, badge: 'ADMIN' },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#0f2942] text-white border-r border-slate-800 shrink-0 min-h-screen select-none transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Platform Header / Logo */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <img
            src={`${(import.meta as any).env?.BASE_URL || './'}logo.png`}
            alt="BHOOMI SETU Emblem"
            className="w-9 h-9 rounded-xl object-contain bg-slate-900 p-0.5 border border-emerald-500/30 shrink-0"
            onError={(e: any) => { e.target.src = `${(import.meta as any).env?.BASE_URL || './'}logo.svg`; }}
          />
          {!isCollapsed && (
            <div className="whitespace-nowrap overflow-hidden">
              <h1 className="font-extrabold text-base tracking-tight text-white leading-none truncate">
                BHOOMI SETU
              </h1>
              <p className="text-[9px] text-emerald-400 font-medium tracking-wide mt-1 truncate">
                National Platform
              </p>
            </div>
          )}
        </div>

        <button
          onClick={toggleCollapse}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-emerald-400" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Badge Indicator */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 capitalize truncate">{user?.role || 'Officer'} Portal</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-900/50 text-emerald-300 rounded font-bold border border-emerald-700/50 shrink-0">
            SIH 2026
          </span>
        </div>
      )}

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
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </div>

              {item.badge && !isCollapsed && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ml-1 ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Prototype Footer Banner */}
      {!isCollapsed && (
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
      )}
    </aside>
  );
};
