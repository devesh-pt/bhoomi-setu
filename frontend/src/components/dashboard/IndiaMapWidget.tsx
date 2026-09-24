import React, { useState } from 'react';
import { MapPin, AlertTriangle, Layers, Navigation, Info } from 'lucide-react';
import { Project } from '../../types';

interface IndiaMapWidgetProps {
  projects: Project[];
  selectedState: string;
  onSelectState: (state: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const IndiaMapWidget: React.FC<IndiaMapWidgetProps> = ({
  projects,
  selectedState,
  onSelectState,
  onSelectProject,
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'risk' | 'infra'>('all');

  // State pin locations on stylized India map SVG view
  const stateLocations = [
    { state: 'Chhattisgarh', x: '58%', y: '52%', count: 1, highRisk: 1 },
    { state: 'Maharashtra', x: '42%', y: '58%', count: 1, highRisk: 0 },
    { state: 'Odisha', x: '68%', y: '54%', count: 1, highRisk: 0 },
    { state: 'Rajasthan', x: '35%', y: '35%', count: 1, highRisk: 0 },
    { state: 'Uttar Pradesh', x: '52%', y: '36%', count: 1, highRisk: 1 },
    { state: 'Gujarat', x: '28%', y: '48%', count: 1, highRisk: 0 },
    { state: 'Madhya Pradesh', x: '46%', y: '46%', count: 1, highRisk: 1 },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
      {/* Map Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-blue-700" />
            <h3 className="text-base font-extrabold text-slate-900">National GIS Spatial Hub</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial distribution of land acquisition projects & high-risk corridors
          </p>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveLayer('all')}
            className={`px-3 py-1 rounded-lg transition ${
              activeLayer === 'all' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            All Corridors
          </button>
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-3 py-1 rounded-lg transition flex items-center space-x-1 ${
              activeLayer === 'risk' ? 'bg-red-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>High Risk</span>
          </button>
          <button
            onClick={() => setActiveLayer('infra')}
            className={`px-3 py-1 rounded-lg transition ${
              activeLayer === 'infra' ? 'bg-white text-emerald-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            Infra Projects
          </button>
        </div>
      </div>

      {/* Stylized Interactive Map Canvas */}
      <div className="relative w-full h-[340px] bg-gradient-to-b from-slate-900 via-[#0f2942] to-slate-950 rounded-2xl my-3 overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

        {/* India Map Outline SVG */}
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full max-h-[330px] opacity-70 p-4 drop-shadow-2xl"
          fill="none"
          stroke="#334155"
          strokeWidth="1.5"
        >
          {/* Simplified contours of India */}
          <path
            d="M250,50 L280,70 L300,100 L320,130 L350,150 L380,180 L400,200 L420,240 L410,270 L390,300 L350,340 L310,380 L280,420 L260,450 L250,470 L240,450 L220,420 L190,380 L150,340 L110,300 L90,270 L80,240 L100,200 L120,180 L150,150 L180,130 L200,100 L220,70 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="2"
          />
        </svg>

        {/* State Interactive Markers */}
        {stateLocations.map((loc) => {
          const isSelected = selectedState === loc.state;
          const matchingProjects = projects.filter((p) => p.state === loc.state);
          const hasHighRisk = matchingProjects.some((p) => p.riskLevel === 'HIGH');

          if (activeLayer === 'risk' && !hasHighRisk) return null;

          return (
            <div
              key={loc.state}
              style={{ left: loc.x, top: loc.y }}
              onClick={() => onSelectState(selectedState === loc.state ? 'All' : loc.state)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Marker Pulsing Ring */}
              <div
                className={`relative flex items-center justify-center p-2 rounded-full transition transform group-hover:scale-125 ${
                  hasHighRisk
                    ? 'bg-red-500/30 text-red-400 border-2 border-red-500 animate-pulse'
                    : 'bg-emerald-500/30 text-emerald-400 border-2 border-emerald-400'
                } ${isSelected ? 'ring-4 ring-white scale-125' : ''}`}
              >
                <MapPin className="w-5 h-5 fill-current" />

                {/* State Label Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-700 shadow-xl whitespace-nowrap">
                    <div>{loc.state}</div>
                    <div className="text-[10px] text-emerald-400 font-normal">
                      {matchingProjects.length} Project(s) • {hasHighRisk ? '⚠️ High Risk' : '🟢 Active'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur border border-slate-800 text-white p-3 rounded-2xl text-[11px] space-y-1 shadow-lg">
          <div className="font-bold text-slate-300 mb-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>GIS Map Legend</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-pulse" />
            <span className="text-slate-300">High Risk Project Hotspot (Score &gt; 70)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span className="text-slate-300">Active Corridor / On-Track</span>
          </div>
        </div>

        {/* Selected State Filter Badge */}
        {selectedState !== 'All' && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-lg flex items-center space-x-2">
            <span>Filtered by: {selectedState}</span>
            <button
              onClick={() => onSelectState('All')}
              className="ml-1 hover:text-slate-200 underline text-[10px]"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Click state pin to filter statistics & project queues
        </span>
        <span className="font-bold text-slate-700">7 Major State Corridors demographically indexed</span>
      </div>
    </div>
  );
};
