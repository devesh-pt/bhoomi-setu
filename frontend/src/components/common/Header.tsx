import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Search,
  Wifi,
  WifiOff,
  PlayCircle,
  User as UserIcon,
  ChevronDown,
  ShieldCheck,
  Building2,
  BookOpen,
  Eye,
  LogOut,
  Database,
  Globe,
  Sun,
  Moon,
  Command
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { useDemo } from '../../context/DemoContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleNotifications: () => void;
  onOpenDatabaseAudit?: () => void;
  onOpenCommandPalette?: () => void;
  unreadCount: number;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleNotifications,
  onOpenDatabaseAudit,
  onOpenCommandPalette,
  unreadCount,
  onNavigate,
}) => {
  const { t, i18n } = useTranslation();
  const { user, logout, switchRole } = useAuth();
  const { isOffline, toggleOfflineMode } = useOffline();
  const { startDemo } = useDemo();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'official':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'researcher':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'institution':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'public':
        return <Eye className="w-4 h-4 text-slate-400" />;
      default:
        return <UserIcon className="w-4 h-4 text-purple-400" />;
    }
  };

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'official', label: 'Government Revenue Officer' },
    { role: 'researcher', label: 'Researcher / Academic' },
    { role: 'institution', label: 'Policy Institution' },
    { role: 'public', label: 'Public Citizen' },
  ];

  const displayName = user?.name ? `${user.name} (Demo User)` : 'Revenue Officer (Demo User)';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md select-none">
      {/* Left Search & Brand Mobile Tag */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <img
          src={`${(import.meta as any).env?.BASE_URL || './'}logo.svg`}
          alt="BHOOMI SETU"
          className="w-8 h-8 rounded-xl object-contain lg:hidden border border-emerald-500/30 shrink-0"
        />
        {/* Command Palette Trigger Input */}
        <button
          onClick={onOpenCommandPalette}
          className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-slate-700 transition flex items-center justify-between relative group shadow-inner"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
          <span className="truncate pr-2">Search Khasra no, owner name, or run command...</span>
          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded font-mono border border-slate-700 hidden sm:inline-flex items-center gap-0.5 shrink-0">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Demo Mode Badge */}
        {((import.meta as any).env?.VITE_DEMO_MODE === 'true' || (typeof window !== 'undefined' && window.location.hostname.includes('github.io'))) && (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-bold flex items-center gap-1.5 shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="hidden sm:inline">Demo mode - synthetic data</span>
            <span className="sm:hidden">Demo Mode</span>
          </span>
        )}
        
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
          title="Toggle Language (Hindi / English)"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="uppercase">{i18n.language || 'EN'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl transition"
          title="Toggle Dark/Light Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Launch Demo Button */}
        <button
          onClick={startDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition border border-emerald-500/40 shrink-0"
          title="Start SIH Guided Demo Mode"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Launch Demo</span>
        </button>

        {/* Offline Mode Toggle */}
        <button
          onClick={toggleOfflineMode}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            isOffline
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Toggle Offline Network Simulation"
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Online</span>
            </>
          )}
        </button>

        {/* Database Audit Log Trigger */}
        {onOpenDatabaseAudit && (
          <button
            onClick={onOpenDatabaseAudit}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition shadow-xs"
            title="Inspect Database Audit Logs"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">DB Audit</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Role Switcher & Generic User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 p-1.5 bg-slate-800/80 border border-slate-700 rounded-xl hover:bg-slate-700 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-300 text-xs overflow-hidden shrink-0">
              <UserIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="hidden md:block text-left pr-1 max-w-[140px] truncate">
              <div className="text-xs font-bold text-slate-100 leading-tight truncate">{displayName}</div>
              <div className="text-[10px] text-slate-400 font-medium capitalize flex items-center gap-1">
                {user && getRoleIcon(user.role)}
                <span className="truncate">{user?.role || 'Officer'}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Role Switcher Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-slate-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs text-slate-400 uppercase font-semibold">Switch Active Role (RBAC)</p>
              </div>
              <div className="py-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchRole(r.role);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-800 transition ${
                      user?.role === r.role ? 'bg-emerald-950/60 text-emerald-300 font-bold border-l-2 border-emerald-500' : 'text-slate-300'
                    }`}
                  >
                    {getRoleIcon(r.role)}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-1 mt-1 px-2">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    onNavigate('profile');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>View Profile & Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowRoleDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg flex items-center space-x-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
