import React, { useState, useEffect } from 'react';
import {
  Layers,
  FolderKanban,
  FileText,
  Sliders,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Sparkles,
  Bot,
  LineChart,
  MapPin,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Project } from '../../types';
import { BhoomiService } from '../../services/api';
import { IndiaMapWidget } from './IndiaMapWidget';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (tab: string, projectId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [selectedState, selectedType, selectedRisk]);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await BhoomiService.getProjects({
      state: selectedState,
      type: selectedType,
      riskLevel: selectedRisk,
    });
    setProjects(data);
    setIsLoading(false);
  };

  const highRiskProjects = projects.filter((p) => p.riskLevel === 'HIGH');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Executive Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg text-xs font-extrabold uppercase tracking-wide">
              {user?.role || 'Government Official'} Portal
            </span>
            <span className="text-xs text-slate-400 font-medium">National Land Governance Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Good Morning, Welcome to BHOOMI SETU
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Evidence-driven intelligence for research, policy innovation, and land governance
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onNavigate('predictive')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <LineChart className="w-4 h-4 text-emerald-400" />
            <span>Risk Predictor</span>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Bot className="w-4 h-4" />
            <span>Ask BHOOMI AI</span>
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div className="px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-medium">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Prototype Demo Mode:</strong> Realistic data active for SIH 2026 jury demonstration.
          </span>
        </div>
        <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider text-blue-700">
          Demo Data — For Prototype Demonstration Only
        </span>
      </div>

      {/* Key Statistic Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Land Records */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Land Parcels</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">2.8M</h3>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <span>↑ 12% digitized this quarter</span>
            </p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Projects</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">1,248</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Across 28 States & UTs</p>
          </div>
        </div>

        {/* Research Documents */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Research Docs</span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">12,450</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Indexed Policy Studies</p>
          </div>
        </div>

        {/* Policy Insights */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Policy Insights</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">432</h3>
            <p className="text-[11px] text-amber-600 font-bold mt-0.5">Simulations Executed</p>
          </div>
        </div>

        {/* At-Risk Projects */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-3xl border border-red-200 shadow-xs hover:border-red-300 transition col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-red-700">
            <span className="text-xs font-bold uppercase tracking-wider text-red-900">Projects at Risk</span>
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-red-900 tracking-tight">187</h3>
            <p className="text-[11px] text-red-700 font-bold mt-0.5">High Delay & Litigation Risk</p>
          </div>
        </div>
      </div>

      {/* Main Grid: GIS Map + Priority Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* GIS Map Widget */}
        <div className="lg:col-span-8">
          <IndiaMapWidget
            projects={projects}
            selectedState={selectedState}
            onSelectState={(st) => setSelectedState(st)}
            onSelectProject={(id) => onNavigate('projects', id)}
          />
        </div>

        {/* At-Risk Focus & Quick Actions */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-extrabold text-slate-900">High Risk Watchlist</h3>
              </div>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-full">
                {highRiskProjects.length} Flagged
              </span>
            </div>

            <div className="space-y-3">
              {highRiskProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate('projects', p.id)}
                  className="p-3.5 rounded-2xl border border-red-100 bg-red-50/40 hover:bg-red-50 cursor-pointer transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{p.district}, {p.state}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 bg-red-600 text-white font-extrabold text-[10px] rounded-lg">
                      {p.riskScore}/100
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-red-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">Acquired: {p.acquisitionProgressPercent}%</span>
                    <span className="text-red-700 font-bold flex items-center gap-0.5">
                      Inspect Risk Causes
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1"
            >
              <span>View All 1,248 Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
          <Filter className="w-4 h-4 text-blue-700" />
          <span>National Governance Filters</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* State Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All States (28)</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          {/* Project Type Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Project Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Types</option>
              <option value="Highway">Highway</option>
              <option value="Railway">Railway</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Industrial Corridor">Industrial Corridor</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Risk Level</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Risk Levels</option>
              <option value="HIGH">High Risk (&gt;70)</option>
              <option value="MEDIUM">Medium Risk (40-70)</option>
              <option value="LOW">Low Risk (&lt;40)</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedType('All');
                setSelectedRisk('All');
              }}
              className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
