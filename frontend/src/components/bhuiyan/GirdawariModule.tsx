import React, { useState, useEffect } from 'react';
import { X, Calendar, UserCheck, Sprout, BarChart2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from '../../services/api';

interface GirdawariModuleProps {
  isOpen: boolean;
  onClose: () => void;
  parcelId: string;
}

export const GirdawariModule: React.FC<GirdawariModuleProps> = ({
  isOpen,
  onClose,
  parcelId
}) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && parcelId) {
      setLoading(true);
      api.getGirdawariData(parcelId)
        .then((resData) => setData(resData))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [isOpen, parcelId]);

  if (!isOpen) return null;

  const COLORS = ['#22c55e', '#f59e0b', '#06b6d4', '#ec4899'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Girdawari Crop & Possession Register (गिरदावरी विवरण)</span>
                <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] rounded-full uppercase">
                  Seasonal Crop Survey
                </span>
              </h2>
              <p className="text-xs text-slate-400">Khasra Survey ID: <strong>{parcelId}</strong> | Year 2024–2025</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Fetching Patwari Girdawari seasonal inspection records...
          </div>
        ) : data ? (
          <div className="space-y-5 overflow-y-auto pr-1 text-xs">
            {/* Chart + Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <div className="md:col-span-7 space-y-2">
                <span className="font-bold text-white block text-sm">🌾 Seasonal Crop Summary</span>
                <p className="text-slate-400 leading-relaxed">
                  Patwari physical inspection record confirms active cultivation of <strong>{data.entries?.[0]?.crop_name}</strong> during Kharif season with canal irrigation access.
                </p>
              </div>

              {/* Pie Chart */}
              <div className="md:col-span-5 h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.crop_distribution_chart || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={4}
                      dataKey="coverage_percent"
                      nameKey="crop"
                    >
                      {data.crop_distribution_chart?.map((entry: any, idx: number) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Girdawari Seasonal Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Season-Wise Inspection Entries (पटवारी गिरदावरी प्रविष्टि)</span>
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 uppercase text-[10px] text-slate-400">
                    <tr>
                      <th className="p-3">Season / Year</th>
                      <th className="p-3">Crop Name (फसल)</th>
                      <th className="p-3">Sown Area (ha)</th>
                      <th className="p-3">Irrigation</th>
                      <th className="p-3">Possession (कब्ज़ा)</th>
                      <th className="p-3">Patwari Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {data.entries?.map((e: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-bold text-white">{e.season}</td>
                        <td className="p-3 font-bold text-emerald-400">{e.crop_name}</td>
                        <td className="p-3 font-mono text-slate-200">{e.sown_area_ha} ha</td>
                        <td className="p-3 text-slate-300">{e.irrigation_type}</td>
                        <td className="p-3 font-medium text-amber-300">{e.possession_person}</td>
                        <td className="p-3 text-[10px] text-slate-400">
                          <div>{e.inspector_patwari}</div>
                          <div>Date: {e.inspection_date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
