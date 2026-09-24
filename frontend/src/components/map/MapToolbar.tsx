import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Layers, Ruler, Route, Trees, Scale, Filter, Eye, X,
  FileSpreadsheet, FileText, CheckCircle2, ChevronDown, Compass
} from 'lucide-react';
import { api } from '../../services/api';

interface MapToolbarProps {
  onSearchSelect: (parcel: any) => void;
  onFilterChange: (filters: any) => void;
  onLayerChange: (layers: any) => void;
  onToolSelect: (tool: string | null) => void;
  activeTool: string | null;
  districtsList: string[];
  compareParcels: any[];
  onRemoveCompare: (id: string) => void;
  onOpenCompareModal: () => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  onSearchSelect,
  onFilterChange,
  onLayerChange,
  onToolSelect,
  activeTool,
  districtsList,
  compareParcels,
  onRemoveCompare,
  onOpenCompareModal
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Layer Opacities
  const [layers, setLayers] = useState({
    osm: true,
    satellite: false,
    landUse: true,
    forestCover: true,
    highways: true,
    districtBoundaries: true,
    opacityLandUse: 0.6,
    opacityForest: 0.5
  });

  // Filters
  const [filters, setFilters] = useState({
    district: 'ALL',
    landType: 'ALL',
    litigationStatus: 'ALL',
    sizeMin: 0,
    sizeMax: 50
  });

  // Forest Timeline Year
  const [forestYear, setForestYear] = useState<number>(2024);

  const handleSearchInput = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const results = await api.searchParcels(val);
        setSearchResults(results || []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = (parcel: any) => {
    onSearchSelect(parcel);
    setSearchQuery(`${parcel.khasra_no} - ${parcel.village} (${parcel.district})`);
    setSearchResults([]);
  };

  const updateLayers = (newLayers: any) => {
    setLayers(newLayers);
    onLayerChange(newLayers);
  };

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col gap-3">
      {/* Top Main Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto">
        {/* Search Bar with Autocomplete */}
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Search Khasra No, Khata, Owner Name, Village or District..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl text-white text-xs shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 text-xs">
              {searchResults.map((item) => (
                <button
                  key={item.parcel_id}
                  onClick={() => handleSelectResult(item)}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/80 border-b border-slate-800/60 last:border-0 flex justify-between items-center transition"
                >
                  <div>
                    <span className="font-bold text-white block">
                      {item.khasra_no} ({item.khata_no || 'KH-104'}) — {item.owner_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.village}, Tehsil {item.tehsil || item.district}, {item.district}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                    {item.area_hectares} ha
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-1 rounded-xl shadow-2xl text-xs">
          {/* Layer Switcher Button */}
          <button
            onClick={() => { setShowLayerMenu(!showLayerMenu); setShowFilterMenu(false); }}
            className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              showLayerMenu ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" /> Layers
          </button>

          {/* Filters Button */}
          <button
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowLayerMenu(false); }}
            className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              showFilterMenu ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4 text-sky-400" /> Filters
          </button>

          {/* Measure Tool */}
          <button
            onClick={() => onToolSelect(activeTool === 'measure' ? null : 'measure')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeTool === 'measure' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-4 h-4 text-amber-400" /> Measure
          </button>

          {/* Forest Timeline Slider Tool */}
          <button
            onClick={() => onToolSelect(activeTool === 'forest_timeline' ? null : 'forest_timeline')}
            className={`px-3 py-2 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeTool === 'forest_timeline' ? 'bg-green-700 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trees className="w-4 h-4 text-green-400" /> Forest 5-Yr Timeline
          </button>
        </div>

        {/* Compare Drawer Button */}
        {compareParcels.length > 0 && (
          <button
            onClick={onOpenCompareModal}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-2xl flex items-center gap-1.5 animate-bounce"
          >
            <Scale className="w-4 h-4" /> Compare ({compareParcels.length}/3)
          </button>
        )}
      </div>

      {/* Layer Switcher Popover */}
      {showLayerMenu && (
        <div className="pointer-events-auto max-w-sm bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Map Layers & Opacity
            </span>
            <button onClick={() => setShowLayerMenu(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>OpenStreetMap Basemap</span>
              <input
                type="checkbox"
                checked={layers.osm}
                onChange={(e) => updateLayers({ ...layers, osm: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>ESA WorldCover Land Use Layer</span>
              <input
                type="checkbox"
                checked={layers.landUse}
                onChange={(e) => updateLayers({ ...layers, landUse: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
            </label>
            {layers.landUse && (
              <div className="pl-4 space-y-1">
                <span className="text-[10px] text-slate-400">Land Use Opacity</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={layers.opacityLandUse}
                  onChange={(e) => updateLayers({ ...layers, opacityLandUse: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>
            )}

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>Forest Survey of India / Hansen Canopy Cover</span>
              <input
                type="checkbox"
                checked={layers.forestCover}
                onChange={(e) => updateLayers({ ...layers, forestCover: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between text-slate-300 cursor-pointer">
              <span>33 Chhattisgarh District Boundaries</span>
              <input
                type="checkbox"
                checked={layers.districtBoundaries}
                onChange={(e) => updateLayers({ ...layers, districtBoundaries: e.target.checked })}
                className="accent-emerald-500 rounded"
              />
            </label>
          </div>
        </div>
      )}

      {/* Filter Menu Popover */}
      {showFilterMenu && (
        <div className="pointer-events-auto max-w-md bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-2xl space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-sky-400" /> Filter Parcels Across Chhattisgarh
            </span>
            <button onClick={() => setShowFilterMenu(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* District Selector */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">District</label>
              <select
                value={filters.district}
                onChange={(e) => updateFilters({ ...filters, district: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
              >
                <option value="ALL">All 33 Districts</option>
                {districtsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Land Type Selector */}
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Land Type</label>
              <select
                value={filters.landType}
                onChange={(e) => updateFilters({ ...filters, landType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-2"
              >
                <option value="ALL">All Types</option>
                <option value="AGRICULTURAL">Agricultural</option>
                <option value="BANJAR">Banjar (Barren)</option>
                <option value="FOREST">Forest</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="GOVERNMENT">Government</option>
              </select>
            </div>
          </div>

          {/* Litigation Status Filter */}
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">Litigation Status</label>
            <div className="flex gap-2">
              {['ALL', 'none', 'pending', 'disposed'].map((st) => (
                <button
                  key={st}
                  onClick={() => updateFilters({ ...filters, litigationStatus: st })}
                  className={`flex-1 py-1.5 rounded border text-center uppercase font-bold text-[10px] transition ${
                    filters.litigationStatus === st
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forest Timeline Slider Overlay Bar */}
      {activeTool === 'forest_timeline' && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-green-500/40 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 max-w-xl">
          <div className="flex justify-between items-center text-green-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Trees className="w-4 h-4 text-green-400" /> Forest Cover Timeline Comparison: {forestYear}
            </span>
            <button onClick={() => onToolSelect(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <input
            type="range"
            min="2019"
            max="2024"
            step="1"
            value={forestYear}
            onChange={(e) => setForestYear(Number(e.target.value))}
            className="w-full accent-green-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>2019 (Baseline)</span>
            <span>2020</span>
            <span>2021</span>
            <span>2022</span>
            <span>2023</span>
            <span className="text-green-400 font-bold">2024 (Latest FSI)</span>
          </div>
        </div>
      )}
    </div>
  );
};
