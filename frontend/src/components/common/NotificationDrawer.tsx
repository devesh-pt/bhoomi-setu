import React from 'react';
import { X, Bell, AlertTriangle, FileText, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectProject?: (projectId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectProject,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'risk_alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'research_update':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'compensation_milestone':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'policy_simulation':
        return <Sliders className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-slate-900 text-sm">Notifications & Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (n.projectId && onSelectProject) {
                  onSelectProject(n.projectId);
                  onClose();
                }
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                n.read ? 'bg-slate-50/70 border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{n.message}</p>
                  {n.projectId && (
                    <div className="mt-2 inline-flex items-center space-x-1 text-[11px] font-bold text-blue-700 hover:underline">
                      <span>View Project Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          Real-time notification stream for land governance alerts.
        </div>
      </div>
    </div>
  );
};
