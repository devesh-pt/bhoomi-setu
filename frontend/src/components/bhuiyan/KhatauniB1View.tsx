import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ShieldCheck, User, MapPin, IndianRupee, Layers } from 'lucide-react';
import { api } from '../../services/api';

interface KhatauniB1ViewProps {
  isOpen: boolean;
  onClose: () => void;
  khataNo: string;
  district?: string;
}

export const KhatauniB1View: React.FC<KhatauniB1ViewProps> = ({
  isOpen,
  onClose,
  khataNo,
  district = 'Raipur'
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && khataNo) {
      setLoading(true);
      api.getKhatauniB1Data(khataNo, district)
        .then((resData) => setData(resData))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, khataNo, district]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const firstPlot = data?.plots?.[0]?.parcel_id || 'CG-RAI-0001';
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/generate?parcel_id=${firstPlot}&cert_type=B1_KHATAUNI&issued_to=Citizen`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Signed_B1_Khatauni_${khataNo}.pdf`;
      a.click();
    } catch (err) {
      console.error("Failed to download B-1 PDF certificate", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex flex-wrap items-center gap-2">
                <span>Khatauni (B-1) Land Record Extract</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] rounded-full uppercase font-bold">
                  Bhuiyan Form B-1
                </span>
                <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-full uppercase">
                  Demo Data - synthetic record, not an official document
                </span>
              </h2>
              <p className="text-xs text-slate-400">Account Khatauni Number: <strong>{khataNo}</strong> | District {district}, Chhattisgarh</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Fetching authenticated B-1 Khatauni ledger record...
          </div>
        ) : data ? (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-xs">
                <span className="text-slate-400">Total Plots Held:</span> <strong className="text-white mr-3">{data.total_plots}</strong>
                <span className="text-slate-400">Total Khata Area:</span> <strong className="text-emerald-400 font-mono mr-3">{data.total_area_hectares} ha</strong>
                <span className="text-slate-400">Annual Land Revenue:</span> <strong className="text-amber-400 font-mono">₹{data.annual_land_revenue_inr}</strong>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Generating PDF...' : 'Download Digitally Signed B-1 Extract'}</span>
              </button>
            </div>

            {/* Bhumiswami Owner(s) Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-400" />
                <span>1. Recorded Land Owners (Bhumiswami - भूमिस्वामी विवरण)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="p-3">Bhumiswami Name</th>
                      <th className="p-3">Father / Husband Name</th>
                      <th className="p-3">Share (%)</th>
                      <th className="p-3">Caste Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {data.recorded_owners?.map((o: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-emerald-300">{o.name}</td>
                        <td className="p-3 text-slate-200">{o.father_husband_name}</td>
                        <td className="p-3 font-mono font-bold text-white">{o.share_percentage}%</td>
                        <td className="p-3 text-slate-400">{o.caste_category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plots Held Table */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>2. Parcels / Khasra Plots Under Khata (खसरा विवरण)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="p-3">Khasra No</th>
                      <th className="p-3">Area (Hectares)</th>
                      <th className="p-3">Land Classification</th>
                      <th className="p-3">Soil Type</th>
                      <th className="p-3">Circle Rate (₹/ha)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {data.plots?.map((p: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-white">{p.khasra_no}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">{p.area_hectares} ha</td>
                        <td className="p-3 uppercase font-semibold text-slate-200">{p.land_type}</td>
                        <td className="p-3 text-slate-300">{p.soil_type}</td>
                        <td className="p-3 font-bold text-amber-400">₹{p.circle_rate} Lakhs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rights & Remarks Box */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
              <span className="font-bold text-slate-300 block">3. Encumbrances, Mortgages & Rights (अन्य अधिकार एवं अभ्युक्ति)</span>
              <p className="text-slate-400 leading-relaxed italic">{data.rights_and_encumbrances}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
