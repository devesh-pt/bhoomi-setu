import React from 'react';
import { X, Scale, FileText, Download, CheckCircle2 } from 'lucide-react';

interface ParcelCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcels: any[];
  onRemove: (id: string) => void;
}

export const ParcelCompareModal: React.FC<ParcelCompareModalProps> = ({ isOpen, onClose, parcels, onRemove }) => {
  if (!isOpen || parcels.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Side-by-Side Cadastral Parcel Comparison</h2>
              <p className="text-xs text-slate-400">Compare up to 3 parcels across Chhattisgarh districts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 uppercase text-[10px] text-slate-400">
              <tr>
                <th className="p-3 w-40">Attribute</th>
                {parcels.map((p) => (
                  <th key={p.parcel_id} className="p-3 text-center border-l border-slate-700/60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-white text-sm">{p.khasra_no}</span>
                      <button onClick={() => onRemove(p.parcel_id)} className="text-rose-400 hover:text-rose-300 p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-slate-400 text-[10px] block">{p.village}, {p.district}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="p-3 font-semibold text-slate-400">Khata Number</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 font-bold text-white">
                    {p.khata_no || 'KH-104'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Recorded Owner</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800">
                    <span className="font-semibold text-white block">{p.owner_name}</span>
                    <span className="text-[10px] text-slate-400">{p.father_name || 'N/A'}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Area (Hectares / Acres)</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 font-bold text-emerald-400">
                    {p.area_hectares} ha ({p.area_acres} ac)
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Land Type</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 uppercase font-semibold">
                    {p.land_type}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Soil & Irrigation</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 text-[11px]">
                    {p.soil_type || 'Matasi Soil'} / {p.irrigation_source || 'Canal'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Market Rate (Lakhs/ha)</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 font-bold text-amber-400">
                    ₹{p.market_value_per_ha} Lakhs
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">Encumbrance Loan Status</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 text-[11px]">
                    {p.encumbrance_status || 'None'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-400">AI Dispute Prediction</td>
                {parcels.map((p) => (
                  <td key={p.parcel_id} className="p-3 text-center border-l border-slate-800 text-[11px] text-emerald-300 font-semibold">
                    {p.ai_dispute_winner_prediction || 'Recorded Owner (94%)'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
