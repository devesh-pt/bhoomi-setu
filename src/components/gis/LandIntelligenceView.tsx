import React, { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Layers,
  Search,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eye,
  CheckSquare,
  Square,
  X,
  Compass,
  Filter,
  ExternalLink,
  Globe,
  MapPin
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import { Project, LandParcel } from '../../types';
import { BhoomiService } from '../../services/api';
import { AdvancedGISTools } from './AdvancedGISTools';
import { LandInformationPanel } from '../land/LandInformationPanel';

// Fix default Leaflet icon paths in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Color indicators according to prompt Feature 4:
// Green = Usable, Yellow = Under Review, Orange = Restricted, Red = Not Usable, Blue = Under Acquisition
const getUsabilityColor = (usabilityStatus: string, acquisitionRequired: boolean) => {
  if (acquisitionRequired) return '#3b82f6'; // Blue = Under Acquisition
  switch (usabilityStatus) {
    case 'USABLE':
      return '#10b981'; // Green
    case 'UNDER REVIEW':
      return '#f59e0b'; // Yellow
    case 'RESTRICTED':
      return '#f97316'; // Orange
    case 'NOT USABLE':
      return '#ef4444'; // Red
    default:
      return '#10b981';
  }
};

const createParcelMarkerIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface LandIntelligenceViewProps {
  onSelectProjectDetail: (projectId: string) => void;
}

export const LandIntelligenceView: React.FC<LandIntelligenceViewProps> = ({ onSelectProjectDetail }) => {
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [usabilityFilter, setUsabilityFilter] = useState<string>('All');
  const [acquisitionFilter, setAcquisitionFilter] = useState<string>('All');
  const [legalFilter, setLegalFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mapMode, setMapMode] = useState<'google-hybrid' | 'google-satellite' | 'google-roadmap' | 'google-terrain' | 'osm'>('google-hybrid');
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);

  // GIS Layer controls state
  const [layers, setLayers] = useState({
    landUse: true,
    infrastructure: true,
    roads: true,
    railways: true,
    waterBodies: true,
    forestAreas: true,
    acquisitionProjects: true,
    riskZones: true,
  });

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    const pList = await BhoomiService.getLandParcels();
    setParcels(pList);
    const projList = await BhoomiService.getProjects();
    setProjects(projList);
  };

  const toggleLayer = (layerKey: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const filteredParcels = parcels.filter((p) => {
    if (selectedState !== 'All' && p.state !== selectedState) return false;
    if (selectedDistrict !== 'All' && p.district !== selectedDistrict) return false;
    if (usabilityFilter !== 'All' && p.usability.status !== usabilityFilter) return false;
    if (acquisitionFilter !== 'All') {
      const isReq = acquisitionFilter === 'Required';
      if (p.acquisition.acquisitionRequired !== isReq) return false;
    }
    if (legalFilter !== 'All') {
      const hasCase = legalFilter === 'Case Exists';
      if (p.legal.caseExists !== hasCase) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.parcelNumber.toLowerCase().includes(q) ||
        p.khasraNumber.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col lg:flex-row overflow-hidden bg-slate-100">
      {/* Sidebar Controls Panel */}
      <div className="w-full lg:w-96 bg-white border-r border-slate-200 p-5 flex flex-col justify-between overflow-y-auto shrink-0 shadow-sm z-20">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-lg">
              <Compass className="w-5 h-5" />
              <h2>GIS Land Intelligence</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Geospatial land use audits & project overlay controls
            </p>
          </div>

          {/* Search Location Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Khasra, Village, Parcel ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Filters Bar */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-blue-700" />
              <span>Map Filters</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Usability</label>
                <select
                  value={usabilityFilter}
                  onChange={(e) => setUsabilityFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="All">All Usability</option>
                  <option value="USABLE">🟢 Usable</option>
                  <option value="UNDER REVIEW">🟡 Under Review</option>
                  <option value="RESTRICTED">🟠 Restricted</option>
                  <option value="NOT USABLE">🔴 Not Usable</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Acquisition</label>
                <select
                  value={acquisitionFilter}
                  onChange={(e) => setAcquisitionFilter(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="All">All Stages</option>
                  <option value="Required">🔵 Acquisition Required</option>
                  <option value="Not Required">Not Required</option>
                </select>
              </div>
            </div>
          </div>

          {/* Map Layer Control Panel */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-700" />
                GIS Spatial Layers
              </span>
              <span className="text-[10px] text-blue-700 font-bold">8 Active</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              {Object.entries(layers).map(([key, isChecked]) => {
                const labels: Record<string, string> = {
                  landUse: 'Land Parcels',
                  infrastructure: 'Infrastructure',
                  roads: 'Roads Network',
                  railways: 'Railways',
                  waterBodies: 'Water Bodies',
                  forestAreas: 'Forest Cover',
                  acquisitionProjects: 'Acquisition',
                  riskZones: 'Risk Zones',
                };
                return (
                  <button
                    key={key}
                    onClick={() => toggleLayer(key as any)}
                    className={`flex items-center space-x-2 p-1.5 rounded-lg border text-left transition ${
                      isChecked
                        ? 'bg-blue-50 border-blue-200 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-500'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[11px] truncate">{labels[key]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Maps View Engine Mode Switcher */}
          <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Google Maps Engine
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded border border-emerald-700/60">
                HD GEOSPATIAL
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
              <button
                onClick={() => setMapMode('google-hybrid')}
                className={`p-2 rounded-xl font-bold text-left border transition flex items-center justify-between ${
                  mapMode === 'google-hybrid'
                    ? 'bg-blue-600 border-blue-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>🛰️ Hybrid</span>
                {mapMode === 'google-hybrid' && <span className="text-[9px] bg-white text-blue-900 px-1 rounded font-black">ACTIVE</span>}
              </button>

              <button
                onClick={() => setMapMode('google-satellite')}
                className={`p-2 rounded-xl font-bold text-left border transition flex items-center justify-between ${
                  mapMode === 'google-satellite'
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>🌍 Satellite</span>
                {mapMode === 'google-satellite' && <span className="text-[9px] bg-white text-emerald-900 px-1 rounded font-black">ACTIVE</span>}
              </button>

              <button
                onClick={() => setMapMode('google-roadmap')}
                className={`p-2 rounded-xl font-bold text-left border transition flex items-center justify-between ${
                  mapMode === 'google-roadmap'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>🗺️ Roadmap</span>
                {mapMode === 'google-roadmap' && <span className="text-[9px] bg-white text-indigo-900 px-1 rounded font-black">ACTIVE</span>}
              </button>

              <button
                onClick={() => setMapMode('google-terrain')}
                className={`p-2 rounded-xl font-bold text-left border transition flex items-center justify-between ${
                  mapMode === 'google-terrain'
                    ? 'bg-amber-600 border-amber-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>⛰️ Terrain</span>
                {mapMode === 'google-terrain' && <span className="text-[9px] bg-white text-amber-900 px-1 rounded font-black">ACTIVE</span>}
              </button>
            </div>

            <button
              onClick={() => setMapMode('osm')}
              className={`w-full py-1 text-[10px] text-center font-semibold text-slate-400 hover:text-slate-200 transition ${
                mapMode === 'osm' ? 'underline font-bold text-blue-400' : ''
              }`}
            >
              Switch to OpenStreetMap Vector
            </button>
          </div>

          {/* Advanced Spatial Analysis GIS Tools */}
          <AdvancedGISTools onSelectProject={onSelectProjectDetail} />
        </div>
      </div>

      {/* Main Map Container Canvas */}
      <div className="flex-1 relative h-full bg-slate-900">
        <MapContainer
          center={[21.5, 78.5]}
          zoom={5}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {mapMode === 'google-hybrid' && (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapMode === 'google-satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapMode === 'google-roadmap' && (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapMode === 'google-terrain' && (
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com" target="_blank" rel="noreferrer">Google Maps</a>'
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapMode === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          {/* Render Clickable Land Parcel Markers */}
          {filteredParcels.map((lp) => {
            const color = getUsabilityColor(lp.usability.status, lp.acquisition.acquisitionRequired);
            return (
              <Marker
                key={lp.id}
                position={[lp.center.lat, lp.center.lng]}
                icon={createParcelMarkerIcon(color)}
                eventHandlers={{
                  click: () => setSelectedParcel(lp),
                }}
              >
                <Popup>
                  <div className="p-1 max-w-xs select-none space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-blue-800">Parcel {lp.parcelNumber}</div>
                    <h4 className="text-xs font-bold text-slate-900">Khasra {lp.khasraNumber} ({lp.village})</h4>
                    <p className="text-[11px] text-slate-600">{lp.district}, {lp.state}</p>
                    <div className="text-[10px] font-bold" style={{ color }}>
                      Usability: {lp.usability.status}
                    </div>
                    <div className="pt-1 space-y-1">
                      <button
                        onClick={() => setSelectedParcel(lp)}
                        className="w-full py-1 bg-blue-900 text-white font-bold rounded text-xs text-center block"
                      >
                        Open Land Information Panel
                      </button>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${lp.center.lat},${lp.center.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] text-center flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in Google Maps</span>
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Polygon Boundaries */}
          {layers.landUse &&
            filteredParcels.map((lp) => {
              const color = getUsabilityColor(lp.usability.status, lp.acquisition.acquisitionRequired);
              return (
                <Polygon
                  key={`poly-${lp.id}`}
                  positions={lp.coordinates as any}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.35,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedParcel(lp),
                  }}
                />
              );
            })}
        </MapContainer>

        {/* Floating Map Usability Legend */}
        <div className="absolute top-4 right-4 bg-slate-900/90 text-white p-3.5 rounded-2xl backdrop-blur border border-slate-800 text-xs shadow-xl pointer-events-none z-[1000] space-y-1">
          <div className="font-bold text-slate-200 mb-1">Parcel Usability Color Codes</div>
          <div className="flex items-center space-x-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>🟢 Usable</span></div>
          <div className="flex items-center space-x-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span>🟡 Under Review</span></div>
          <div className="flex items-center space-x-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span>🟠 Restricted</span></div>
          <div className="flex items-center space-x-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span>🔴 Not Usable</span></div>
          <div className="flex items-center space-x-2 text-[11px]"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span>🔵 Under Acquisition</span></div>
        </div>
      </div>

      {/* Selected Land Parcel Information Panel Modal */}
      {selectedParcel && (
        <LandInformationPanel
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
        />
      )}
    </div>
  );
};
