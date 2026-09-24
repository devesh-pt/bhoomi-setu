import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation, Route, Sliders, ShieldCheck, ArrowRight, BarChart3, TrendingDown, Layers } from 'lucide-react';
import { api } from '../../services/api';

export const HighwaysModule: React.FC = () => {
  const { t } = useTranslation();
  const [highways, setHighways] = useState<any[]>([]);
  const [selectedHighwayId, setSelectedHighwayId] = useState<string>('NH-46');
  const [bufferMeters, setBufferMeters] = useState<number>(45);
  const [impactData, setImpactData] = useState<any | null>(null);
  const [routeSuggestion, setRouteSuggestion] = useState<any | null>(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    loadHighways();
  }, []);

  useEffect(() => {
    if (selectedHighwayId) {
      calculateImpact();
    }
  }, [selectedHighwayId, bufferMeters]);

  const loadHighways = async () => {
    try {
      const data = await api.getHighways();
      const list = Array.isArray(data) ? data : data?.items || [];
      setHighways(list);
      if (list.length > 0) {
        setSelectedHighwayId(list[0].id || list[0].highway_id);
      }
    } catch (err) {
      console.error('Failed to load highways', err);
    }
  };

  const calculateImpact = async () => {
    setLoadingImpact(true);
    try {
      const res = await api.calculateHighwayImpact(selectedHighwayId, bufferMeters);
      setImpactData(res);
    } catch (err) {
      console.error('Impact calculation error', err);
    } finally {
      setLoadingImpact(false);
    }
  };

  const handleSuggestBanjarRoute = async () => {
    setLoadingRoute(true);
    try {
      const res = await api.suggestRoute({
        start_lat: 22.67,
        start_lng: 77.12,
        end_lat: 22.83,
        end_lng: 77.38,
        optimize_for_banjar: true
      });
      setRouteSuggestion(res);
    } catch (err) {
      console.error('Route suggestion error', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-[calc(100dvh-4rem)] space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Route className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {t('highways.title')}
            </h1>
            <p className="text-xs text-slate-400">
              Interactive corridor buffer analysis & cost-surface least-cost path routing
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Highway Selector */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
              Select Highway Corridor
            </label>
            <select
              value={selectedHighwayId}
              onChange={(e) => setSelectedHighwayId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {(Array.isArray(highways) ? highways : []).map((hw) => (
                <option key={hw.id || hw.highway_id} value={hw.id || hw.highway_id}>
                  {hw.name} ({hw.code || hw.id})
                </option>
              ))}
            </select>
          </div>

          {/* Buffer Slider */}
          <div className="min-w-[180px]">
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold mb-1">
              <span>Right-of-Way Buffer</span>
              <span className="text-emerald-400 font-bold">{bufferMeters} meters</span>
            </div>
            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={bufferMeters}
              onChange={(e) => setBufferMeters(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Impact Grid */}
      {impactData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Summary Stat Card 1: Total Intersected Parcels */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Intersected Parcels</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-white">
                {impactData.total_intersected_parcels}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {impactData.total_affected_area_ha} ha Total
              </span>
            </div>
          </div>

          {/* Summary Stat Card 2: Fertile Land Impact */}
          <div className="bg-slate-900 border border-rose-500/30 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <span className="text-xs text-rose-300 font-medium flex items-center justify-between">
              Fertile Farmland Impact <span>🌾</span>
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-rose-400">
                {impactData.fertile_land_ha} ha
              </span>
              <span className="text-xs text-rose-300">
                High NDVI / Irrigated
              </span>
            </div>
          </div>

          {/* Summary Stat Card 3: Banjar Jamin Utilisation */}
          <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
            <span className="text-xs text-amber-300 font-medium flex items-center justify-between">
              Banjar Jamin (Barren) <span>🟡</span>
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-extrabold text-amber-400">
                {impactData.banjar_land_ha} ha
              </span>
              <span className="text-xs text-amber-300">
                Low Crop Value
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Breakdown & Least-Cost Route Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Land Classification Breakdown Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Affected Land Type Breakdown ({bufferMeters}m Buffer)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Land Type</th>
                  <th className="p-2.5">Parcels</th>
                  <th className="p-2.5">Area (ha)</th>
                  <th className="p-2.5 rounded-r-lg">Share %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {impactData?.breakdown?.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-2.5 font-medium text-white flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.is_fertile ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {row.land_type_name_en}
                    </td>
                    <td className="p-2.5">{row.parcel_count}</td>
                    <td className="p-2.5 font-bold">{row.total_area_ha} ha</td>
                    <td className="p-2.5 text-slate-400">{row.percentage_area}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Least-Cost Banjar Route Optimizer */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" /> Cost-Surface Banjar Route Optimizer
              </h2>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold rounded-full">
                scikit-image / networkx
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Computes optimal highway alignment by penalising fertile farmland, forest canopy, and water bodies while steering through barren banjar land.
            </p>
          </div>

          {routeSuggestion ? (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Fertile Farmland Saved</span>
                  <span className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> {routeSuggestion.fertile_land_saved_ha} ha
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400 block text-[10px]">Estimated Cost Reduction</span>
                  <span className="text-base font-extrabold text-amber-400">
                    ₹{routeSuggestion.estimated_cost_reduction_lakhs} Lakhs
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 border-t border-slate-700/60 pt-2">
                <div className="flex justify-between">
                  <span>Direct Corridor Distance:</span>
                  <span className="font-semibold text-white">{routeSuggestion.direct_distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Banjar-Optimized Route Distance:</span>
                  <span className="font-semibold text-emerald-400">{routeSuggestion.suggested_distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Forest Area Avoided:</span>
                  <span className="font-semibold text-green-400">{routeSuggestion.forest_area_avoided_ha} ha</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
              Click below to calculate an optimal alignment avoiding fertile land.
            </div>
          )}

          <button
            onClick={handleSuggestBanjarRoute}
            disabled={loadingRoute}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
          >
            {loadingRoute ? 'Computing Least-Cost Surface...' : t('highways.suggest_route')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
