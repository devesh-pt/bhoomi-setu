import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ShieldCheck, MapPin, Trees, Droplet, User, Calendar } from 'lucide-react';

interface KhasraPIIViewProps {
  isOpen: boolean;
  onClose: () => void;
  parcelId: string;
}

export const KhasraPIIView: React.FC<KhasraPIIViewProps> = ({
  isOpen,
  onClose,
  parcelId
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && parcelId) {
      setLoading(true);
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      fetch(`${API_BASE_URL}/api/v1/land/pii/${parcelId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
        .then((res) => res.json())
        .then((resData) => setData(resData))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, parcelId]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/v1/certificates/generate?parcel_id=${parcelId}&cert_type=PII_KHASRA&issued_to=Citizen`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Signed_PII_Khasra_${data?.khasra_no || parcelId}.pdf`;
      a.click();
    } catch (err) {
      console.error("Failed to download P-II PDF certificate", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Khasra (P-II) Plot Details Extract</span>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] rounded-full uppercase">
                  Form P-II
                </span>
              </h2>
              <p className="text-xs text-slate-400">Parcel ID: <strong>{parcelId}</strong> | Chhattisgarh Cadastral Survey</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Fetching authenticated P-II Khasra survey details...
          </div>
        ) : data ? (
          <div className="space-y-4 overflow-y-auto pr-1 text-xs">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div>
                <span className="text-slate-400">Khasra Number:</span> <strong className="text-white text-sm mr-4">{data.khasra_no}</strong>
                <span className="text-slate-400">Khata No:</span> <strong className="text-emerald-400 font-mono">{data.khata_no}</strong>
              </div>
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Generating PDF...' : 'Download Signed P-II Extract'}</span>
              </button>
            </div>

            {/* Key Field Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Location</span>
                <span className="font-bold text-white block">{data.village}, {data.tehsil}</span>
                <span className="text-[10px] text-slate-400">{data.district} District</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Plot Size / Area</span>
                <span className="font-bold text-emerald-400 text-sm font-mono block">{data.area_hectares} ha</span>
                <span className="text-[10px] text-slate-400">({data.area_sqm} sq.meters)</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Possession Type</span>
                <span className="font-bold text-slate-200 block">{data.possession_type}</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Soil Type</span>
                <span className="font-medium text-slate-200 block">{data.soil_type}</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Irrigation Source</span>
                <span className="font-medium text-slate-200 block">{data.irrigation_source}</span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block mb-0.5">Double Cropped Area</span>
                <span className="font-bold text-amber-400 block">{data.double_cropped_area_ha} ha</span>
              </div>
            </div>

            {/* Assets & Encumbrance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Trees className="w-4 h-4 text-emerald-400" /> Trees & Solar Pump
                </span>
                <div className="text-slate-400 text-[11px] space-y-1 pt-1">
                  <div>Trees: <strong>{data.trees_on_land?.join(', ')}</strong></div>
                  <div>Wells/Pumps: <strong>{data.well_or_tubewell}</strong></div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sky-400" /> Mutation & Encumbrance
                </span>
                <div className="text-slate-400 text-[11px] space-y-1 pt-1">
                  <div>Last Mutation: <strong>{data.last_mutation_date}</strong></div>
                  <div>Encumbrance: <strong className="text-emerald-400">{data.encumbrance_status}</strong></div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
