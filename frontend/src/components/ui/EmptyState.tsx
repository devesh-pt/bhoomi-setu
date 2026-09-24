import React from 'react';
import { Layers } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Layers className="w-8 h-8 text-slate-500 mx-auto" />,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 ${className}`}>
      <div className="p-3 bg-slate-800/60 rounded-full w-fit mx-auto border border-slate-700/50">
        {icon}
      </div>
      <h4 className="text-sm font-extrabold text-white">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button size="sm" variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
