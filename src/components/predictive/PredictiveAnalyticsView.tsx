import React, { useState, useEffect } from 'react';
import { LineChart, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, Sparkles, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { RiskPrediction, ProjectType } from '../../types';
import { BhoomiService } from '../../services/api';

export const PredictiveAnalyticsView: React.FC = () => {
  const [projectType, setProjectType] = useState<ProjectType>('Highway');
  const [landArea, setLandArea] = useState(1450);
  const [affectedFamilies, setAffectedFamilies] = useState(3240);
  const [compensationDisbursed, setCompensationDisbursed] = useState(46);
  const [approvalTime, setApprovalTime] = useState(20);
  const [legalDisputes, setLegalDisputes] = useState(18);
  const [rehabProgress, setRehabProgress] = useState(34);
  const [stakeholderResp, setStakeholderResp] = useState<'High' | 'Medium' | 'Low'>('Low');

  const [prediction, setPrediction] = useState<RiskPrediction | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    runPrediction();
  }, [projectType, landArea, affectedFamilies, compensationDisbursed, approvalTime, legalDisputes, rehabProgress, stakeholderResp]);

  const runPrediction = async () => {
    setIsCalculating(true);
    const result = await BhoomiService.predictRisk({
      projectType,
      landAreaHectares: landArea,
      affectedFamilies,
      compensationDisbursedPercent: compensationDisbursed,
      approvalTimeMonths: approvalTime,
      legalDisputesCount: legalDisputes,
      rehabilitationProgressPercent: rehabProgress,
      stakeholderResponsiveness: stakeholderResp,
    });
    setPrediction(result);
    setIsCalculating(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
            <LineChart className="w-4 h-4 text-emerald-500" />
            <span>Machine Learning Risk & Delay Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Land Acquisition Delay Prediction</h1>
          <p className="text-xs text-slate-500 mt-1">
            Forecasting legal litigation stays, compensation bottlenecks, and time overruns before civil work begins.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold rounded-xl flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Prototype Prediction Model</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            Project Risk Parameters
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="Highway">Highway Corridor</option>
                <option value="Railway">Railway Link</option>
                <option value="Irrigation">Irrigation / Dam</option>
                <option value="Industrial Corridor">Industrial Park</option>
                <option value="Rural Infrastructure">Rural Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stakeholder Responsiveness</label>
              <select
                value={stakeholderResp}
                onChange={(e) => setStakeholderResp(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="High">High Co-operation</option>
                <option value="Medium">Moderate Resistance</option>
                <option value="Low">High Agitation / Low Trust</option>
              </select>
            </div>
          </div>

          {/* Compensation Disbursed Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <label>Compensation Disbursed Percentage</label>
              <span className="text-blue-800">{compensationDisbursed}% Paid</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={compensationDisbursed}
              onChange={(e) => setCompensationDisbursed(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Legal Disputes Count Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <label>Pending Court Litigation Cases</label>
              <span className="text-red-700">{legalDisputes} Active Cases</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              value={legalDisputes}
              onChange={(e) => setLegalDisputes(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Rehabilitation Progress Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <label>Rehabilitation & Resettlement (R&R) Progress</label>
              <span className="text-emerald-700">{rehabProgress}% Resettled</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rehabProgress}
              onChange={(e) => setRehabProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Approval Time Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <label>Administrative Clearance Approval Time</label>
              <span className="text-slate-800">{approvalTime} Months Elapsed</span>
            </div>
            <input
              type="range"
              min="3"
              max="36"
              value={approvalTime}
              onChange={(e) => setApprovalTime(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>
        </div>

        {/* Right Output: Risk Gauge Score & Explanations */}
        <div className="lg:col-span-6 space-y-6">
          {prediction && (
            <>
              {/* Risk Gauge Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Score Dial Circle */}
                <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={prediction.riskScore >= 70 ? 'text-red-600' : prediction.riskScore >= 40 ? 'text-amber-500' : 'text-emerald-500'}
                      strokeDasharray={`${prediction.riskScore}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{prediction.riskScore}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">out of 100</span>
                  </div>
                </div>

                {/* Score Details */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div>
                    <span className={`inline-block px-3 py-1 text-xs font-black rounded-xl uppercase tracking-wider text-white ${
                      prediction.riskLevel === 'HIGH' ? 'bg-red-600' : prediction.riskLevel === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}>
                      {prediction.riskLevel} RISK CORRIDOR
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-2">
                      {prediction.delayProbabilityPercent}% Delay Probability
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estimated overrun: <strong>{prediction.estimatedDelayMonths} months delay</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[9px] uppercase">Legal</span>
                      <span className={prediction.legalRiskLevel === 'HIGH' ? 'text-red-600' : 'text-slate-800'}>
                        {prediction.legalRiskLevel}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[9px] uppercase">Comp.</span>
                      <span className={prediction.compensationRiskLevel === 'HIGH' ? 'text-red-600' : 'text-slate-800'}>
                        {prediction.compensationRiskLevel}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block text-[9px] uppercase">R&R</span>
                      <span className={prediction.rehabilitationRiskLevel === 'HIGH' ? 'text-red-600' : 'text-slate-800'}>
                        {prediction.rehabilitationRiskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 12: Risk Explanation */}
              <div className="bg-red-50/70 border border-red-200 p-5 rounded-3xl space-y-3">
                <h4 className="text-xs font-extrabold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Why is this project at risk?
                </h4>
                <ul className="space-y-2 text-xs text-red-950">
                  {prediction.riskCauses.map((cause, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-red-200 text-red-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-3xl space-y-3">
                <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recommended Governance Interventions
                </h4>
                <ul className="space-y-2 text-xs text-emerald-950">
                  {prediction.recommendedActions.map((rec, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="leading-snug">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
