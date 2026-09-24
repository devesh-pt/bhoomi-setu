import React from 'react';
import { PlayCircle, ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDemo, SIH_DEMO_STEPS } from '../../context/DemoContext';

export const GuidedDemoBanner: React.FC = () => {
  const { isDemoActive, currentStepIndex, currentStep, nextStep, prevStep, stopDemo } = useDemo();

  if (!isDemoActive) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white px-4 py-3 border-b border-blue-800 shadow-xl z-40 animate-in slide-in-from-top-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Step Indicator & Info */}
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
            {currentStepIndex + 1}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700/50 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>SIH Jury Demo Journey</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Step {currentStepIndex + 1} of {SIH_DEMO_STEPS.length}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{currentStep.title}</h4>
            <p className="text-xs text-slate-300 line-clamp-2 mt-0.5 leading-snug">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Highlight Tip & Navigation Controls */}
        <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
          <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-900/60 border border-blue-700/60 rounded-xl text-xs text-blue-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{currentStep.highlightText}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs disabled:opacity-40 transition"
              title="Previous Step"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={nextStep}
              className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
            >
              <span>{currentStepIndex === SIH_DEMO_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={stopDemo}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Exit Demo Journey"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
