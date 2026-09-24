import React from 'react';
import { User, ShieldCheck, BookOpen, Building2, Eye, LogOut, Bookmark, Activity, Settings, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { MOCK_RESEARCH } from '../../data/mockData';

export const ProfileView: React.FC = () => {
  const { user, logout, switchRole } = useAuth();

  const savedDocs = MOCK_RESEARCH.filter((r) => user?.savedResearchIds?.includes(r.id));

  const roleOptions: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Admin / Authorized Officer', desc: 'Full admin access: add/edit land records, verify parcels, legal updates, audit logs.' },
    { role: 'user', label: 'Registered User', desc: 'Normal user portal: land search, parcel details, map view, AI assistant.' },
    { role: 'official', label: 'Government Official', desc: 'Full project monitoring, GIS, predictive analytics access.' },
    { role: 'researcher', label: 'Researcher', desc: 'Research hub, AI document summarizer, policy datasets.' },
    { role: 'institution', label: 'Institution', desc: 'Policy lab scenario workbench & comparative evaluations.' },
    { role: 'public', label: 'Public User', desc: 'Public land project transparency summaries.' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-900 text-2xl overflow-hidden shadow-xs">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name.charAt(0) || 'U'
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded uppercase">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.organization}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center space-x-2 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Role Switcher RBAC */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Role-Based Access Control (RBAC) Switcher</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch your active portal role to test feature permissions & access levels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {roleOptions.map((r) => {
            const isSelected = user?.role === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`p-4 rounded-2xl border text-left transition ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-600'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{r.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{r.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saved Research Papers */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-amber-600" />
          <span>Saved Research Papers ({savedDocs.length})</span>
        </h3>

        {savedDocs.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No research papers bookmarked yet.</div>
        ) : (
          <div className="space-y-2">
            {savedDocs.map((doc) => (
              <div key={doc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{doc.title}</h4>
                  <p className="text-[10px] text-slate-500">{doc.organization} ({doc.year})</p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {doc.documentType}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
