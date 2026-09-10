import React, { useState } from 'react';
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
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { useDemo } from '../../context/DemoContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleNotifications: () => void;
  onOpenDatabaseAudit?: () => void;
  unreadCount: number;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleNotifications,
  onOpenDatabaseAudit,
  unreadCount,
  onNavigate,
}) => {
  const { user, logout, switchRole } = useAuth();
  const { isOffline, toggleOfflineMode } = useOffline();
  const { startDemo } = useDemo();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'official':
        return <ShieldCheck className="w-4 h-4 text-blue-600" />;
      case 'researcher':
        return <BookOpen className="w-4 h-4 text-emerald-600" />;
      case 'institution':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'public':
        return <Eye className="w-4 h-4 text-slate-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-purple-600" />;
    }
  };

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'official', label: 'Government Official' },
    { role: 'researcher', label: 'Researcher / Academic' },
    { role: 'institution', label: 'Policy Institution' },
    { role: 'public', label: 'Public User' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 py-3 flex items-[#center] justify-between shadow-sm">
      {/* Left Search & Brand Mobile Tag */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, research papers, state land data..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onNavigate('research');
              }
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Launch Demo Button */}
        <button
          onClick={startDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs sm:text-sm font-semibold shadow hover:from-emerald-700 hover:to-teal-700 transition"
          title="Start 3-5 Minute SIH Jury Guided Demo"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch Demo</span>
        </button>

        {/* Offline Mode Toggle */}
        <button
          onClick={toggleOfflineMode}
          className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition ${
            isOffline
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle Offline Network Simulation"
        >
          {isOffline ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Online</span>
            </>
          )}
        </button>

        {/* Database Audit Log Trigger */}
        {onOpenDatabaseAudit && (
          <button
            onClick={onOpenDatabaseAudit}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-[#0f172a] text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition shadow-xs"
            title="Inspect PostgreSQL/PostGIS Database Audit Logs"
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">DB Audit</span>
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Role Switcher & Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center space-x-2 p-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-900 text-xs overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden md:block text-left pr-1">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[10px] text-slate-500 font-medium capitalize flex items-center gap-1">
                {user && getRoleIcon(user.role)}
                <span>{user?.role}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Dropdown Menu */}
          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
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
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 transition ${
                      user?.role === r.role ? 'bg-blue-50/70 text-blue-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {getRoleIcon(r.role)}
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                <button
                  onClick={() => {
                    setShowRoleDropdown(false);
                    onNavigate('profile');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center space-x-2"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>View Profile & Settings</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowRoleDropdown(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2 font-medium"
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
