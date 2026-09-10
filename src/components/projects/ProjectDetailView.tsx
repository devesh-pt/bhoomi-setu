import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Building2, AlertTriangle, ShieldCheck, CheckCircle2, Scale, Users, LineChart, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { BhoomiService } from '../../services/api';

interface ProjectDetailViewProps {
  projectId: string;
  onBack: () => void;
  onNavigateGIS?: () => void;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId, onBack, onNavigateGIS }) => {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    const p = await BhoomiService.getProjectById(projectId);
    if (p) setProject(p);
  };

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">
        Loading Project File...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back Button & Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 mb-3 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects Registry</span>
        </button>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 font-bold text-[10px] rounded uppercase">
                {project.type}
              </span>
              <span className="text-xs text-slate-400 font-medium">{project.code}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">{project.name}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{project.district}, {project.state}</span>
              <span>• Implementing Agency: {project.implementingAgency}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <span
              className={`px-3 py-1.5 rounded-2xl text-xs font-black text-white shadow-xs ${
                project.riskLevel === 'HIGH' ? 'bg-red-600' : project.riskLevel === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}
            >
              Risk Score: {project.riskScore}/100 ({project.riskLevel})
            </span>

            {onNavigateGIS && (
              <button
                onClick={onNavigateGIS}
                className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition"
              >
                Inspect on GIS Map
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Overview: Land Progress + Compensation + Legal + R&R */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Land Acquisition Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Land Acquisition</span>
          <h3 className="text-2xl font-black text-slate-900">{project.acquisitionProgressPercent}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.acquisitionProgressPercent}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {project.landAcquiredHectares} Ha acquired of {project.landRequiredHectares} Ha total
          </p>
        </div>

        {/* Compensation Disbursement */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Compensation Disbursed</span>
          <h3 className="text-2xl font-black text-emerald-700">{project.compensation.disbursementPercentage}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${project.compensation.disbursementPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            ₹{project.compensation.totalDisbursedAmountCr} Cr paid of ₹{project.compensation.totalApprovedAmountCr} Cr
          </p>
        </div>

        {/* Rehabilitation Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">R&R Resettlement</span>
          <h3 className="text-2xl font-black text-amber-700">{project.rehabilitation.progressPercentage}%</h3>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${project.rehabilitation.progressPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            {project.rehabilitation.resettledFamilies} families resettled of {project.rehabilitation.targetFamilies}
          </p>
        </div>

        {/* Legal Cases */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Legal Litigation</span>
          <h3 className="text-2xl font-black text-red-600">{project.legalCasesCount} Active Cases</h3>
          <p className="text-[11px] text-red-700 font-bold pt-1">
            {project.legalCases.filter(c => c.status === 'Stay Granted').length} High Court Injunction Stays
          </p>
        </div>
      </div>

      {/* Main Details: Legal Litigation Table + AI Risk Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Legal Litigation Cases Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="w-5 h-5 text-red-600" />
            <span>Active Court Litigation & Stay Orders</span>
          </h3>

          {project.legalCases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active litigation cases recorded for this project.</div>
          ) : (
            <div className="space-y-3">
              {project.legalCases.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl border border-red-100 bg-red-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{c.caseNumber}</span>
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded ${
                      c.status === 'Stay Granted' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium">{c.court}</div>
                  <div className="text-xs text-red-900 font-bold">Issue: {c.issueType}</div>
                  <div className="text-[11px] text-slate-500">
                    Filed: {c.filedDate} • Affected Area: {c.affectedAreaHectares} Hectares
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Risk Prediction Widget */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Delay Prediction Model</span>
          </div>

          <h3 className="text-xl font-black text-white">Project Overrun Forecast</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Machine learning predictive model forecasts an estimated <strong>8.5 months delay</strong> with 72% probability due to pending compensation disbursement gaps.
          </p>

          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-300">Recommended Administrative Action:</div>
            <p className="text-xs text-slate-300 leading-snug">
              ✓ Fast-track direct benefit transfer (DBT) verification for 1,136 pending compensation claims in Raigarh.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
