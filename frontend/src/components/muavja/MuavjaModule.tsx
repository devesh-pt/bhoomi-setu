import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet, Download, FileText, Sparkles, CheckCircle2, ShieldAlert, Cpu, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../ui/ToastContext';

export const MuavjaModule: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [parcels, setParcels] = useState<any[]>([]);
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [compensationData, setCompensationData] = useState<any | null>(null);
  const [mlMetrics, setMlMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    loadSampleParcels();
    fetchMlMetrics();
  }, []);

  const loadSampleParcels = async () => {
    try {
      const data = await api.getParcels({ size: 15 });
      const items = data.items || [];
      setParcels(items);
      const initialIds = items.slice(0, 8).map((p: any) => p.parcel_id);
      setSelectedParcelIds(initialIds);
      calculateCompensation(initialIds);
    } catch (err) {
      console.error('Failed to load parcels', err);
    }
  };

  const fetchMlMetrics = async () => {
    try {
      const data = await api.getMuavjaMetrics();
      setMlMetrics(data);
    } catch (err) {
      console.error('Failed to fetch ML metrics', err);
    }
  };

  const calculateCompensation = async (ids: string[]) => {
    setLoading(true);
    try {
      const data = await api.estimateMuavja(ids, 2.0);
      setCompensationData(data);
    } catch (err) {
      console.error('Compensation calculation failed', err);
      showToast('Failed to calculate compensation estimate.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleParcel = (parcelId: string) => {
    const updated = selectedParcelIds.includes(parcelId)
      ? selectedParcelIds.filter((id) => id !== parcelId)
      : [...selectedParcelIds, parcelId];
    setSelectedParcelIds(updated);
    calculateCompensation(updated);
  };

  const handleExcelExport = async () => {
    setExportingExcel(true);
    showToast("Generating Muavja Excel Compensation Sheet...", "info");
    try {
      await api.exportReadyMapExcel(selectedParcelIds);
      showToast("Excel Compensation Sheet downloaded successfully!", "success");
    } catch (err) {
      console.error('Excel export failed', err);
      showToast("Excel export failed. Please retry.", "error");
    } finally {
      setExportingExcel(false);
    }
  };

  const handlePdfExport = async () => {
    setExportingPdf(true);
    showToast("Generating Muavja Compensation Audit PDF...", "info");
    try {
      await api.exportMuavjaPDF(selectedParcelIds);
      showToast("Muavja PDF downloaded successfully!", "success");
    } catch (err) {
      console.error('PDF export failed', err);
      showToast("PDF export failed. Please retry.", "error");
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-[calc(100dvh-4rem)] space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {t('muavja.title')}
            </h1>
            <p className="text-xs text-slate-400">
              RFCTLARR Act 2013 Land Acquisition Compensation Calculator & Ready-Map Audit Exporter
            </p>
          </div>
        </div>

        {/* Ready-Map Export Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExcelExport}
            disabled={exportingExcel || selectedParcelIds.length === 0}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 transition"
          >
            {exportingExcel ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePdfExport}
            disabled={exportingPdf || selectedParcelIds.length === 0}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-2 transition"
          >
            {exportingPdf ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* ML Land Detection Model Metrics Banner (P0-7) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">
              {mlMetrics?.trained ? (mlMetrics.model_name || 'Sentinel-2 Multi-Spectral Classifier') : 'Land Cover Classifier'}
            </span>
            <span className="text-slate-400 text-[11px]">
              Dataset: {mlMetrics?.trained ? mlMetrics.dataset : 'Sentinel-2 Patches'} | Version: {mlMetrics?.trained ? mlMetrics.model_version : 'v1.0.0'} | Training Date: {mlMetrics?.trained ? mlMetrics.training_date : '2026-09-24'}
            </span>
          </div>
        </div>

        {mlMetrics?.trained ? (
          <div className="flex items-center gap-4 text-right">
            <div>
              <span className="text-slate-400 text-[10px] block">Overall Accuracy</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                {(mlMetrics.accuracy * 100).toFixed(1)}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Weighted F1 Score</span>
              <span className="font-mono font-extrabold text-sky-400 text-sm">
                {(mlMetrics.f1_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold uppercase tracking-wide">
            Status: not trained
          </span>
        )}
      </div>

      {/* Main Compensation Summary Cards */}
      {compensationData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 text-[11px]">Selected Parcels</span>
            <span className="block text-2xl font-extrabold text-white mt-1">
              {compensationData.total_parcels}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 text-[11px]">Total Land Area</span>
            <span className="block text-2xl font-extrabold text-white mt-1">
              {compensationData.total_affected_area_ha} ha
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-slate-400 text-[11px]">100% Solatium Amount</span>
            <span className="block text-2xl font-extrabold text-emerald-400 mt-1">
              ₹{compensationData.total_solatium_lakhs} Lakhs
            </span>
          </div>

          <div className="bg-gradient-to-br from-emerald-950 to-slate-900 border border-emerald-500/40 p-4 rounded-xl">
            <span className="text-emerald-300 font-semibold text-[11px]">Grand Total Muavja</span>
            <span className="block text-2xl font-extrabold text-emerald-400 mt-1">
              ₹{compensationData.grand_total_muavja_lakhs} Lakhs
            </span>
          </div>
        </div>
      )}

      {/* Audit Sheet Table (All Audit Columns Present - P0-6) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Khasra Compensation (Muavja) Audit Breakdown Sheet
          </h2>
          <span className="text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
            *Location Multipliers are illustrative - verify with state rules (RFCTLARR Sec 26(2))
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-700">
              <tr>
                <th className="p-2.5">Select</th>
                <th className="p-2.5">Khasra No</th>
                <th className="p-2.5">Recorded Owner</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Area (ha)</th>
                <th className="p-2.5">Base Rate (L/ha)</th>
                <th className="p-2.5">Market Value (L)</th>
                <th className="p-2.5">Multiplier*</th>
                <th className="p-2.5">Multiplied Val (L)</th>
                <th className="p-2.5">Solatium 100% (L)</th>
                <th className="p-2.5">Assets & Crop (L)</th>
                <th className="p-2.5">Total Muavja (Lakhs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(compensationData?.parcels_breakdown || compensationData?.breakdown || [])?.map((p: any) => (
                <tr key={p.parcel_id} className="hover:bg-slate-800/40 transition">
                  <td className="p-2.5">
                    <input
                      type="checkbox"
                      checked={selectedParcelIds.includes(p.parcel_id)}
                      onChange={() => handleToggleParcel(p.parcel_id)}
                      className="accent-emerald-500 rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-2.5 font-bold text-white">{p.khasra_no}</td>
                  <td className="p-2.5">
                    {p.owner_name}{' '}
                    {p.is_synthetic && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded ml-1">
                        Demo Data
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-medium">{p.land_type}</td>
                  <td className="p-2.5">{p.area_ha} ha</td>
                  <td className="p-2.5">₹{p.base_market_rate_per_ha_lakhs}</td>
                  <td className="p-2.5">₹{p.base_market_value_lakhs}</td>
                  <td className="p-2.5 font-bold text-sky-400">{p.location_multiplier}x</td>
                  <td className="p-2.5 font-bold text-slate-100">₹{p.multiplied_market_value_lakhs}</td>
                  <td className="p-2.5 text-emerald-400">₹{p.solatium_amount_lakhs}</td>
                  <td className="p-2.5 text-amber-300">₹{p.asset_crop_allowance_lakhs}</td>
                  <td className="p-2.5 font-extrabold text-emerald-400">₹{p.total_muavja_lakhs} Lakhs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
