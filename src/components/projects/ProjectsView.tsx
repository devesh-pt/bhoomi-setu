import React, { useState, useEffect } from 'react';
import { FolderKanban, Search, Filter, MapPin, ChevronRight, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types';
import { BhoomiService } from '../../services/api';

interface ProjectsViewProps {
  onSelectProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  useEffect(() => {
    loadProjects();
  }, [search, stateFilter, riskFilter]);

  const loadProjects = async () => {
    const data = await BhoomiService.getProjects({
      search,
      state: stateFilter,
      riskLevel: riskFilter,
    });
    setProjects(data);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
            <FolderKanban className="w-4 h-4" />
            <span>National Infrastructure Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Land Acquisition Projects Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of land acquisition, compensation disbursements, and legal stays.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter projects by name, code, district, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="All">All States</option>
          <option value="Chhattisgarh">Chhattisgarh</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Odisha">Odisha</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="All">All Risk Levels</option>
          <option value="HIGH">🔴 High Risk</option>
          <option value="MEDIUM">🟡 Medium Risk</option>
          <option value="LOW">🟢 Low Risk</option>
        </select>
      </div>

      {/* Projects Table View */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200 text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Project Name & Code</th>
                <th className="p-4">Location</th>
                <th className="p-4">Land Required</th>
                <th className="p-4">Acquired %</th>
                <th className="p-4">Comp. Disbursed</th>
                <th className="p-4">Legal Cases</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900 max-w-xs truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{p.code} • {p.type}</div>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="text-slate-800">{p.district}</div>
                    <div className="text-[10px] text-slate-400">{p.state}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 whitespace-nowrap">
                    {p.landRequiredHectares.toLocaleString()} Ha
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 mb-1">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${p.acquisitionProgressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{p.acquisitionProgressPercent}%</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="font-bold text-slate-800">{p.compensation.disbursementPercentage}%</span>
                    <span className="block text-[10px] text-slate-400">₹{p.compensation.totalDisbursedAmountCr} Cr</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {p.legalCasesCount > 0 ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-lg text-[10px]">
                        {p.legalCasesCount} Cases
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black text-white ${
                        p.riskLevel === 'HIGH'
                          ? 'bg-red-600'
                          : p.riskLevel === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {p.riskScore}/100 {p.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(p.id);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
