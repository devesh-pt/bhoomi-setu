import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon,
  badge,
  className = '',
}) => {
  return (
    <div className={`p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl space-y-2 relative overflow-hidden group hover:border-slate-700 transition ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{title}</span>
        {icon && <div className="p-2 bg-slate-800/80 rounded-xl text-emerald-400 border border-slate-700/60">{icon}</div>}
        {badge && !icon && (
          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[9px]">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-white">{value}</span>
        {trend && (
          <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
            trend.direction === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {trend.direction === 'up' ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-slate-400 leading-snug">{subtext}</p>}
    </div>
  );
};
