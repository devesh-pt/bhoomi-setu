import React, { useState, useEffect } from 'react';
import { Scale, Calendar, FileText, Search, ShieldAlert, Sparkles, MapPin, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface RevenueCourtViewProps {
  onNavigate?: (tab: string) => void;
  onSelectParcelId?: (parcelId: string) => void;
}

export const RevenueCourtView: React.FC<RevenueCourtViewProps> = ({ onNavigate, onSelectParcelId }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDistrict, setFilterDistrict] = useState('ALL');
  const [selectedCaseInsight, setSelectedCaseInsight] = useState<any | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    fetchCases();
  }, [filterDistrict]);

  async function fetchCases() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCourtCases(filterDistrict);
      const items = data.items || [];
      setCases(items);
      
      if (items.length > 0) {
        fetchCaseInsight(items[0].parcel_id);
      }
    } catch (err: any) {
      console.error(err);
      setError("Revenue Court service is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCaseInsight(parcelId: string) {
    setLoadingInsight(true);
    try {
      const insight = await api.getCaseInsight(parcelId);
      setSelectedCaseInsight(insight);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsight(false);
    }
  }

  const handleLinkToMap = (parcelId: string) => {
    if (onSelectParcelId) {
      onSelectParcelId(parcelId);
    }
    if (onNavigate) {
      onNavigate('land_map');
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-[calc(100dvh-4rem)] space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-sky-400" />
            <span>Revenue Court & Litigation Cases (राजस्व न्यायालय मामले)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track revenue court litigation, 5th schedule tribal Section 170-B disputes, hearing dates, and AI decision insights
          </p>
        </div>

        {/* District Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Filter District:</span>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Districts</option>
            <option value="Raipur">Raipur</option>
            <option value="Durg">Durg</option>
            <option value="Bilaspur">Bilaspur</option>
            <option value="Bastar">Bastar</option>
            <option value="Dhamtari">Dhamtari</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-5 text-rose-200 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            onClick={fetchCases}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow transition shrink-0"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* AI Case Insight Card */}
      {selectedCaseInsight && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 border border-sky-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
              <h2 className="text-sm font-extrabold text-white">
                AI Case Decision Support Insight — Parcel {selectedCaseInsight.parcel_id}
              </h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase border tracking-wider ${
              selectedCaseInsight.likelihood_band === 'High'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : selectedCaseInsight.likelihood_band === 'Medium'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {selectedCaseInsight.likelihood_band} Dispute Risk Band
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedCaseInsight.top_explanatory_factors?.map((f: any, idx: number) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-sky-300 block">Factor #{idx+1}: {f.factor}</span>
                <span className="text-[10px] text-slate-400 block">{f.direction}</span>
              </div>
            ))}
          </div>

          {/* Advisory Disclaimer */}
          <div className="bg-slate-950/90 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-200 flex items-center justify-between gap-3">
            <span>
              <strong>Disclaimer:</strong> {selectedCaseInsight.disclaimer} Advisory decision support only; never predicts judicial verdicts.
            </span>
            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
              Model: {selectedCaseInsight.model_metrics?.model_type || 'LightGBM GBDT'}
            </span>
          </div>
        </div>
      )}

      {/* Main Cases Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800 animate-pulse">
          Loading revenue court registry records for {filterDistrict}...
        </div>
      ) : cases.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
          <Scale className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-bold text-slate-300">No revenue court cases found for {filterDistrict}</p>
          <p className="text-[11px] text-slate-500">Try selecting "All Districts" or choosing a different region.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cases.map((c, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl space-y-3.5 transition flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sky-400 text-sm">{c.case_number}</span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                        DEMO DATA
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{c.court_name}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${
                    c.status?.includes('Disposed')
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Parties:</span>
                    <span className="font-semibold text-slate-200">{c.parties}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Case Category:</span>
                    <span className="font-semibold text-amber-400">{c.case_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Linked Parcel / Khasra:</span>
                    <span className="font-bold text-emerald-400">{c.khasra_no} ({c.parcel_id})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Hearing Date:</span>
                    <span className="font-bold text-sky-300">{c.next_hearing_date}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">Order Sheet Summary</span>
                  {c.order_sheet_summary}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center gap-2">
                <button
                  onClick={() => fetchCaseInsight(c.parcel_id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>AI Insight</span>
                </button>
                <button
                  onClick={() => handleLinkToMap(c.parcel_id)}
                  className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Parcel on Map</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
