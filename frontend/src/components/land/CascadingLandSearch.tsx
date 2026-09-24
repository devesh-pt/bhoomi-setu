import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Mic, MapPin, Filter, X, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { VoiceSearchButton } from '../common/VoiceSearchButton';

interface CascadingLandSearchProps {
  onSelectParcel: (parcel: any) => void;
  onOpenKhatauni?: (khataNo: string) => void;
  onOpenKhasra?: (parcelId: string) => void;
}

export const CascadingLandSearch: React.FC<CascadingLandSearchProps> = ({
  onSelectParcel,
  onOpenKhatauni,
  onOpenKhasra
}) => {
  const { t } = useTranslation();
  
  // Cascading dropdown state
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Raipur');
  const [selectedTehsil, setSelectedTehsil] = useState<string>('ALL');
  const [selectedRI, setSelectedRI] = useState<string>('ALL');
  const [selectedVillage, setSelectedVillage] = useState<string>('ALL');
  const [khasraInput, setKhasraInput] = useState<string>('');
  const [ownerInput, setOwnerInput] = useState<string>('');
  const [khataInput, setKhataInput] = useState<string>('');

  // Global search input & results
  const [globalQuery, setGlobalQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const districts = [
    'Raipur', 'Bilaspur', 'Durg', 'Bastar', 'Surguja', 'Janjgir-Champa',
    'Korba', 'Rajnandgaon', 'Dhamtari', 'Mahasamund', 'Kanker', 'Kabirdham',
    'Jashpur', 'Koriya', 'Raigarh', 'Gariaband', 'Balod', 'Bemetara',
    'Baloda Bazar', 'Mungeli', 'Kondagaon', 'Narayanpur', 'Dantewada',
    'Sukma', 'Bijapur', 'Surajpur', 'Balrampur', 'Gaurela-Pendra-Marwahi',
    'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki',
    'Sarangarh-Bilaigarh', 'Sakti', 'Khairagarh-Chhuikhadan-Gandai'
  ];

  const tehsilsMap: Record<string, string[]> = {
    Raipur: ['Abhanpur', 'Arang', 'Raipur', 'Tilda Newra'],
    Bilaspur: ['Bilaspur', 'Bodhri', 'Kota', 'Masturi', 'Takhatpur'],
    Durg: ['Durg', 'Dhamdha', 'Patan'],
    Bastar: ['Jagdalpur', 'Bastanar', 'Bhanpuri', 'Lohandiguda'],
    Surguja: ['Ambikapur', 'Batauli', 'Lundra', 'Sitapur']
  };

  const villagesMap: Record<string, string[]> = {
    Abhanpur: ['Abhanpur Village', 'Hasda', 'Khurpa', 'Naya Raipur Corridor'],
    Arang: ['Arang Gram', 'Bhanpuri', 'Gullu'],
    Durg: ['Bhilai Rural', 'Durg Khas', 'Anda'],
    Jagdalpur: ['Asna', 'Jagdalpur Town', 'Karanpur']
  };

  useEffect(() => {
    executeSearch();
  }, [selectedDistrict, selectedTehsil, selectedVillage]);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const res = await api.getParcels({
        district: selectedDistrict,
        tehsil: selectedTehsil !== 'ALL' ? selectedTehsil : undefined,
        village: selectedVillage !== 'ALL' ? selectedVillage : undefined,
        size: 50
      });
      setResults(res.items || []);
    } catch (err) {
      console.error('Cascading search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params: any = { size: 50 };
      if (selectedDistrict !== 'ALL') params.district = selectedDistrict;
      if (selectedTehsil !== 'ALL') params.tehsil = selectedTehsil;
      if (selectedVillage !== 'ALL') params.village = selectedVillage;
      if (khasraInput.trim()) params.khasra_no = khasraInput.trim();
      if (ownerInput.trim()) params.owner_name = ownerInput.trim();
      if (khataInput.trim()) params.khata_no = khataInput.trim();
      if (globalQuery.trim()) params.q = globalQuery.trim();

      const res = await api.getParcels(params);
      setResults(res.items || []);
    } catch (err) {
      console.error('Custom search error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceResult = (text: string) => {
    setGlobalQuery(text);
    api.searchParcels(text).then((data) => setResults(data || []));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 text-slate-100 shadow-xl space-y-5">
      {/* Top Header & Voice Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <span>Land Record Search (Bhuiyan Portal Parity)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cascading district, tehsil, RI, village, owner & khasra search across 33 Chhattisgarh districts
          </p>
        </div>

        {/* Global Autocomplete & Hindi Voice Search */}
        <div className="flex items-center gap-2 w-full md:w-auto min-w-[320px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search Owner, Khasra, Khata No..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <VoiceSearchButton onResult={handleVoiceResult} />
        </div>
      </div>

      {/* Cascading Filter Controls Grid */}
      <form onSubmit={handleCustomSearchSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* District Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">1. District (ज़िला)</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedTehsil('ALL');
                setSelectedVillage('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Tehsil Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">2. Tehsil (तहसील)</label>
            <select
              value={selectedTehsil}
              onChange={(e) => {
                setSelectedTehsil(e.target.value);
                setSelectedVillage('ALL');
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500"
            >
              <option value="ALL">All Tehsils</option>
              {(tehsilsMap[selectedDistrict] || ['Abhanpur', 'Mainpur', 'Dhamtari Khas']).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* RI Circle */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">3. RI Circle (रा.नि. मण्डल)</label>
            <select
              value={selectedRI}
              onChange={(e) => setSelectedRI(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500"
            >
              <option value="ALL">All RI Circles (RI-01, RI-02)</option>
              <option value="RI-01">RI Circle 01 (Central)</option>
              <option value="RI-02">RI Circle 02 (North)</option>
            </select>
          </div>

          {/* Village Select */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">4. Village (ग्राम)</label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:border-emerald-500"
            >
              <option value="ALL">All Villages</option>
              {(villagesMap[selectedTehsil] || ['Hasda', 'Abhanpur Village', 'Khurpa']).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Inputs: Khasra, Khata, Owner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <input
              type="text"
              value={khasraInput}
              onChange={(e) => setKhasraInput(e.target.value)}
              placeholder="Khasra No (खसरा नं.) e.g. 183/2"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={khataInput}
              onChange={(e) => setKhataInput(e.target.value)}
              placeholder="Khata No (खाता नं.) e.g. KH-104"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500"
            />
          </div>
          <div>
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              placeholder="Owner Name (भूमिस्वामी नाम)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching Records...' : 'Execute Search'}</span>
          </button>
        </div>
      </form>

      {/* Results Table */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>Found <strong>{(Array.isArray(results) ? results : (results as any)?.items || []).length}</strong> matching land record(s)</span>
          <span className="text-emerald-400 font-medium">Bhuiyan Adapter: ACTIVE (Demo Mode)</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Khasra / Khata</th>
                <th className="p-3">Bhumiswami Owner</th>
                <th className="p-3">Village / Tehsil</th>
                <th className="p-3">Area (ha)</th>
                <th className="p-3">Land Category</th>
                <th className="p-3 text-right">Quick Extracts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {(Array.isArray(results) ? results : (results as any)?.items || []).slice(0, 15).map((p: any, idx: number) => (
                <tr key={p.parcel_id || p.id || idx} className="hover:bg-slate-800/60 transition">
                  <td className="p-3 font-bold text-white">
                    <div>{p.khasra_no}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.khata_no || 'KH-104'}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-emerald-300">{p.owner_name}</div>
                    <div className="text-[10px] text-slate-400">{p.father_name || 'Ramanathan S.'}</div>
                  </td>
                  <td className="p-3">
                    <div>{p.village}</div>
                    <div className="text-[10px] text-slate-400">{p.tehsil || p.district}, {p.district}</div>
                  </td>
                  <td className="p-3 font-mono font-bold text-amber-400">
                    {p.area_hectares} ha
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] uppercase font-semibold">
                      {p.land_type}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1.5">
                    <button
                      onClick={() => onSelectParcel(p)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      Map View
                    </button>
                    <button
                      onClick={() => onOpenKhatauni?.(p.khata_no || 'KH-104')}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-semibold transition"
                    >
                      B-1 Khatauni
                    </button>
                    <button
                      onClick={() => onOpenKhasra?.(p.parcel_id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-semibold transition"
                    >
                      P-II Khasra
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
