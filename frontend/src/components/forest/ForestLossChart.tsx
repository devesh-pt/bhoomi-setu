import React, { useState } from 'react';
import { Trees, AlertTriangle, TrendingDown } from 'lucide-react';

interface LossItem {
  year: number;
  loss_ha: number;
}

interface ForestLossChartProps {
  data: LossItem[];
  forestName?: string;
}

export const ForestLossChart: React.FC<ForestLossChartProps> = ({ data, forestName }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-400 text-xs">
        No forest loss time series recorded.
      </div>
    );
  }

  const maxLoss = Math.max(...data.map(d => d.loss_ha), 10.0);
  const totalLoss = data.reduce((acc, d) => acc + d.loss_ha, 0);
  const avgLoss = (totalLoss / data.length).toFixed(1);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-inner">
      {/* Chart Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
          <Trees className="w-4 h-4 text-emerald-400" />
          <span>Forest Loss Timeline (2016–2025)</span>
        </div>
        <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
          <TrendingDown className="w-3 h-3" /> Total: {totalLoss.toFixed(1)} ha
        </span>
      </div>

      {/* SVG Bar Chart */}
      <div className="relative pt-4 pb-1">
        <div className="flex items-end justify-between gap-1 h-32 px-1 border-b border-slate-800">
          {data.map((item, idx) => {
            const heightPct = Math.max(8, Math.round((item.loss_ha / maxLoss) * 100));
            const isHovered = hoveredIndex === idx;
            const isSpike = item.loss_ha > parseFloat(avgLoss) * 1.5;

            return (
              <div
                key={item.year}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center group relative cursor-pointer"
              >
                {/* Tooltip Popup */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-slate-950 border border-emerald-500/50 text-emerald-200 text-[10px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap animate-fade-in pointer-events-none">
                    {item.year}: <span className="text-amber-400">{item.loss_ha} ha</span>
                  </div>
                )}

                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isSpike
                      ? 'bg-gradient-to-t from-amber-600 to-rose-500 hover:from-amber-500 hover:to-rose-400 shadow-md shadow-rose-950'
                      : 'bg-gradient-to-t from-emerald-700 to-emerald-400 hover:from-emerald-600 hover:to-emerald-300 shadow-sm'
                  }`}
                ></div>

                {/* Year Label */}
                <span className={`text-[9px] mt-1 font-mono font-bold transition ${isHovered ? 'text-emerald-300 scale-110' : 'text-slate-400'}`}>
                  '{String(item.year).slice(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stat Footer */}
      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block">Average Annual Loss</span>
          <span className="font-bold text-slate-200 text-xs">{avgLoss} ha / year</span>
        </div>
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-400 block font-medium">Hansen GFW Alert Level</span>
          <span className="font-bold text-amber-400 text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" /> Gentle Decline
          </span>
        </div>
      </div>
    </div>
  );
};
