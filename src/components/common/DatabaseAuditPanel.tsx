import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, Terminal, X } from 'lucide-react';
import { BhoomiService } from '../../services/api';
import { AdminAuditLog } from '../../types';

interface DatabaseAuditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const DatabaseAuditPanel: React.FC<DatabaseAuditPanelProps> = ({ isOpen, onClose, onRefreshData }) => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = async () => {
    const l = await BhoomiService.getAdminAuditLogs();
    setLogs(l);
  };

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = BhoomiService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomi_setu_database_dump_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the local database to the initial SIH 2026 dataset?")) {
      BhoomiService.resetDatabase();
      loadLogs();
      if (onRefreshData) onRefreshData();
      alert("Database successfully reset!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0f172a] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>PostgreSQL / PostGIS Database Inspection</span>
                <span className="text-[9px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/50 font-mono rounded">
                  In-Browser Engine
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live query audit log, schema inspector & database export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Quick Actions Bar */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">Status: Active & Synchronized</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export DB JSON Dump</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Seed Data</span>
            </button>
          </div>
        </div>

        {/* Audit Log Stream Terminal */}
        <div className="p-5 flex-1 overflow-y-auto font-mono text-xs space-y-2.5 bg-[#0b1329]">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold pb-1 border-b border-slate-800 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span>Database Query Audit Logs ({logs.length} Operations)</span>
          </div>

          {logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-950 text-blue-300 border border-blue-700/50">
                    {log.action}
                  </span>
                  <span className="text-slate-400 font-bold">{log.adminName}</span>
                </div>
                <span className="text-[10px] text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                Parcel <strong>{log.parcelId}</strong>: {log.fieldName} ({log.oldValue} → {log.newValue})
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-center text-[10px] text-slate-400">
          PostgreSQL / PostGIS compatible database layer running locally for SIH 2026 demonstration.
        </div>
      </div>
    </div>
  );
};
