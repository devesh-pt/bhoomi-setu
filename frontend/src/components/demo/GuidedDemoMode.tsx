import React, { useState } from 'react';
import { PlayCircle, CheckCircle2, ChevronRight, X, Sparkles, Map, GitCommit, Scale, Trees } from 'lucide-react';

interface GuidedDemoModeProps {
  onNavigateTab: (tab: string) => void;
  onClose: () => void;
}

export const GuidedDemoMode: React.FC<GuidedDemoModeProps> = ({
  onNavigateTab,
  onClose
}) => {
  const [currentScenario, setCurrentScenario] = useState<number>(1);

  const scenarios = [
    {
      id: 1,
      title: "Scenario 1: Cascading Search & Khasra Inspection",
      tab: "search",
      desc: "Perform cascading district > tehsil > village search across 33 CG districts. Click B-1 Khatauni / P-II Khasra extract to view authenticated Bhuiyan records and generate digitally signed PDF with QR verification.",
      actionLabel: "Launch Search & Map View"
    },
    {
      id: 3,
      title: "Scenario 3: AI Land Dispute Analyzer & SHAP Explainer",
      tab: "dispute",
      desc: "Analyze conflicting claims on Khasra 183/2. View claimant likelihood scores, SHAP explanatory factors (mutation continuity, tax receipts, survey match), and legal decision-support disclaimers.",
      actionLabel: "Launch AI Dispute Analyzer"
    },
    {
      id: 4,
      title: "Scenario 4: Highway Corridor Acquisition & RFCTLARR Act Report",
      tab: "highways",
      desc: "Select NH-53 Expressway corridor, set 60m buffer width, compute instant compensation (Market Value + 100% Solatium + Multiplier + Interest), and compare alternative route alignments.",
      actionLabel: "Launch Highway Planner"
    },
    {
      id: 5,
      title: "Scenario 5: Forest NDVI Change & Record vs Reality Mismatch",
      tab: "forest",
      desc: "Swipe 2019 vs 2024 forest canopy change slider, inspect NDVI heatmap, and review satellite land cover vs revenue crop record mismatch alerts for law enforcement.",
      actionLabel: "Launch Forest & Mismatch Tool"
    }
  ];

  const activeScenario = scenarios[currentScenario - 1];

  const handleStepClick = (scenarioId: number) => {
    setCurrentScenario(scenarioId);
    onNavigateTab(scenarios[scenarioId - 1].tab);
  };

  return (
    <div className="fixed top-16 left-4 right-4 z-40 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl text-slate-100 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                SIH 2026 Jury Guided Demo Mode ({currentScenario}/5)
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full font-mono">
                Interactive Scenario
              </span>
            </div>
            <h2 className="text-sm md:text-base font-extrabold text-white mt-0.5">
              {activeScenario.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {activeScenario.desc}
            </p>
          </div>
        </div>

        {/* Stepper controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStepClick(s.id)}
              className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition ${
                currentScenario === s.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
                  : currentScenario > s.id
                  ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700/60'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {currentScenario > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </button>
          ))}

          <button
            onClick={() => handleStepClick(Math.min(5, currentScenario + 1))}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow flex items-center gap-1 transition ml-1"
          >
            <span>Next Scenario</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
