import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, FileText, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';
import { NotificationItem } from '../../types';
import { BhoomiService } from '../../services/api';

interface NotificationsViewProps {
  onSelectProject: (projectId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onSelectProject }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const list = await BhoomiService.getNotifications();
    setNotifications(list);
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'risk_alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'research_update':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'compensation_milestone':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'policy_simulation':
        return <Sliders className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
            <Bell className="w-4 h-4" />
            <span>Real-time Alerts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Notification Center</h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => {
              if (n.projectId) onSelectProject(n.projectId);
            }}
            className={`p-5 rounded-3xl border transition cursor-pointer ${
              n.read ? 'bg-white border-slate-200' : 'bg-blue-50/60 border-blue-200 shadow-xs'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs shrink-0">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                  <span className="text-xs text-slate-400 font-medium">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                {n.projectId && (
                  <div className="mt-3 inline-flex items-center space-x-1 text-xs font-bold text-blue-700 hover:underline">
                    <span>Inspect Affected Project</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
