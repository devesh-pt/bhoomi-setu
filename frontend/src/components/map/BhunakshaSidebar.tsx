import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, Layers, Info, User, FileText, Download, Scale,
  ShieldAlert, CheckCircle2, ChevronDown, Sparkles, Filter, Eye, ChevronUp, Star, Trees
} from 'lucide-react';
import { api } from '../../services/api';
import { KhasraVivranModal } from '../bhuiyan/KhasraVivranModal';
import { ForestLossChart } from '../forest/ForestLossChart';
import { useToast } from '../ui/ToastContext';

interface BhunakshaSidebarProps {
  locationHierarchy: any[];
  selectedDistrict: string;
  selectedTehsil: string;
  selectedVillage: string;
  onSelectLocation: (district: string, tehsil: string, village: string, villageObj?: any) => void;
  selectedParcel: any | null;
  forestInfo?: any | null;
  onParcelSelect: (parcel: any) => void;
  onSearchKhasra: (khasraNo: string) => void;
  layerSettings: {
    basemap: 'satellite' | 'street';
    showLabels?: boolean;
    colorBy: 'land_type' | 'litigation' | 'mutation';
    showForests?: boolean;
    showParcels?: boolean;
    showHighways?: boolean;
    showLandTypeColors?: boolean;
  };
  onUpdateLayerSettings: (settings: any) => void;
  onCompareParcel?: (parcel: any) => void;
  onReportIssue?: (parcel: any) => void;
}

