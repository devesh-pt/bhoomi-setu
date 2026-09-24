import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X, User, MapPin, Scale, AlertCircle, Info, ShieldCheck, Sparkles, ExternalLink,
  FileText, Download, Layers, ShieldAlert, CheckCircle2, Building, Layers3
} from 'lucide-react';
import { api } from '../../services/api';
import { ModelMetricsModal } from '../ml/ModelMetricsModal';

interface ParcelDetailPanelProps {
  parcel: any | null;
  onClose: () => void;
  onCompare?: (parcel: any) => void;
  onReportIssue?: (parcel: any) => void;
}

export const ParcelDetailPanel: React.FC<ParcelDetailPanelProps> = ({
  parcel,
  onClose,
  onCompare,
  onReportIssue
}) => {
  const { t } = useTranslation();
  const [insight, setInsight] = useState<any | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [showModelMetrics, setShowModelMetrics] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (parcel) {
      setLoadingInsight(true);
      api.getCaseInsight(parcel.parcel_id)
        .then((data) => setInsight(data))
        .catch(() => setInsight(null))
        .finally(() => setLoadingInsight(false));
    }
  }, [parcel]);

  if (!parcel) return null;

  const getLandTypeColor = (type: string) => {
    switch (type) {
      case 'IRRIGATED': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'RAIN_FED': return 'bg-lime-500/20 text-lime-300 border-lime-500/30';
      case 'BANJAR': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'FOREST': return 'bg-green-700/30 text-green-300 border-green-600/40';
      case 'RESIDENTIAL': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'COMMERCIAL': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getRiskBandBadge = (band: string) => {
    if (band === 'High') return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (band === 'Medium') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await api.downloadParcelPDF(parcel.parcel_id, parcel.khasra_no);
    } catch (err) {
      console.error("PDF report download failed", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const areaSqm = parcel.area_sqm || Math.round(parcel.area_hectares * 10000);
  const totalMarketValLakhs = (parcel.area_hectares * (parcel.market_value_per_ha || 15)).toFixed(2);

  return (
    <>
      <div className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-800 shadow-2xl z-40 flex flex-col text-slate-100 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <MapPin className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Khasra {parcel.khasra_no}
              </h2>
              <p className="text-xs text-slate-400">
                {parcel.village}, Tehsil {parcel.tehsil || parcel.district}, {parcel.district} (CG)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Demo Data Banner */}
          <div className="px-3 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] font-semibold flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Data (Synthetic CG Parcel)</span>
            </span>
            <span className="font-mono text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
              {parcel.data_source || 'synthetic_demo'}
            </span>
          </div>

          {/* 5th Schedule Tribal Sensitivity Indicator */}
          {parcel.tribal_sensitive && (
            <div className="px-3 py-2 bg-purple-950/80 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-semibold flex items-start gap-2 shadow-sm">
              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-300 block">5th Schedule Tribal Land</span>
                <span className="text-[10px] text-purple-300/80 leading-tight block mt-0.5">
                  Transfer restricted under Sec 170-B of CG Land Revenue Code 1959. Requires Collector approval.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="py-2 px-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1 shadow transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadingPdf ? 'Exporting...' : 'PDF Report'}</span>
            </button>
            <button
              onClick={() => onCompare?.(parcel)}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1 shadow transition"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Compare</span>
            </button>
            <button
              onClick={() => onReportIssue && onReportIssue(parcel)}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl font-semibold text-[11px] flex items-center justify-center gap-1 shadow transition"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Report Issue</span>
            </button>
          </div>

          {/* Owner & Khata Information Card */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">Bhuiyan Ownership Info</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-medium">
                <CheckCircle2 className="w-3 h-3" /> Verified Record
              </span>
            </div>
            <div className="space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Khata / Khatauni No:</span>
                <span className="font-mono font-bold text-white">{parcel.khata_no || 'KH-104'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Recorded Owner:</span>
                <div className="text-right">
                  <span className="font-bold text-emerald-300 block">{parcel.owner_name}</span>
                  {parcel.owner_name_hi && (
                    <span className="text-[11px] text-amber-300/90 font-sans font-medium block">
                      {parcel.owner_name_hi}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Father / Husband:</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-200 block">{parcel.father_name || 'N/A'}</span>
                  {parcel.father_name_hi && (
                    <span className="text-[11px] text-slate-400 block font-sans">
                      {parcel.father_name_hi}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-700/50">
                <span className="text-slate-400">Location (Devanagari):</span>
                <span className="text-slate-300 font-sans">
                  {parcel.village_hi || parcel.village}, {parcel.tehsil_hi || parcel.tehsil || parcel.district}
                </span>
              </div>
            </div>
          </div>

          {/* Key Cadastral Details Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Land Category</span>
              <span className={`inline-block px-2 py-0.5 rounded border text-[11px] font-semibold ${getLandTypeColor(parcel.land_type)}`}>
                {parcel.land_type}
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Tehsil / District</span>
              <span className="font-bold text-slate-100 text-xs">
                {parcel.tehsil || parcel.district}, {parcel.district}
              </span>
            </div>
          </div>

          {/* Proximity & Infrastructure Intelligence */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 block">
              📍 Geospatial Proximity Intelligence
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Highway Proximity</span>
                <span className="font-bold text-sky-400 text-xs">
                  {parcel.highway_distance_km ?? parcel.nearest_highway_dist_km ?? 1.2} km
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {parcel.nearest_highway || 'NH-53 Corridor'}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-slate-400 text-[10px] block">Forest Distance</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {parcel.forest_distance_km ?? parcel.forest_proximity_km ?? 0.8} km
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {parcel.land_type === 'FOREST' ? 'Forest Reserve' : 'Clear Zone'}
                </span>
              </div>
            </div>
          </div>

          {/* Area & Size Breakdown */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
              <span>📐 Cadastral Land Measurement</span>
              <span className="font-mono text-emerald-400 text-xs">{areaSqm.toLocaleString()} sq.m</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="block text-slate-400 text-[10px]">Hectares</span>
                <span className="font-bold text-emerald-400 text-xs">{parcel.area_hectares} ha</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="block text-slate-400 text-[10px]">Acres</span>
                <span className="font-bold text-slate-200 text-xs">{parcel.area_acres} ac</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="block text-slate-400 text-[10px]">Bigha</span>
                <span className="font-bold text-slate-200 text-xs">{parcel.area_bigha} bigha</span>
              </div>
            </div>
          </div>

          {/* Agricultural & Value Attributes */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300 block mb-1">
              🌾 Land Valuation & Circle Rates
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Soil Type</span>
                <span className="font-medium text-slate-200">{parcel.soil_type || 'Matasi / Black Soil'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Irrigation Source</span>
                <span className="font-medium text-slate-200">{parcel.irrigation_source || 'Mahanadi Canal'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Circle Rate (₹/ha)</span>
                <span className="font-bold text-amber-400">₹{parcel.market_value_per_ha || parcel.circle_rate || 15} Lakhs</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Est. Market Value</span>
                <span className="font-bold text-emerald-400">₹{totalMarketValLakhs} Lakhs</span>
              </div>
            </div>
          </div>

          {/* Encumbrance, Mutation & Litigation Status */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 block">
              ⚖️ Mutation & Legal Record Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Mutation Status</span>
                <span className="font-semibold text-emerald-400 text-xs">{parcel.mutation_status || 'Mutated'}</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                <span className="text-[10px] text-slate-400 block">Litigation Status</span>
                <span className={`font-semibold text-xs ${
                  (parcel.litigation_status || parcel.case_status) === 'pending'
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}>
                  {parcel.litigation_status || parcel.case_status || 'No dispute'}
                </span>
              </div>
            </div>
          </div>


          {/* Land Case & Dispute Status */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-sky-400" /> Revenue Court Case Status
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                parcel.case_status === 'pending'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : parcel.case_status === 'disposed'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {parcel.case_status}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed pt-1">
              {parcel.case_details || 'No active boundary or title dispute in Revenue Court.'}
            </p>
          </div>

          {/* AI Case Insight Card */}
          <div className="bg-gradient-to-b from-slate-800/90 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300 text-xs">{t('parcel_detail.ai_insight_title')}</span>
              </div>
              <button
                onClick={() => setShowModelMetrics(true)}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
              >
                {t('parcel_detail.about_model')} <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            {loadingInsight ? (
              <div className="py-4 text-center text-slate-400 text-xs">
                Analyzing court precedents & revenue records...
              </div>
            ) : insight ? (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-300 font-medium">Claimant Favor Likelihood:</span>
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getRiskBandBadge(insight.likelihood_band)}`}>
                    {insight.likelihood_band} ({insight.likelihood_percentage}%)
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                    Top 3 Explanatory Factors (SHAP Explainer):
                  </span>
                  <div className="space-y-1.5">
                    {insight.top_explanatory_factors?.map((f: any, idx: number) => (
                      <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800 text-[11px]">
                        <div className="flex justify-between text-slate-200 font-medium">
                          <span>{idx + 1}. {f.factor}</span>
                          <span className="text-emerald-400 font-mono">{(f.weight * 100).toFixed(0)}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 italic block mt-0.5">
                          Impact: {f.direction}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/30 text-[10px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{insight.disclaimer}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ModelMetricsModal
        isOpen={showModelMetrics}
        onClose={() => setShowModelMetrics(false)}
        metrics={insight?.model_metrics}
      />
    </>
  );
};
