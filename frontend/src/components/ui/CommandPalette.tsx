import React, { useState, useEffect } from 'react';
import { Search, Map, FileText, Scale, Bot, Layers, ShieldCheck, Moon, Sun, Globe, LogOut, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: string) => void;
  onSelectParcel?: (parcel: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectParcel,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await api.searchParcels(query).catch(() => []);
        setResults(data || []);
      } catch (err) {
        console.error('Command palette search error', err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const quickNav = [
    { id: 'land_map', label: 'Cadastral Map Portal', icon: Map, badge: 'MAP' },
    { id: 'cascading_search', label: 'Cascading Search (B-1 / P-II)', icon: Search, badge: 'SEARCH' },
    { id: 'court', label: 'Revenue Court Cases', icon: Scale, badge: 'COURT' },
    { id: 'highways', label: 'Highway Acquisition Planner', icon: Layers, badge: 'NH-53' },
    { id: 'grievances', label: 'Grievances & Record Corrections', icon: FileText, badge: 'PORTAL' },
    { id: 'admin', label: 'Admin Audit Portal', icon: ShieldCheck, badge: 'ADMIN' },
  ];

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/70 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-modal-in flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a Khasra number, owner name, or page name... (Cmd+K)"
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
            autoFocus
          />
          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 font-mono text-[10px] rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3">
          {/* Khasra Search Results */}
          {query.trim() && (
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1.5 tracking-wider">
                Matching Land Parcels ({results.length})
              </div>
              {searching ? (
                <div className="p-4 text-center text-xs text-slate-400">Searching revenue records...</div>
              ) : results.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 italic px-2">No matching parcels found for "{query}".</div>
              ) : (
                <div className="space-y-1">
                  {results.slice(0, 5).map((p) => (
                    <button
                      key={p.parcel_id}
                      onClick={() => {
                        onNavigate('land_map');
                        if (onSelectParcel) onSelectParcel(p);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-left transition flex items-center justify-between border border-slate-800/80 group"
                    >
                      <div>
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                          <span>Khasra {p.khasra_no}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({p.village}, {p.district})</span>
                        </div>
                        <div className="text-[11px] text-slate-300">
                          Owner: <strong>{p.owner_name}</strong> {p.owner_name_hi && `(${p.owner_name_hi})`}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Navigation Pages */}
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400 px-2 mb-1.5 tracking-wider">
              Quick Navigation Modules
            </div>
            <div className="space-y-1">
              {quickNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded font-mono border border-slate-700">
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
