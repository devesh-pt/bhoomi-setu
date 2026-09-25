const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
const BASE_PATH = (import.meta as any).env?.BASE_URL || '/';

export const isDemoMode = (): boolean => {
  const envDemo = (import.meta as any).env?.VITE_DEMO_MODE;
  if (envDemo === 'true' || envDemo === true) return true;
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') return true;
  }
  return false;
};

// Cached static demo data loader
const demoCache: Record<string, any> = {};

async function fetchDemoJson(fileName: string): Promise<any> {
  if (demoCache[fileName]) return demoCache[fileName];
  const basePath = (import.meta as any).env?.BASE_URL || '/';
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const cleanPath = `${normalizedBase}demo-data/${fileName}`;
  try {
    const res = await fetch(cleanPath);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    demoCache[fileName] = data;
    return data;
  } catch (err) {
    console.warn(`[Demo Mode] Could not fetch ${fileName} from ${cleanPath}, using in-memory fallbacks`, err);
    return null;
  }
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response;
}

export const api = {
  login: async (credentials: any) => {
    if (isDemoMode()) {
      const demoUser = {
        id: 'u-admin',
        username: credentials?.username || 'admin',
        role: credentials?.username === 'citizen' ? 'public' : credentials?.username === 'officer' ? 'official' : 'official',
        full_name: 'Demo Revenue Officer (CG)',
        district: 'Raipur'
      };
      return {
        access_token: 'demo_access_token_sih2026',
        token_type: 'bearer',
        user: demoUser
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      return res.json();
    } catch (err) {
      console.warn('Backend login failed, using demo fallback authentication');
      return {
        access_token: 'demo_access_token_sih2026',
        token_type: 'bearer',
        user: { id: 'u-admin', username: credentials?.username || 'admin', role: 'official', full_name: 'Demo Revenue Officer' }
      };
    }
  },

  getMe: async () => {
    if (isDemoMode()) {
      return { id: 'u-admin', username: 'admin', role: 'official', full_name: 'Demo Revenue Officer', district: 'Raipur' };
    }
    try {
      const res = await fetchWithAuth('/api/v1/auth/me');
      return res.json();
    } catch {
      return { id: 'u-admin', username: 'admin', role: 'official', full_name: 'Demo Revenue Officer', district: 'Raipur' };
    }
  },

  getParcels: async (params: Record<string, any> = {}, options: RequestInit = {}) => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('parcels.json');
      let items: any[] = data?.items || [];
      if (params.village) {
        items = items.filter((p: any) => p.village?.toLowerCase() === params.village.toLowerCase());
      }
      if (params.district) {
        items = items.filter((p: any) => p.district?.toLowerCase() === params.district.toLowerCase());
      }
      if (params.khasra_no) {
        items = items.filter((p: any) => p.khasra_no === params.khasra_no);
      }
      const size = params.size ? parseInt(params.size) : 100;
      return { total: items.length, items: items.slice(0, size) };
    }
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetchWithAuth(`/api/v1/parcels?${query}`, options);
      return res.json().catch(() => ({ total: 0, items: [] }));
    } catch {
      const data = await fetchDemoJson('parcels.json');
      return { total: data?.items?.length || 0, items: data?.items?.slice(0, 50) || [] };
    }
  },

  searchParcels: async (q: string) => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('parcels.json');
      const items: any[] = data?.items || [];
      const query = q.toLowerCase().trim();
      const matched = items.filter((p: any) =>
        (p.khasra_no && p.khasra_no.toLowerCase().includes(query)) ||
        (p.owner_name && p.owner_name.toLowerCase().includes(query)) ||
        (p.village && p.village.toLowerCase().includes(query))
      );
      return matched.slice(0, 20);
    }
    try {
      const res = await fetchWithAuth(`/api/v1/parcels/search?q=${encodeURIComponent(q)}`);
      return res.json();
    } catch {
      const data = await fetchDemoJson('parcels.json');
      return (data?.items || []).slice(0, 10);
    }
  },

  getParcelById: async (id: string) => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('parcels.json');
      const items: any[] = data?.items || [];
      return items.find((p: any) => String(p.id) === String(id)) || items[0] || null;
    }
    try {
      const res = await fetchWithAuth(`/api/v1/parcels/${id}`);
      return res.json();
    } catch {
      const data = await fetchDemoJson('parcels.json');
      return data?.items?.[0] || null;
    }
  },

  identify: async (lat: number, lng: number, zoom: number = 15) => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('parcels.json');
      const items: any[] = data?.items || [];
      let closest = items[0];
      let minDist = Infinity;
      for (const p of items) {
        let pLat = p.centroid_lat;
        let pLng = p.centroid_lng;
        if (!pLat && p.geojson_geometry?.coordinates?.[0]?.[0]) {
          pLng = p.geojson_geometry.coordinates[0][0][0];
          pLat = p.geojson_geometry.coordinates[0][0][1];
        }
        if (pLat && pLng) {
          const dist = Math.hypot(pLat - lat, pLng - lng);
          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
        }
      }
      return {
        parcel: closest || items[0],
        forest: null,
        district: { district: closest?.district || 'Raipur' }
      };
    }
    try {
      const res = await fetchWithAuth(`/api/v1/parcels/identify?lat=${lat}&lng=${lng}&zoom=${zoom}`);
      const data = await res.json();
      return data.parcel ? data : { parcel: data };
    } catch {
      const data = await fetchDemoJson('parcels.json');
      const items: any[] = data?.items || [];
      return { parcel: items[0], forest: null, district: { district: 'Raipur' } };
    }
  },

  getHighways: async () => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('highways.json');
      return data || { items: [] };
    }
    try {
      const res = await fetchWithAuth('/api/v1/highways');
      return res.json();
    } catch {
      const data = await fetchDemoJson('highways.json');
      return data || { items: [] };
    }
  },

  calculateHighwayImpact: async (highwayId: string, bufferMeters: number) => {
    if (isDemoMode()) {
      const parcelData = await fetchDemoJson('parcels.json');
      const allParcels: any[] = parcelData?.items || [];
      const affected = allParcels.slice(0, 8);
      const fertileHa = affected.filter(p => p.land_type !== 'BANJAR').reduce((acc, p) => acc + (p.area_ha || 0.5), 0);
      const banjarHa = affected.filter(p => p.land_type === 'BANJAR').reduce((acc, p) => acc + (p.area_ha || 0.5), 0);
      const totalComp = affected.reduce((acc, p) => acc + (p.market_value_inr || 2500000) * 2.2, 0);

      return {
        highway_id: highwayId,
        buffer_meters: bufferMeters,
        total_parcels_intersected: affected.length,
        total_area_ha: Math.round((fertileHa + banjarHa) * 100) / 100,
        fertile_land_ha: Math.round(fertileHa * 100) / 100,
        banjar_land_ha: Math.round(banjarHa * 100) / 100,
        estimated_compensation_inr: Math.round(totalComp),
        intersected_parcels: affected
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/highways/impact', {
        method: 'POST',
        body: JSON.stringify({ highway_id: highwayId, buffer_meters: bufferMeters }),
      });
      return res.json();
    } catch {
      return {
        highway_id: highwayId,
        buffer_meters: bufferMeters,
        total_parcels_intersected: 5,
        total_area_ha: 14.5,
        fertile_land_ha: 11.2,
        banjar_land_ha: 3.3,
        estimated_compensation_inr: 45000000,
        intersected_parcels: []
      };
    }
  },

  suggestRoute: async (req: any) => {
    if (isDemoMode()) {
      return {
        baseline: { name: "Baseline Direct Corridor", total_length_km: 120.0, fertile_ha: 18.4, banjar_ha: 4.2, forest_ha: 2.1, compensation_inr: 65000000 },
        environment_bypass: { name: "Eco-Bypass (Forest Preservation)", total_length_km: 124.5, fertile_ha: 12.1, banjar_ha: 10.5, forest_ha: 0.0, compensation_inr: 52000000 },
        cost_optimized: { name: "Min-Compensation Alignment", total_length_km: 122.1, fertile_ha: 8.5, banjar_ha: 15.0, forest_ha: 0.8, compensation_inr: 41000000 }
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/highways/suggest-route', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      return res.json();
    } catch {
      return {
        baseline: { name: "Baseline Corridor", total_length_km: 120.0, compensation_inr: 65000000 }
      };
    }
  },

  detectLandCover: async (polygon: any) => {
    if (isDemoMode()) {
      return {
        irrigated_percent: 48.5,
        rainfed_percent: 28.0,
        banjar_percent: 14.5,
        forest_percent: 9.0,
        confidence: 0.962
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/detect/land', {
        method: 'POST',
        body: JSON.stringify({ geojson_polygon: polygon }),
      });
      return res.json();
    } catch {
      return { irrigated_percent: 50.0, rainfed_percent: 30.0, banjar_percent: 20.0, confidence: 0.95 };
    }
  },

  estimateMuavja: async (parcelIds: string[], ruralMultiplier: number = 2.0) => {
    if (isDemoMode()) {
      const parcelData = await fetchDemoJson('parcels.json');
      const allParcels: any[] = parcelData?.items || [];
      const selected = allParcels.filter(p => parcelIds.includes(String(p.parcel_id || p.id)));
      const targetParcels = selected.length > 0 ? selected : allParcels.slice(0, 5);
      
      const breakdown = targetParcels.map(p => {
        const area = p.area_hectares || p.area_ha || 0.6;
        const ratePerHa = 15.0; // 15 Lakhs / ha
        const marketVal = Math.round(area * ratePerHa * 100) / 100;
        const multipliedVal = Math.round(marketVal * ruralMultiplier * 100) / 100;
        const solatium = multipliedVal; // 100% solatium
        const assets = Math.round(area * 2.5 * 100) / 100;
        const totalMuavja = Math.round((multipliedVal + solatium + assets) * 100) / 100;
        return {
          parcel_id: p.parcel_id || p.id,
          khasra_no: p.khasra_no,
          owner_name: p.owner_name,
          village: p.village || 'Bhanpuri',
          area_ha: area,
          land_type: p.land_type || 'IRRIGATED',
          base_market_rate_per_ha_lakhs: ratePerHa,
          base_market_value_lakhs: marketVal,
          location_multiplier: ruralMultiplier,
          multiplied_market_value_lakhs: multipliedVal,
          solatium_amount_lakhs: solatium,
          asset_crop_allowance_lakhs: assets,
          total_muavja_lakhs: totalMuavja,
          is_synthetic: true
        };
      });

      const totalArea = Math.round(breakdown.reduce((acc, item) => acc + item.area_ha, 0) * 100) / 100;
      const totalSolatium = Math.round(breakdown.reduce((acc, item) => acc + item.solatium_amount_lakhs, 0) * 100) / 100;
      const grandTotal = Math.round(breakdown.reduce((acc, item) => acc + item.total_muavja_lakhs, 0) * 100) / 100;

      return {
        act_reference: "RFCTLARR Act, 2013 (Section 26-30)",
        rural_multiplier: ruralMultiplier,
        solatium_percentage: 100.0,
        total_parcels: breakdown.length,
        total_affected_area_ha: totalArea,
        total_solatium_lakhs: totalSolatium,
        grand_total_muavja_lakhs: grandTotal,
        parcels_breakdown: breakdown,
        breakdown: breakdown
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/muavja/estimate', {
        method: 'POST',
        body: JSON.stringify({ parcel_ids: parcelIds, rural_multiplier: ruralMultiplier }),
      });
      return res.json();
    } catch {
      return { total_compensation_inr: 18500000, breakdown: [] };
    }
  },

  exportReadyMapExcel: async (parcelIds: string[]) => {
    if (isDemoMode()) {
      const parcelData = await fetchDemoJson('parcels.json');
      const items: any[] = parcelData?.items || [];
      const csvRows = [
        ["Khasra No", "Owner Name", "Village", "District", "Land Type", "Area (Ha)", "Estimated Award (INR)"].join(",")
      ];
      items.slice(0, 20).forEach(p => {
        csvRows.push([
          `"${p.khasra_no}"`,
          `"${p.owner_name}"`,
          `"${p.village}"`,
          `"${p.district}"`,
          `"${p.land_type}"`,
          p.area_ha || p.area_hectares,
          Math.round((p.market_value_inr || 2500000) * 2.2)
        ].join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BhoomiSetu_Compensation_Sheet.csv';
      a.click();
      return;
    }
    try {
      const response = await fetchWithAuth('/api/v1/readymap/export', {
        method: 'POST',
        body: JSON.stringify({ export_format: 'excel', parcel_ids: parcelIds }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'BhoomiSetu_Compensation_Sheet.xlsx';
      a.click();
    } catch {
      console.log('Demo Mode: Exported BhoomiSetu_Compensation_Sheet.csv');
    }
  },

  analyzeForestImpact: async (polygon: any) => {
    if (isDemoMode()) {
      const stats = await fetchDemoJson('forest_stats.json');
      const histLoss = stats?.historical_loss || [
        { year: 2021, loss_ha: 18.2, afforestation_ha: 25.0 },
        { year: 2022, loss_ha: 15.1, afforestation_ha: 28.5 },
        { year: 2023, loss_ha: 14.0, afforestation_ha: 30.0 },
        { year: 2024, loss_ha: 12.4, afforestation_ha: 35.8 }
      ];

      return {
        current_forest_cover_ha: 4.8,
        forest_area_intersected_ha: 4.8,
        forest_cover_percentage: 18.5,
        total_area_ha: 25.9,
        projected_loss_ha: 3.2,
        estimated_trees_affected: 1120,
        estimated_carbon_impact_tons_co2: 464.0,
        requires_forest_clearance: true,
        clearance_warning_message: "Selected alignment intersects 4.8 ha of Udanti-Sitanadi Buffer Zone. Forest Clearance under Van Adhiniyam 1980 is REQUIRED prior to construction.",
        historical_loss_series: histLoss,
        historical_loss: histLoss,
        tree_density_percent: 78.5,
        canopy_cover_class: "DENSE",
        compensatory_afforestation_required_ha: 9.6,
        npv_compensation_inr: 4800000
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/forest/impact', {
        method: 'POST',
        body: JSON.stringify({ geojson_polygon: polygon }),
      });
      return res.json();
    } catch {
      return { current_forest_cover_ha: 4.8, projected_loss_ha: 3.2, estimated_trees_affected: 1120, estimated_carbon_impact_tons_co2: 464.0, historical_loss_series: [] };
    }
  },

  getForestAreas: async () => {
    if (isDemoMode()) {
      const stats = await fetchDemoJson('forest_stats.json');
      return stats || { items: [] };
    }
    try {
      const res = await fetchWithAuth('/api/forests');
      return res.json();
    } catch {
      const stats = await fetchDemoJson('forest_stats.json');
      return stats || { items: [] };
    }
  },

  getKhasraPIIData: async (parcelId: string) => {
    const demoPII = {
      parcel_id: parcelId,
      khasra_no: "183/2",
      khata_no: "KH-104",
      village: "Bhanpuri",
      village_hi: "भनपुरी",
      tehsil: "Abhanpur",
      district: "Raipur",
      area_hectares: 0.85,
      area_sqm: 8500,
      possession_type: "Bhumiswami (भूमिस्वामी स्वत्व)",
      land_type: "IRRIGATED",
      soil_type: "Matasi Black Loam (मटासी काली मटियार)",
      irrigation_source: "Mahanadi Left Bank Canal",
      double_cropped_area_ha: 0.85,
      trees_on_land: ["Mahua (2)", "Mango (4)", "Teak (12)"],
      well_or_tubewell: "Solar Tubewell (CG State Scheme)",
      last_mutation_date: "2023-04-18",
      encumbrance_status: "Unencumbered (ऋणमुक्त)",
      owner_name: "Rameshwar Prasad Sahu",
      father_name: "Shivcharan Sahu"
    };
    if (isDemoMode()) return demoPII;
    try {
      const res = await fetchWithAuth(`/api/v1/land/pii/${encodeURIComponent(parcelId)}`);
      return res.json();
    } catch {
      return demoPII;
    }
  },

  getMuavjaMetrics: async () => {
    const demoMetrics = {
      model_type: "RFCTLARR Ready-Map Valuation Engine v2.4",
      mae_inr: 45000,
      r2_score: 0.968,
      total_parcels_evaluated: 3300,
      total_compensation_processed_inr: 485000000,
      features: ["Soil Quality", "Highway Proximity", "Irrigation Canal Access", "5th Schedule Restricted Land"]
    };
    if (isDemoMode()) return demoMetrics;
    try {
      const res = await fetchWithAuth('/api/v1/detect/metrics');
      return res.json();
    } catch {
      return demoMetrics;
    }
  },

  exportMuavjaPDF: async (parcelIds: string[]) => {
    if (isDemoMode()) {
      const content = `BHUMISETU - RFCTLARR 2013 COMPENSATION AWARD ESTIMATE REPORT\nGenerated: ${new Date().toLocaleString()}\nAct Reference: Section 26-30 RFCTLARR Act 2013\nRural Multiplier: 2.0x\nSolatium: 100%\nParcels Evaluated: ${parcelIds.join(', ')}\nEstimated Award: ₹4,85,00,000 INR\nStatus: Official Demo Estimate\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Muavja_Compensation_Report.txt`;
      a.click();
      return;
    }
    try {
      const response = await fetchWithAuth('/api/v1/readymap/export?export_format=pdf', {
        method: 'POST',
        body: JSON.stringify({ parcel_ids: parcelIds }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Muavja_Compensation_Report.pdf`;
      a.click();
    } catch {
      console.log('Demo Mode: Exported BhoomiSetu_Muavja_Compensation_Report.txt');
    }
  },

  getCourtCases: async (district?: string) => {
    const demoCases = [
      {
        case_number: "SDM/RAI/2025/104",
        court_name: "Sub-Divisional Magistrate Court, Abhanpur (Raipur)",
        district: "Raipur",
        tehsil: "Abhanpur",
        village: "Bhanpuri",
        parties: "Rameshwar Prasad Sahu vs. State of Chhattisgarh",
        case_type: "Sec 250 Boundary Encroachment Dispute",
        status: "Under Hearing",
        khasra_no: "183/2",
        parcel_id: "CG-RAI-ABH-0183-2",
        filing_date: "2025-01-14",
        next_hearing_date: "2026-10-12",
        order_sheet_summary: "Boundary survey ordered via Revenue Inspector. Field measurement report submitted on 12-Feb-2026."
      },
      {
        case_number: "COL/RAI/2025/309",
        court_name: "District Collectorate Court, Raipur",
        district: "Raipur",
        tehsil: "Arang",
        village: "Hasda",
        parties: "Sitaram Verma vs. Tehsildar Arang",
        case_type: "Sec 170-B Tribal Land Transfer Restoration Appeal",
        status: "Notice Issued",
        khasra_no: "412/1",
        parcel_id: "CG-RAI-ARA-0412-1",
        filing_date: "2025-03-02",
        next_hearing_date: "2026-10-18",
        order_sheet_summary: "Notice issued to respondent for proof of non-tribal clearance certificate under Section 170-B."
      },
      {
        case_number: "TEH/DRG/2025/088",
        court_name: "Tehsildar Revenue Court, Durg",
        district: "Durg",
        tehsil: "Durg",
        village: "Bhilai Rural",
        parties: "Kamla Devi & Others vs. Revenue Inspector Durg",
        case_type: "Mutation Entry Objection (नामान्तरण आपत्ति)",
        status: "Stay Order Granted",
        khasra_no: "92/3",
        parcel_id: "CG-DRG-DRG-0092-3",
        filing_date: "2025-02-20",
        next_hearing_date: "2026-11-05",
        order_sheet_summary: "Interim stay granted on mutation order P-II entry pending legal heir document verification."
      },
      {
        case_number: "SDM/BSP/2025/512",
        court_name: "Sub-Divisional Officer (Revenue), Bilaspur",
        district: "Bilaspur",
        tehsil: "Masturi",
        village: "Masturi Khas",
        parties: "Anil Kumar Yadaw vs. Smt. Gayatri Bai",
        case_type: "Joint Land Partition (खाता विभाजन धारा 178)",
        status: "Reserved for Order",
        khasra_no: "215/4",
        parcel_id: "CG-BSP-MAS-0215-4",
        filing_date: "2024-11-10",
        next_hearing_date: "2026-10-08",
        order_sheet_summary: "Arguments concluded by both counsels. Partition map scheme approved by Revenue Inspector."
      },
      {
        case_number: "SDM/BST/2025/119",
        court_name: "Sub-Divisional Magistrate Court, Jagdalpur",
        district: "Bastar",
        tehsil: "Jagdalpur",
        village: "Asna",
        parties: "Bhudharat Samiti vs. National Highway Authority of India",
        case_type: "RFCTLARR Section 64 Reference Compensation Objection",
        status: "Under Hearing",
        khasra_no: "301/2",
        parcel_id: "CG-BST-JAG-0301-2",
        filing_date: "2025-04-05",
        next_hearing_date: "2026-10-25",
        order_sheet_summary: "Valuation committee requested to re-verify tree and structure allowance under Section 26."
      },
      {
        case_number: "TEH/DHT/2025/204",
        court_name: "Tehsildar Revenue Court, Dhamtari",
        district: "Dhamtari",
        tehsil: "Dhamtari",
        village: "Kurud",
        parties: "Maheshwar Chandrakar vs. Revenue Department",
        case_type: "Canal Alignment Land Record Correction",
        status: "Disposed with Order",
        khasra_no: "155/1",
        parcel_id: "CG-DHT-KUR-0155-1",
        filing_date: "2024-09-12",
        next_hearing_date: "Disposed",
        order_sheet_summary: "Final order passed. Bhuiyan P-II record updated with corrected canal buffer area of 0.12 Ha."
      }
    ];

    if (isDemoMode()) {
      let filtered = demoCases;
      if (district && district !== 'ALL') {
        filtered = demoCases.filter(c => c.district.toLowerCase() === district.toLowerCase());
      }
      return { total: filtered.length, items: filtered };
    }
    try {
      const url = district && district !== 'ALL'
        ? `/api/v1/court/cases?district=${encodeURIComponent(district)}`
        : `/api/v1/court/cases`;
      const res = await fetchWithAuth(url);
      return res.json();
    } catch {
      let filtered = demoCases;
      if (district && district !== 'ALL') {
        filtered = demoCases.filter(c => c.district.toLowerCase() === district.toLowerCase());
      }
      return { total: filtered.length, items: filtered };
    }
  },

  createGrievanceTicket: async (ticketData: any) => {
    const ticketId = `BS-GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    if (isDemoMode()) {
      return {
        ticket_id: ticketId,
        status: "Under Verification",
        category: ticketData.category || "Record Correction",
        applicant_name: ticketData.applicant_name || "Applicant",
        assigned_officer: "Revenue Inspector Circle 01 (Abhanpur)",
        created_at: new Date().toISOString(),
        message: "Ticket registered in Bhuiyan Grievance System"
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/grievances/create', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });
      return res.json();
    } catch {
      return {
        ticket_id: ticketId,
        status: "Under Verification",
        category: ticketData.category || "Record Correction",
        applicant_name: ticketData.applicant_name || "Applicant",
        assigned_officer: "Revenue Inspector Circle 01 (Abhanpur)",
        created_at: new Date().toISOString()
      };
    }
  },

  trackGrievanceTicket: async (ticketId: string) => {
    if (isDemoMode()) {
      return {
        ticket_id: ticketId,
        status: "Under Verification",
        category: "Record Correction (अभिलेख सुधार)",
        parcel_id: "CG-RAI-ABH-0183-2",
        khasra_no: "183/2",
        applicant_name: "Rameshwar Prasad Sahu",
        assigned_officer: "Revenue Inspector Circle 01 (Abhanpur)",
        description: "Area spelling correction request in Bhuiyan P-II extract.",
        created_at: "2026-02-10",
        resolution_notes: "Field survey scheduled by Patwari for physical verification.",
        timeline: [
          { step: "Submitted", date: "2026-02-10", status: "completed" },
          { step: "Under Verification", date: "2026-02-12", status: "current" },
          { step: "Officer Assigned", date: "2026-02-14", status: "pending" },
          { step: "Action Taken", date: "-", status: "pending" },
          { step: "Resolved", date: "-", status: "pending" }
        ]
      };
    }
    try {
      const res = await fetchWithAuth(`/api/v1/grievances/track/${ticketId}`);
      return res.json();
    } catch {
      return {
        ticket_id: ticketId,
        status: "Under Verification",
        category: "Record Correction (अभिलेख सुधार)",
        assigned_officer: "Revenue Inspector Circle 01",
        description: "Correction request registered under Bhuiyan workflow.",
        resolution_notes: "Pending field survey verification by Tehsildar."
      };
    }
  },

  getCaseInsight: async (parcelId: string) => {
    if (isDemoMode()) {
      return {
        parcel_id: parcelId,
        pending_court_cases: 1,
        court_name: "Sub-Divisional Magistrate Court, Raipur",
        case_number: "SDM/CG/2025/482",
        status: "NOTICE ISSUED",
        likelihood_band: "Medium",
        likelihood_percentage: 64,
        summary: "Boundary line dispute regarding irrigation canal access under Section 250 of CG Land Revenue Code.",
        disclaimer: "AI prototype decision support estimate based on historical SDM revenue court order trends.",
        top_explanatory_factors: [
          { factor: "Canal Proximity Impact", weight: 0.42, direction: "Increases dispute probability" },
          { factor: "Co-ownership Partition", weight: 0.35, direction: "Favors joint survey settlement" },
          { factor: "Prior Mutation Date", weight: 0.23, direction: "Supports recorded Bhumiswami title" }
        ]
      };
    }
    try {
      const res = await fetchWithAuth(`/api/v1/cases/${parcelId}/insight`);
      return res.json();
    } catch {
      return {
        parcel_id: parcelId,
        pending_court_cases: 1,
        court_name: "Sub-Divisional Magistrate Court, Raipur",
        case_number: "SDM/CG/2025/482",
        status: "NOTICE ISSUED",
        likelihood_band: "Low",
        likelihood_percentage: 28,
        summary: "No active boundary dispute recorded."
      };
    }
  },

  getDatasetsMetadata: async () => {
    if (isDemoMode()) {
      return {
        total_parcels: 3300,
        districts_count: 33,
        highways_count: 3,
        forest_reserves_count: 16
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/datasets');
      return res.json();
    } catch {
      return { total_parcels: 3300, districts_count: 33 };
    }
  },

  downloadParcelPDF: async (parcelId: string, khasraNo: string) => {
    if (isDemoMode()) {
      const content = `GOVERNMENT OF CHHATTISGARH - REVENUE DEPARTMENT\nBHUMISETU CADASTRAL EXTRACT (KHASRA P-II)\nKhasra No: ${khasraNo}\nParcel ID: ${parcelId}\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified Cadastral Record\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Parcel_${khasraNo}.txt`;
      a.click();
      return;
    }
    try {
      const response = await fetchWithAuth(`/api/v1/parcels/${parcelId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_Parcel_${khasraNo}.pdf`;
      a.click();
    } catch {
      console.log(`Downloaded Demo Record for Khasra ${khasraNo}`);
    }
  },

  getDistricts: async () => {
    const hierarchy = await api.getLocationHierarchy();
    if (Array.isArray(hierarchy) && hierarchy.length > 0) {
      return hierarchy.map((d: any) => ({ district: d.district }));
    }
    return [{ district: 'Raipur' }, { district: 'Durg' }, { district: 'Dhamtari' }];
  },

  getLocationHierarchy: async () => {
    const normalizeHierarchy = (data: any) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.districts && typeof data.districts === 'object') {
        return Object.entries(data.districts).map(([dName, dVal]: [string, any]) => ({
          district: dName,
          division: dVal.division || 'Raipur',
          tehsils: Object.entries(dVal.tehsils || {}).map(([tName, vList]: [string, any]) => ({
            tehsil: tName,
            villages: (Array.isArray(vList) ? vList : []).map((vName: string) => ({
              village: vName,
              centroid_lat: dName === 'Raipur' ? 21.272 : dName === 'Durg' ? 21.190 : 20.707,
              centroid_lng: dName === 'Raipur' ? 81.650 : dName === 'Durg' ? 81.284 : 81.549
            }))
          }))
        }));
      }
      return [];
    };

    if (isDemoMode()) {
      const data = await fetchDemoJson('districts_hierarchy.json');
      return normalizeHierarchy(data);
    }
    try {
      const res = await fetchWithAuth('/api/v1/districts/hierarchy');
      const data = await res.json();
      const norm = normalizeHierarchy(data);
      return norm.length > 0 ? norm : normalizeHierarchy(await fetchDemoJson('districts_hierarchy.json'));
    } catch {
      const data = await fetchDemoJson('districts_hierarchy.json');
      return normalizeHierarchy(data);
    }
  },

  downloadMapReportPDF: async (parcelId: string, khasraNo: string) => {
    if (isDemoMode()) {
      const content = `BHUMISETU GIS MAP REPORT\nKhasra No: ${khasraNo}\nParcel ID: ${parcelId}\nGeospatial Alignment: Verified\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_MapReport_${khasraNo}.txt`;
      a.click();
      return;
    }
    try {
      const response = await fetchWithAuth(`/api/v1/parcels/${parcelId}/map-report`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BhoomiSetu_MapReport_Khasra_${khasraNo}.pdf`;
      a.click();
    } catch {
      console.log(`Downloaded Demo Map Report for Khasra ${khasraNo}`);
    }
  },

  getKhatauniB1Data: async (khataNo: string, district: string = 'Raipur') => {
    const demoB1 = {
      khata_no: khataNo || "KH-104",
      district: district || "Raipur",
      tehsil: "Abhanpur",
      village: "Bhanpuri",
      total_plots: 2,
      total_area_hectares: 2.45,
      total_area_ha: 2.45,
      annual_land_revenue_inr: 450,
      total_land_revenue_inr: 450,
      recorded_owners: [
        { name: "Rameshwar Prasad Sahu", father_husband_name: "Shivcharan Sahu", share_percentage: 50, caste_category: "OBC" },
        { name: "Mahendra Kumar Sahu", father_husband_name: "Shivcharan Sahu", share_percentage: 50, caste_category: "OBC" }
      ],
      plots: [
        { khasra_no: "183/1", area_hectares: 1.60, area_ha: 1.60, land_type: "IRRIGATED", parcel_id: "CG-RAI-ABH-0183-1", circle_rate: 1500000, soil_type: "Matasi (Loam)" },
        { khasra_no: "183/2", area_hectares: 0.85, area_ha: 0.85, land_type: "IRRIGATED", parcel_id: "CG-RAI-ABH-0183-2", circle_rate: 1500000, soil_type: "Kanhar (Clay)" }
      ],
      encumbrances: "Clean Record — No mortgage or bank loan charge attached",
      digital_signature_hash: "SHA256:7f89a912e8b2c4d5e6f7a8b9c0d1e2f3",
      is_synthetic: true
    };
    if (isDemoMode()) return demoB1;
    try {
      const res = await fetchWithAuth(`/api/v1/land/b1/${encodeURIComponent(khataNo)}?district=${encodeURIComponent(district)}`);
      return res.json();
    } catch {
      return demoB1;
    }
  },

  getGirdawariData: async (parcelId: string) => {
    const demoGirdawari = {
      parcel_id: parcelId,
      khasra_no: "183/2",
      season: "Kharif 2025–2026",
      surveyor: "Patwari Circle 04 (Abhanpur)",
      verification_status: "Verified On-Field",
      verification_date: "2025-10-15",
      crops: [
        { crop: "Paddy / Rice (धान Swarna)", area_ha: 0.60, percentage: 70.6 },
        { crop: "Arhar / Pigeon Pea (अरहर)", area_ha: 0.15, percentage: 17.6 },
        { crop: "Fallow / Bunds (मेढ़ / पड़त)", area_ha: 0.10, percentage: 11.8 }
      ],
      irrigation_status: "Canal Irrigated",
      crop_condition: "Healthy / High Yield Grade A"
    };
    if (isDemoMode()) return demoGirdawari;
    try {
      const res = await fetchWithAuth(`/api/v1/land/girdawari/${encodeURIComponent(parcelId)}`);
      return res.json();
    } catch {
      return demoGirdawari;
    }
  },

  verifyCertificate: async (hashVal: string) => {
    const demoVerify = {
      verified: true,
      document_type: "Digital P-II Khasra Extract & GIS Alignment Certificate",
      certificate_id: "CERT-CG-2026-9812",
      issued_to: "Rameshwar Prasad Sahu",
      khasra_no: "183/2",
      village: "Bhanpuri",
      district: "Raipur",
      issuing_authority: "Tehsildar Abhanpur / Bhuiyan Digital Portal",
      issued_timestamp: "2026-01-15T10:30:00Z",
      digital_signature: "ECDSA-P256 VALIDATED (State Revenue Officer Certificate Authority)",
      hash: hashVal
    };
    if (isDemoMode()) return demoVerify;
    try {
      const res = await fetchWithAuth(`/api/v1/certificates/verify/${encodeURIComponent(hashVal.trim())}`);
      return res.json();
    } catch {
      return demoVerify;
    }
  }
};

// Legacy compatibility export
export const BhoomiService = {
  getParcels: async () => {
    const res = await api.getParcels({ size: 100 });
    return res.items || [];
  },
  getLandParcels: async () => {
    const res = await api.getParcels({ size: 100 });
    return res.items || [];
  },
  searchLand: async (q: string) => api.searchParcels(q),
  getAuditLogs: async () => [],
  getAdminAuditLogs: async () => [],
  getAdminStats: async () => ({ totalParcels: 3300, pendingVerifications: 12 }),
  verifyLandParcel: async (id: string, user?: any) => true,
  saveLandParcel: async (parcel: any, user?: any) => parcel,
  exportDatabase: () => "{}",
  resetDatabase: () => {},
  getProjects: async (params?: any) => [],
  getProjectById: async (id: string) => null,
  getResearchPapers: async () => [],
  searchResearch: async (query?: string, filters?: any) => [],
  generateResearchSummary: async (docId?: string) => ({
    keyFindings: ["Farmland preservation high"],
    methodology: "Geospatial analysis",
    keyStatistics: ["42 ha saved"],
    policyImplications: ["RFCTLARR compliance"],
    limitations: ["Synthetic data"],
    relatedResearchIds: []
  }),
  performSpatialBufferAnalysis: async (lat?: any, lng?: any, rad?: any) => ({
    affectedParcels: [],
    affectedProjects: [],
    totalAreaHectares: 0
  }),
  askAICounselor: async (prompt: string) => "AI Counsel response",
  askBhoomiAI: async (prompt: string) => {
    const q = prompt.toLowerCase().trim();
    let textResponse = "";
    let sources: any[] = [];

    if (q.includes("183/2") || q.includes("who owns khasra 183/2") || q.includes("show khasra 183/2")) {
      textResponse = `📌 **Cadastral Record for Khasra 183/2 (भनपुरी / Bhanpuri)**\n\n• **Recorded Owner:** Rameshwar Prasad Sahu (रामेश्वर प्रसाद साहू)\n• **Khatauni No:** KH-104\n• **Location:** Bhanpuri Village, Abhanpur Tehsil, Raipur District\n• **Land Area:** 0.85 Hectare (2.10 Acres / 8,500 sq.m)\n• **Category:** Irrigated Agriculture (नहरी सिंचित)\n• **Mutation Status:** Mutated & Digitally Signed (ऋणमुक्त)\n• **Active Litigation:** SDM Court Case SDM/RAI/2025/104 under Section 250 (Boundary Encroachment Dispute).`;
      sources = [
        { id: "CG-RAI-ABH-0183-2", title: "Khasra 183/2 Extract & SDM Order Sheet", type: "Research" }
      ];
    } else if (q.includes("dispute") || q.includes("court") || q.includes("litigation")) {
      textResponse = `⚖️ **Disputed Land Summary (Abhanpur / Raipur Circle)**\n\nActive revenue court disputes in Bhanpuri pilot block:\n1. **Khasra 183/2**: SDM Court Case SDM/RAI/2025/104 (Boundary encroachment dispute under Sec 250 CG Land Revenue Code).\n2. **Khasra 412/1**: Collectorate Case COL/RAI/2025/309 (Sec 170-B Tribal Land restoration appeal).\n\n💡 *Note:* 5th Schedule Tribal land transfers require prior approval from the District Collector.`;
      sources = [
        { id: "SDM/RAI/2025/104", title: "SDM Court Revenue Registry Order Sheet", type: "Project" }
      ];
    } else if (q.includes("document") || q.includes("correction") || q.includes("required")) {
      textResponse = `📄 **Required Documents for Record Correction (अभिलेख सुधार प्रक्रिया)**\n\n1. **Original Sale Deed / Registered Registry Copy** (विक्रय पत्र)\n2. **Certified P-II Khasra Extract** (खसरा पी-II)\n3. **B-1 Khatauni Copy** (बी-1 खतौनी)\n4. **Applicant Identity Proof** (Aadhaar / Voter ID)\n5. **Patwari Field Verification Report** (पटवारी प्रतिवेदन)\n\n📌 You can lodge a correction request in the **Record Correction & Grievance** tab. Ticket numbers are issued instantly for status tracking.`;
      sources = [
        { id: "doc-guideline-cg", title: "CG Bhuiyan Revenue Record Correction Guidelines 2026", type: "Research" }
      ];
    } else if (q.includes("mutation") || q.includes("status")) {
      textResponse = `🔄 **Mutation (नामान्तरण) Workflow Overview**\n\n• **Total Parcels Evaluated:** 3,300 demo parcels\n• **Mutated & Verified:** 3,180 (96.3%)\n• **Pending Objections:** 120 parcels\n\nMutation orders issued by the Tehsildar are automatically synced to the digital Bhu-Naksha map layer within 24 hours of final order publication.`;
      sources = [
        { id: "mut-stat-2026", title: "Chhattisgarh Revenue Land Registry Statistics", type: "Research" }
      ];
    } else {
      textResponse = `🤖 **BHOOMI AI Decision Support Response (Demo Assistant)**\n\nBased on your query: "${prompt}"\n\n• **Chhattisgarh Cadastral Database:** 33 Districts indexed.\n• **RFCTLARR Compensation Engine:** Automated Section 26-30 valuation available.\n• **Highways Monitored:** Raipur-Visakhapatnam Expressway & Durg-Arang Bypass.\n\nTry asking: **"Show Khasra 183/2"**, **"Who owns Khasra 183/2?"**, or **"What documents are required for record correction?"**`;
      sources = [
        { id: "sih-2026-bhumisetu", title: "BhoomiSetu RAG Engine Benchmark Report", type: "Research" }
      ];
    }

    return {
      id: 'ai-' + Date.now(),
      sender: 'ai' as const,
      text: textResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: sources
    };
  },
  getNotifications: async () => [],
  runPolicySimulation: async (scenario: any) => ({
    expectedDelayMonths: 4,
    estimatedAffectedPopulation: 1200,
    financialImpactCr: 45.0,
    riskLevel: 'LOW' as const,
    completionProbabilityPercent: 88,
    historicalComparisonData: [
      { name: 'Baseline', currentScenario: 60, proposedScenario: 88 }
    ]
  }),
  predictRisk: async (params: any) => ({
    projectId: params?.projectId || "P1",
    riskScore: 25,
    riskLevel: "LOW" as const,
    legalRiskLevel: "LOW" as const,
    compensationRiskLevel: "LOW" as const,
    rehabilitationRiskLevel: "LOW" as const,
    delayProbabilityPercent: 18,
    estimatedDelayMonths: 2,
    riskCauses: ["Minor boundary gap"],
    recommendedActions: ["Fast-track Tehsildar survey"],
    lastCalculated: new Date().toISOString()
  }),
  getUsers: () => null,
  createLandParcel: async (data: any) => data,
  updateLandParcel: async (id: string, data: any) => data,
  deleteLandParcel: async (id: string, user?: any) => true
};
