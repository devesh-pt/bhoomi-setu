import React, { useState } from 'react';
import { Compass, Radius, Layers, Download, CheckCircle2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';
import { BhoomiService } from '../../services/api';
import { LandParcel, Project } from '../../types';

interface AdvancedGISToolsProps {
  onSelectProject: (projectId: string) => void;
}

export const AdvancedGISTools: React.FC<AdvancedGISToolsProps> = ({ onSelectProject }) => {
  const [bufferRadiusKm, setBufferRadiusKm] = useState<number>(15);
  const [selectedCenter, setSelectedCenter] = useState<{ name: string; lat: number; lng: number }>({
    name: 'Raigarh Industrial Corridor (Chhattisgarh)',
    lat: 21.8974,
    lng: 83.3950,
  });

  const [spatialResult, setSpatialResult] = useState<{
    affectedParcels: LandParcel[];
    affectedProjects: Project[];
    totalAreaHectares: number;
  } | null>(null);

  const [isQuerying, setIsQuerying] = useState(false);

  const runSpatialBufferQuery = async () => {
    setIsQuerying(true);
    const result = await BhoomiService.performSpatialBufferAnalysis(
      selectedCenter.lat,
      selectedCenter.lng,
      bufferRadiusKm
    );
    setSpatialResult(result);
    setIsQuerying(false);
  };

  const centersList = [
    { name: 'Raigarh Industrial Corridor (Chhattisgarh)', lat: 21.8974, lng: 83.3950 },
    { name: 'Vadhavan Port Freight Corridor (Maharashtra)', lat: 19.9868, lng: 72.7169 },
    { name: 'Mahanadi Basin Canals (Odisha)', lat: 21.4669, lng: 83.9812 },
    { name: 'Ken-Betwa Interlinking Basin (Madhya Pradesh)', lat: 24.7208, lng: 80.1852 },
  ];

  const exportGeoJSON = async () => {
    const parcels = await BhoomiService.getLandParcels();
    const geojson = {
      type: 'FeatureCollection',
      features: parcels.map((p: LandParcel) => ({
        type: 'Feature',
        properties: {
          parcelNumber: p.parcelNumber,
          state: p.state,
          district: p.district,
          village: p.village,
          areaHectares: p.areaHectares,
          category: p.landCategory,
          disputeStatus: p.disputeStatus,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [p.coordinates.map((c: [number, number]) => [c[1], c[0]])],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bhoomi_gis_parcels_spatial_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Advanced Spatial Query & Buffer Analysis</h3>
        </div>
        <button
          onClick={exportGeoJSON}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export GeoJSON</span>
        </button>
      </div>

      {/* Query Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6">
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Center Spatial Node</label>
          <select
            value={selectedCenter.name}
            onChange={(e) => {
              const found = centersList.find((c) => c.name === e.target.value);
              if (found) setSelectedCenter(found);
            }}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            {centersList.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-4">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
            <span>Buffer Radius</span>
            <span className="text-emerald-700 font-bold">{bufferRadiusKm} km</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={bufferRadiusKm}
            onChange={(e) => setBufferRadiusKm(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
          />
        </div>

        <div className="sm:col-span-2 flex items-end">
          <button
            onClick={runSpatialBufferQuery}
            disabled={isQuerying}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition"
          >
            {isQuerying ? 'Querying...' : 'Run Query'}
          </button>
        </div>
      </div>

      {/* Spatial Query Results */}
      {spatialResult && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
            <span>Spatial Audit Result:</span>
            <span>Total Land Impacted: {spatialResult.totalAreaHectares} Hectares</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Intersecting Projects</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {spatialResult.affectedProjects.length} Infrastructure Projects
              </span>
              <div className="mt-1 space-y-1">
                {spatialResult.affectedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="text-[11px] text-blue-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-red-500" />
                    <span>{p.name} ({p.riskLevel} Risk)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Overlapping Land Parcels</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {spatialResult.affectedParcels.length} Registered Khasra Parcels
              </span>
              <div className="mt-1 space-y-1">
                {spatialResult.affectedParcels.map((lp) => (
                  <div key={lp.id} className="text-[11px] text-slate-700">
                    • {lp.parcelNumber} ({lp.village}) — <strong>{lp.areaHectares} Ha</strong> [{lp.ownershipType}]
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
