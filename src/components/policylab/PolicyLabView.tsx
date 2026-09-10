import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, BarChart2, TrendingDown, Users, IndianRupee, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { PolicyScenario, PolicyImpact } from '../../types';
import { BhoomiService } from '../../services/api';

export const PolicyLabView: React.FC = () => {
  const [scenario, setScenario] = useState<PolicyScenario>({
    compensationMultiplier: 1.8,
    processingTimeMonths: 18,
    affectedFamiliesCount: 3500,
    legalDisputeProbPercent: 35,
    adminEfficiencyPercent: 75,
    rehabilitationRatePercent: 80,
  });

  const [impact, setImpact] = useState<PolicyImpact | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    runSimulation();
  }, [scenario]);

  const runSimulation = async () => {
    setIsSimulating(true);
    const result = await BhoomiService.runPolicySimulation(scenario);
    setImpact(result);
    setIsSimulating(false);
  };

  const handleReset = () => {
    setScenario({
      compensationMultiplier: 1.2,
      processingTimeMonths: 24,
      affectedFamiliesCount: 5000,
      legalDisputeProbPercent: 60,
      adminEfficiencyPercent: 50,
      rehabilitationRatePercent: 45,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Interactive Governance Simulator</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Policy Lab & Scenario Workbench</h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate land compensation reforms, administrative efficiency targets, and dispute risk mitigations.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Parameters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Sliders */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>Policy Scenario Controls</span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded-full">
              Real-time Simulation
            </span>
          </h3>

          {/* Slider 1: Compensation Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <label>Compensation Valuation Multiplier</label>
              <span className="text-amber-800 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg">
                {scenario.compensationMultiplier.toFixed(1)}x Circle Rate
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={scenario.compensationMultiplier}
              onChange={(e) => setScenario({ ...scenario, compensationMultiplier: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1.0x (Standard)</span>
              <span>2.0x (RFCTLARR Urban)</span>
              <span>3.0x (High Incentive)</span>
            </div>
          </div>

          {/* Slider 2: Administrative Efficiency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <label>Administrative Efficiency Index</label>
              <span className="text-blue-800 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-lg">
                {scenario.adminEfficiencyPercent}%
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={scenario.adminEfficiencyPercent}
              onChange={(e) => setScenario({ ...scenario, adminEfficiencyPercent: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Slider 3: Legal Dispute Probability */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <label>Legal Dispute Probability Factor</label>
              <span className="text-red-800 px-2 py-0.5 bg-red-50 border border-red-200 rounded-lg">
                {scenario.legalDisputeProbPercent}% Risk
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={scenario.legalDisputeProbPercent}
              onChange={(e) => setScenario({ ...scenario, legalDisputeProbPercent: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Slider 4: Rehabilitation Rate Target */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <label>R&R Target Completion Rate</label>
              <span className="text-emerald-800 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                {scenario.rehabilitationRatePercent}% Resettled
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={scenario.rehabilitationRatePercent}
              onChange={(e) => setScenario({ ...scenario, rehabilitationRatePercent: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Slider 5: Affected Families */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <label>Corridor Affected Families Count</label>
              <span className="text-slate-800 px-2 py-0.5 bg-slate-100 rounded-lg">
                {scenario.affectedFamiliesCount.toLocaleString()} Families
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={scenario.affectedFamiliesCount}
              onChange={(e) => setScenario({ ...scenario, affectedFamiliesCount: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>
        </div>

        {/* Right Output: Predicted Impact Cards & Recharts Graph */}
        <div className="lg:col-span-6 space-y-6">
          {impact && (
            <>
              {/* Predicted Impact KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expected Delay</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{impact.expectedDelayMonths} Months</h3>
                  <p className="text-[11px] text-emerald-600 font-bold mt-0.5">
                    {impact.expectedDelayMonths < 12 ? '↓ 6.2 Months lower than baseline' : 'Over baseline threshold'}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completion Prob</span>
                  <h3 className="text-2xl font-black text-emerald-700 mt-1">{impact.completionProbabilityPercent}%</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Project success likelihood</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Financial Impact</span>
                  <h3 className="text-2xl font-black text-amber-700 mt-1">₹{impact.financialImpactCr} Cr</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Total payout outlay</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Affected Population</span>
                  <h3 className="text-2xl font-black text-blue-900 mt-1">{impact.estimatedAffectedPopulation.toLocaleString()}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Estimated individuals</p>
                </div>
              </div>

              {/* Recharts Comparison Visualizer */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart2 className="w-4 h-4 text-amber-600" />
                    <span>Baseline vs Proposed Scenario Impact</span>
                  </h4>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={impact.historicalComparisonData}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="currentScenario" name="Current Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="proposedScenario" name="Proposed Policy Lab Scenario" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
