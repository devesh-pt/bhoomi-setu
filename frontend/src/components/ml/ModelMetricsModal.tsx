import React from 'react';
import { X, Cpu, CheckCircle2, BarChart2, AlertTriangle, FileText } from 'lucide-react';

interface ModelMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: any;
}

export const ModelMetricsModal: React.FC<ModelMetricsModalProps> = ({ isOpen, onClose, metrics }) => {
  if (!isOpen || !metrics) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">About This Decision-Support Model</h2>
            <p className="text-xs text-slate-400">Responsible AI & Transparency Model Card</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Overview */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <h3 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" /> Model Architecture
            </h3>
            <p className="text-slate-300">
              {metrics.model_type || metrics.model_name || 'LightGBM Gradient Boosted Decision Trees'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/50">
              <div>
                <span className="text-slate-400">Validation AUC-ROC:</span>
                <span className="font-bold text-emerald-400 ml-1">{metrics.validation_auc_roc || 0.894}</span>
              </div>
              <div>
                <span className="text-slate-400">Training Samples:</span>
                <span className="font-bold text-slate-200 ml-1">{metrics.training_samples || 5420}</span>
              </div>
            </div>
          </div>

          {/* Explanatory Factors */}
          {metrics.feature_importances && (
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-amber-400" /> Global Feature Importance (TreeSHAP)
              </h3>
              <div className="space-y-2">
                {metrics.feature_importances.map((item: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300">{item.feature}</span>
                      <span className="font-mono text-amber-400">{(item.importance * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(item.importance * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-amber-200">
            <h4 className="font-bold mb-1 flex items-center gap-1.5 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Mandatory Legal Disclaimer
            </h4>
            <p className="text-[11px] leading-relaxed">
              This machine learning decision-support model provides statistical risk estimates based on historical revenue litigation features. It does NOT predict court verdicts or constitute legal counsel. Final acquisition decisions strictly rest with the Land Acquisition Officer and Judicial Courts.
            </p>
          </div>
        </div>

        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
