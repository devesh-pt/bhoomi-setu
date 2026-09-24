import React, { useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[900] pointer-events-none select-none">
      {/* Container wrapper */}
      <div
        className={`pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/80 rounded-t-3xl shadow-2xl transition-all duration-300 flex flex-col ${
          isExpanded ? 'h-[85vh]' : 'h-[50vh]'
        } max-w-xl mx-auto`}
      >
        {/* Drag Handle Bar / Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 flex flex-col items-center border-b border-slate-800 cursor-pointer group shrink-0"
        >
          <div className="w-12 h-1.5 bg-slate-700 rounded-full group-hover:bg-slate-500 transition mb-2" />
          <div className="w-full flex items-center justify-between px-2">
            <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
              {title || 'Details & Analytics'}
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 select-text">
          {children}
        </div>
      </div>
    </div>
  );
};
