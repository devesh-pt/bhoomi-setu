import React, { useState, useEffect } from 'react';
import { Search, MapPin, Layers, ChevronRight, Filter, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { LandParcel, VillageSearchResult } from '../../types';
import { BhoomiService } from '../../services/api';
import { LandInformationPanel } from './LandInformationPanel';

interface LandSearchViewProps {
  initialQuery?: string;
  onSelectParcelOnMap?: (parcel: LandParcel) => void;
  onEditByAdmin?: (parcel: LandParcel) => void;
}

export const LandSearchView: React.FC<LandSearchViewProps> = ({
  initialQuery = '',
  onSelectParcelOnMap,
  onEditByAdmin,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [villageSummary, setVillageSummary] = useState<VillageSearchResult | undefined>(undefined);
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleSearch(query);
  }, [query]);

  const handleSearch = async (q: string) => {
    setIsLoading(true);
    const res = await BhoomiService.searchLand(q);
    setParcels(res.parcels);
    setVillageSummary(res.villageSummary);
    setIsLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs uppercase tracking-wider">
            <Search className="w-4 h-4" />
            <span>National Cadastral & Land Parcel Search</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Land Records Search Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search by State, District, Tehsil, Village, City, Khasra Number, Survey Number, or Parcel ID.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Type Village name (e.g. Rampur, Tamnar), Khasra No (e.g. 402/1-A), Survey No, or Parcel ID (e.g. P101)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
          />
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Sample Searches:</span>
          {['Rampur', 'Tamnar', 'Bhadla', 'P101', 'P102', 'Khasra 402/1-A'].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 border border-slate-200 rounded-xl font-semibold shrink-0 transition"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Village Level Summary Card (When searching by village like "Rampur") */}
      {villageSummary && (
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 rounded-3xl shadow-xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              <span>Village Cadastral Summary</span>
            </span>
            <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">
              {villageSummary.totalParcels} Parcels Found
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Village</span>
              <span className="text-base font-black text-white">{villageSummary.village}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">District & State</span>
              <span className="text-sm font-bold text-slate-200">{villageSummary.district}, {villageSummary.state}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Cadastral Area</span>
              <span className="text-base font-black text-emerald-300">{villageSummary.totalAreaHectares} Hectares</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tehsil</span>
              <span className="text-sm font-bold text-slate-200">{villageSummary.tehsil}</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Parcels Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
          <span>Search Results ({parcels.length} Land Parcels)</span>
          <span>Click parcel card to view full record & usability</span>
        </div>

        {parcels.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs font-medium">
            No land parcels matching "{query}" found in the cadastral database. Try searching "Rampur" or "P101".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parcels.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedParcel(p)}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:border-blue-400 cursor-pointer transition space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 uppercase px-2 py-0.5 bg-blue-50 rounded border border-blue-200">
                      ID: {p.parcelNumber}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      Khasra No. {p.khasraNumber} ({p.village})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {p.tehsil}, {p.district}, {p.state}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[10px] font-black rounded-xl uppercase ${
                      p.usability.status === 'USABLE'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : p.usability.status === 'UNDER REVIEW'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : p.usability.status === 'RESTRICTED'
                        ? 'bg-orange-100 text-orange-900 border border-orange-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}
                  >
                    {p.usability.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Area</span>
                    <span className="font-extrabold text-slate-900">{p.areaHectares} Ha</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                    <span className="font-semibold text-slate-800">{p.landCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Legal Cases</span>
                    <span className={`font-bold ${p.legal.caseExists ? 'text-red-600' : 'text-emerald-600'}`}>
                      {p.legal.caseExists ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-blue-700 font-bold">
                  <span>View Land Information & AI Risk</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Parcel Detail Panel Modal */}
      {selectedParcel && (
        <LandInformationPanel
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onEditByAdmin={onEditByAdmin}
        />
      )}
    </div>
  );
};