export const BhunakshaSidebar: React.FC<BhunakshaSidebarProps> = ({
  locationHierarchy,
  selectedDistrict,
  selectedTehsil,
  selectedVillage,
  onSelectLocation,
  selectedParcel,
  forestInfo,
  onParcelSelect,
  onSearchKhasra,
  layerSettings,
  onUpdateLayerSettings,
  onCompareParcel,
  onReportIssue
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'location' | 'plot' | 'forest' | 'layers'>('location');
  const [khasraInput, setKhasraInput] = useState('');
  const [isVivranOpen, setIsVivranOpen] = useState(false);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Switch to Plot or Forest tab automatically when selected
  useEffect(() => {
    if (forestInfo) {
      setActiveTab('forest');
      setIsMobileExpanded(true);
    } else if (selectedParcel) {
      setActiveTab('plot');
      setIsMobileExpanded(true);
    }
  }, [selectedParcel, forestInfo]);

  // Derived arrays from hierarchy
  const currentDistrictObj = locationHierarchy.find((d) => d.district === selectedDistrict) || locationHierarchy[0];
  const tehsilsList = currentDistrictObj?.tehsils || [];
  const currentTehsilObj = tehsilsList.find((t: any) => t.tehsil === selectedTehsil) || tehsilsList[0];
  const villagesList = currentTehsilObj?.villages || [];

  const handleDistrictChange = (dName: string) => {
    const dObj = locationHierarchy.find((d) => d.district === dName);
    const firstTehsil = dObj?.tehsils?.[0]?.tehsil || '';
    const firstVillageObj = dObj?.tehsils?.[0]?.villages?.[0];
    const firstVillage = firstVillageObj?.village || '';
    onSelectLocation(dName, firstTehsil, firstVillage, firstVillageObj);
  };

  const handleTehsilChange = (tName: string) => {
    const tObj = tehsilsList.find((t: any) => t.tehsil === tName);
    const firstVillageObj = tObj?.villages?.[0];
    const firstVillage = firstVillageObj?.village || '';
    onSelectLocation(selectedDistrict, tName, firstVillage, firstVillageObj);
  };

  const handleVillageChange = (vName: string) => {
    const vObj = villagesList.find((v: any) => v.village === vName);
    onSelectLocation(selectedDistrict, selectedTehsil, vName, vObj);
  };

  const handleKhasraSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (khasraInput.trim()) {
      onSearchKhasra(khasraInput.trim());
    }
  };

  const handleDownloadMapReport = async () => {
    if (!selectedParcel) return;
    setDownloadingReport(true);
    showToast("Generating Cadastral Map Report PDF...", "info");

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout generating Map Report PDF")), 15000)
    );

    try {
      await Promise.race([
        api.downloadMapReportPDF(selectedParcel.parcel_id, selectedParcel.khasra_no),
        timeoutPromise
      ]);
      showToast("Map Report PDF downloaded successfully!", "success");
    } catch (err: any) {
      console.error("Map Report PDF download failed", err);
      showToast("Failed to download Map Report PDF. Please retry.", "error");
    } finally {
      setDownloadingReport(false);
    }
  };

  const areaSqFt = selectedParcel?.area_sqm
    ? Math.round(selectedParcel.area_sqm * 10.7639)
    : Math.round((selectedParcel?.area_hectares || 1) * 107639);
  const totalMarketValLakhs = ((selectedParcel?.area_hectares || 1) * (selectedParcel?.market_value_per_ha || 15)).toFixed(2);

  return (
    <>
      {/* Container: Responsive Side Panel on Desktop / Bottom Sheet on Mobile */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-100 transition-all duration-300
        md:top-16 md:bottom-0 md:left-auto md:right-0 md:w-96 md:border-t-0 md:border-l md:border-slate-800 shadow-2xl flex flex-col
        ${isMobileExpanded ? 'h-[75vh]' : 'h-14 md:h-auto'}
      `}>
        {/* Mobile Header / Expand Toggle Bar */}
        <div
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="md:hidden px-4 py-3 bg-slate-950 flex justify-between items-center cursor-pointer border-b border-slate-800 shrink-0"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Bhunaksha Cadastral Control ({selectedVillage || 'Select Village'})</span>
          </div>
          <button className="text-slate-400 p-1">
            {isMobileExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>

        {/* 4-Tab Header Navigation */}
        <div className={`grid ${forestInfo ? 'grid-cols-4' : 'grid-cols-4'} bg-slate-950 border-b border-slate-800 shrink-0`}>
          <button
            onClick={() => { setActiveTab('location'); setIsMobileExpanded(true); }}
            className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition border-b-2 ${
              activeTab === 'location'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Location</span>
          </button>
          <button
            onClick={() => { setActiveTab('plot'); setIsMobileExpanded(true); }}
            className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition border-b-2 ${
              activeTab === 'plot'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Plot</span>
          </button>
          <button
            onClick={() => { setActiveTab('forest'); setIsMobileExpanded(true); }}
            className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition border-b-2 ${
              activeTab === 'forest'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forest {forestInfo && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />}</span>
          </button>
          <button
            onClick={() => { setActiveTab('layers'); setIsMobileExpanded(true); }}
            className={`py-3 text-[11px] font-bold flex items-center justify-center gap-1 transition border-b-2 ${
              activeTab === 'layers'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* TAB 1: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              {/* Cascading Dropdowns Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 pb-1 border-b border-slate-700/60">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Cadastral Hierarchy Selector</span>
                </div>

                {/* District Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    जिला / District
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {locationHierarchy.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.district_hi || d.district} ({d.district})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tehsil Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    तहसील / Tehsil
                  </label>
                  <select
                    value={selectedTehsil}
                    onChange={(e) => handleTehsilChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {tehsilsList.map((t: any) => (
                      <option key={t.tehsil} value={t.tehsil}>
                        {t.tehsil_hi || t.tehsil} ({t.tehsil})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    ग्राम / Village (Star ⭐ = Pilot Block)
                  </label>
                  <select
                    value={selectedVillage}
                    onChange={(e) => handleVillageChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    {villagesList.map((v: any) => (
                      <option key={v.village} value={v.village}>
                        {v.is_pilot ? '⭐ ' : ''}{v.village_hi || v.village} ({v.village}) [{v.parcel_count} parcels]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Plot Number Direct Search Input */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  <span>Search Plot / Khasra Number (खसरा खोजें)</span>
                </label>
                <form onSubmit={handleKhasraSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={khasraInput}
                    onChange={(e) => setKhasraInput(e.target.value)}
                    placeholder="e.g. 5, 12, 860/2..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs shadow transition"
                  >
                    Go
                  </button>
                </form>
              </div>

              {/* Pilot Village Block Quick Trigger */}
              <div className="bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Raipur Pilot Village (Semra ⭐)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Contains authentic cadastral parcels in Raipur district with complete revenue records and active mutation applications.
                </p>
                <button
                  onClick={() => {
                    handleDistrictChange('Raipur');
                    handleTehsilChange('Abhanpur');
                    handleVillageChange('Semra');
                  }}
                  className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-lg text-xs font-bold shadow transition"
                >
                  Load Semra Pilot Village ⭐
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PLOT INFO */}
          {activeTab === 'plot' && (
            <div className="space-y-4">
              {!selectedParcel ? (
                <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-800/40 rounded-xl border border-slate-800">
                  <MapPin className="w-8 h-8 text-slate-600 mx-auto animate-bounce" />
                  <p className="font-semibold">No parcel selected</p>
                  <p className="text-[11px] text-slate-500">Click any plot polygon on the map or type a khasra number in Location tab.</p>
                </div>
              ) : (
                <>
                  {/* Parcel Header Card */}
                  <div className="bg-slate-800/90 border border-slate-700/90 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>Khasra {selectedParcel.khasra_no}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-semibold">
                            Demo data
                          </span>
                          {selectedParcel.is_pilot && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold">
                              ⭐ Pilot
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedParcel.village_hi || selectedParcel.village}, {selectedParcel.tehsil || selectedParcel.district}, {selectedParcel.district}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        {selectedParcel.khata_no || 'KH-104'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row: Khasra Vivran & Map Report PDF */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsVivranOpen(true)}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Khasra Vivran</span>
                    </button>
                    <button
                      onClick={handleDownloadMapReport}
                      disabled={downloadingReport}
                      className="py-2 px-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingReport ? 'Generating...' : 'Map Report'}</span>
                    </button>
                  </div>

                  {/* 5th Schedule Tribal Protection Warning */}
                  {selectedParcel.tribal_sensitive && (
                    <div className="px-3 py-2 bg-purple-950/80 border border-purple-500/50 text-purple-200 rounded-xl text-xs font-semibold flex items-start gap-2 shadow-sm">
                      <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-purple-300 block">5th Schedule Tribal Land Protection</span>
                        <span className="text-[10px] text-purple-300/80 block mt-0.5">
                          Restricted transfer under Sec 170-B CG Land Revenue Code. Requires District Collector approval.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Ownership Details */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                      <User className="w-3.5 h-3.5 text-emerald-400" /> Recorded Owner Info
                    </span>
                    <div className="space-y-1.5 text-slate-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400">Owner Name:</span>
                        <div className="text-right">
                          <span className="font-bold text-emerald-300 block">{selectedParcel.owner_name}</span>
                          {selectedParcel.owner_name_hi && (
                            <span className="text-amber-300/90 font-medium block">{selectedParcel.owner_name_hi}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400">Father/Husband:</span>
                        <div className="text-right">
                          <span className="font-medium text-slate-200 block">{selectedParcel.father_name || 'N/A'}</span>
                          {selectedParcel.father_name_hi && (
                            <span className="text-slate-400 block">{selectedParcel.father_name_hi}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Area Breakdown (Hectare / Acre / Sq.Ft) */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <span className="font-semibold text-slate-200 block text-xs">📐 Area Measurements</span>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Hectares</span>
                        <span className="font-bold text-emerald-400 text-xs">{selectedParcel.area_hectares} ha</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Acres</span>
                        <span className="font-bold text-slate-200 text-xs">{selectedParcel.area_acres} ac</span>
                      </div>
                      <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Sq. Feet</span>
                        <span className="font-bold text-slate-200 text-xs">{areaSqFt.toLocaleString()} sq.ft</span>
                      </div>
                    </div>
                  </div>

                  {/* Classification & Valuation */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1.5">
                    <span className="font-semibold text-slate-200 block text-xs">🌾 Soil, Irrigation & Valuation</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Land Category</span>
                        <span className="font-bold text-slate-100">{selectedParcel.land_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Soil Type</span>
                        <span className="font-medium text-slate-200">{selectedParcel.soil_type || 'Matasi Soil'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Irrigation Source</span>
                        <span className="font-medium text-slate-200">{selectedParcel.irrigation_source || 'Mahanadi Canal'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Circle Rate (₹/ha)</span>
                        <span className="font-bold text-amber-400">₹{selectedParcel.circle_rate || 12.5} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Est. Market Value</span>
                        <span className="font-bold text-emerald-400">₹{totalMarketValLakhs} Lakhs</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Encumbrance / Loan</span>
                        <span className="font-semibold text-emerald-300">{selectedParcel.encumbrance_status || 'Nil / Unencumbered'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
                      <span className="text-[10px] text-slate-400 block">Mutation Status</span>
                      <span className="font-semibold text-emerald-400 text-xs">{selectedParcel.mutation_status || 'Mutated'}</span>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
                      <span className="text-[10px] text-slate-400 block">Litigation Status</span>
                      <span className={`font-semibold text-xs ${
                        (selectedParcel.litigation_status || selectedParcel.case_status) === 'pending' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {selectedParcel.litigation_status || selectedParcel.case_status || 'No dispute'}
                      </span>
                    </div>
                  </div>

                  {/* Compare & Report Issue */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onCompareParcel?.(selectedParcel)}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow transition"
                    >
                      <Scale className="w-3.5 h-3.5 text-amber-400" />
                      <span>Compare Plot</span>
                    </button>
                    <button
                      onClick={() => onReportIssue ? onReportIssue(selectedParcel) : showToast(`Report issue logged for Khasra ${selectedParcel.khasra_no}`, "info")}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 shadow transition"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Report Anomaly</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: FOREST INFO */}
          {activeTab === 'forest' && (
            <div className="space-y-4">
              {!forestInfo ? (
                <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-800/40 rounded-xl border border-slate-800">
                  <Trees className="w-8 h-8 text-emerald-500/70 mx-auto animate-pulse" />
                  <p className="font-semibold text-slate-200">No Forest Area Tapped</p>
                  <p className="text-[11px] text-slate-400 max-w-[250px] mx-auto">
                    Tap inside any of Chhattisgarh's 16 National Parks, Tiger Reserves, or Wildlife Sanctuaries on the map to inspect forest cover, clearance status & historical loss.
                  </p>
                </div>
              ) : (
                <>
                  {/* Forest Header Card */}
                  <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                          <span>{forestInfo.name}</span>
                        </h3>
                        {forestInfo.name_hi && (
                          <p className="text-xs font-semibold text-emerald-300 font-hindi">{forestInfo.name_hi}</p>
                        )}
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {forestInfo.district} District &bull; Chhattisgarh
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full shrink-0">
                        {forestInfo.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-1.5 py-0.5 rounded">
                        Demo data
                      </span>
                      {forestInfo.approximate && (
                        <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 font-medium px-1.5 py-0.5 rounded">
                          Approximate Boundary
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Forest Clearance Required Banner */}
                  {forestInfo.forest_clearance_required && (
                    <div className="px-3.5 py-2.5 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-md">
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-300 block text-xs">CRITICAL: Forest Clearance Required</span>
                        <span className="text-[10px] text-rose-200/90 block mt-0.5 leading-tight">
                          Subject to Forest Conservation Act 1980 & Wildlife Protection Act 1972. MoEFCC clearance mandatory.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Key Forest Metrics Grid */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                    <span className="font-semibold text-slate-200 block text-xs">📊 Ecological & Reserve Metrics</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Forest Area</span>
                        <span className="font-bold text-emerald-400 text-xs">{forestInfo.area_km2} km²</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Canopy Density</span>
                        <span className="font-bold text-slate-200 text-xs">{forestInfo.canopy_density}</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Eco Buffer</span>
                        <span className="font-bold text-amber-300 text-xs">{forestInfo.eco_sensitive_buffer_km} km</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">FRA Claims</span>
                        <span className="font-bold text-purple-300 text-xs">{forestInfo.fra_claims_count}</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Est. Trees</span>
                        <span className="font-bold text-slate-200 text-xs">{(forestInfo.estimated_tree_count / 1000).toFixed(0)}k</span>
                      </div>
                      <div className="bg-slate-900/70 p-2 rounded-lg border border-slate-700/50">
                        <span className="block text-slate-400 text-[10px]">Carbon Stock</span>
                        <span className="font-bold text-emerald-300 text-xs">{(forestInfo.carbon_stock_estimate_tons / 1000).toFixed(0)}k t</span>
                      </div>
                    </div>

                    {forestInfo.elephant_corridor && (
                      <div className="mt-2 p-2 bg-amber-950/60 border border-amber-500/40 rounded-lg flex items-center justify-between text-amber-200 text-[11px] font-bold">
                        <span>🐘 Active Elephant Corridor Route</span>
                        <span className="px-1.5 py-0.5 bg-amber-500/20 rounded border border-amber-400/40 text-[9px]">High Protection</span>
                      </div>
                    )}
                  </div>

                  {/* Species & Wildlife Card */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">Flora / Main Tree Species</span>
                      <span className="font-bold text-emerald-300">{forestInfo.main_species}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-700/50">
                      <span className="text-slate-400 block text-[10px] font-semibold">Fauna / Key Wildlife</span>
                      <span className="font-medium text-slate-200">{forestInfo.wildlife}</span>
                    </div>
                  </div>

                  {/* Historical Loss Time Series SVG Chart */}
                  <ForestLossChart data={forestInfo.loss_time_series || []} forestName={forestInfo.name} />
                </>
              )}
            </div>
          )}

          {/* TAB 4: LAYERS */}
          {activeTab === 'layers' && (
            <div className="space-y-4">
              {/* Basemap Switcher */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">🗺️ Basemap Selection</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateLayerSettings({ ...layerSettings, basemap: 'satellite' })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                      layerSettings.basemap === 'satellite'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🛰️ Satellite Layer
                  </button>
                  <button
                    onClick={() => onUpdateLayerSettings({ ...layerSettings, basemap: 'street' })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                      layerSettings.basemap === 'street'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow'
                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🗺️ Street Map
                  </button>
                </div>
              </div>

              {/* Map Layer Toggles */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-3">
                <span className="font-bold text-slate-200 block text-xs">👁️ GIS Layer Visibility</span>
                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <span className="font-semibold text-slate-200 text-xs">Cadastral Parcels</span>
                    <input
                      type="checkbox"
                      checked={!!layerSettings.showParcels}
                      onChange={(e) => onUpdateLayerSettings({ ...layerSettings, showParcels: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block">Highways (NH/SH)</span>
                      <span className="text-[10px] text-slate-400">Labeled corridor polylines</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={layerSettings.showHighways !== false}
                      onChange={(e) => onUpdateLayerSettings({ ...layerSettings, showHighways: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <span className="font-semibold text-slate-200 text-xs">Forest Reserves (FCA 1980)</span>
                    <input
                      type="checkbox"
                      checked={!!layerSettings.showForests}
                      onChange={(e) => onUpdateLayerSettings({ ...layerSettings, showForests: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/50">
                    <div>
                      <span className="font-semibold text-slate-200 text-xs block">Land-Type Colors</span>
                      <span className="text-[10px] text-slate-400">Color fill by category</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!!layerSettings.showLandTypeColors}
                      onChange={(e) => onUpdateLayerSettings({ ...layerSettings, showLandTypeColors: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Plot Color Mode Selector */}
              {layerSettings.showLandTypeColors && (
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5 animate-fadeIn">
                  <span className="font-bold text-slate-200 block text-xs">🎨 Color Code Parcels By</span>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
                      <input
                        type="radio"
                        name="colorBy"
                        checked={layerSettings.colorBy === 'land_type'}
                        onChange={() => onUpdateLayerSettings({ ...layerSettings, colorBy: 'land_type' })}
                        className="accent-emerald-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Land Category (कृषि / बंजर / आवासीय)</span>
                        <span className="text-[10px] text-slate-400">Green = Irrigated, Lime = Rainfed, Amber = Banjar</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
                      <input
                        type="radio"
                        name="colorBy"
                        checked={layerSettings.colorBy === 'litigation'}
                        onChange={() => onUpdateLayerSettings({ ...layerSettings, colorBy: 'litigation' })}
                        className="accent-emerald-500"
                      />
                      <div>
                        <span className="font-semibold text-slate-200 block">Revenue Court Dispute Status</span>
                        <span className="text-[10px] text-slate-400">Red = Active Dispute/Stay, Green = No Dispute</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Khasra Vivran Printable Extract Modal */}
      <KhasraVivranModal
        isOpen={isVivranOpen}
        onClose={() => setIsVivranOpen(false)}
        parcel={selectedParcel}
      />
    </>
  );
};
