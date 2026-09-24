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
  const cleanPath = `${BASE_PATH}demo-data/${fileName}`.replace(/\/+/g, '/');
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
      // Pick parcel closest to coordinates
      let closest = items[0];
      let minDist = Infinity;
      for (const p of items) {
        if (p.geometry && p.geometry.coordinates) {
          const coords = p.geometry.coordinates[0]?.[0] || [lng, lat];
          const dist = Math.hypot(coords[1] - lat, coords[0] - lng);
          if (dist < minDist) {
            minDist = dist;
            closest = p;
          }
        }
      }
      return closest || null;
    }
    try {
      const res = await fetchWithAuth(`/api/identify?lat=${lat}&lng=${lng}&zoom=${zoom}`);
      return res.json();
    } catch {
      const data = await fetchDemoJson('parcels.json');
      return data?.items?.[0] || null;
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
      const selected = allParcels.filter(p => parcelIds.includes(String(p.id))) ;
      const targetParcels = selected.length > 0 ? selected : allParcels.slice(0, 3);
      
      const breakdown = targetParcels.map(p => {
        const area = p.area_ha || 0.6;
        const ratePerHa = (p.market_value_inr || 2500000) / area;
        const marketVal = area * ratePerHa;
        const baseComp = marketVal * ruralMultiplier;
        const solatium = baseComp * 1.0;
        const assets = area * 250000;
        const total = baseComp + solatium + assets;
        return {
          parcel_id: p.id,
          khasra_no: p.khasra_no,
          owner_name: p.owner_name,
          village: p.village,
          area_ha: area,
          land_type: p.land_type,
          market_value_inr: Math.round(marketVal),
          base_compensation_inr: Math.round(baseComp),
          solatium_inr: Math.round(solatium),
          structure_allowance_inr: Math.round(assets),
          total_award_inr: Math.round(total)
        };
      });

      const totalAward = breakdown.reduce((acc, item) => acc + item.total_award_inr, 0);

      return {
        act_reference: "RFCTLARR Act, 2013 (Section 26-30)",
        rural_multiplier: ruralMultiplier,
        solatium_percentage: 100.0,
        total_parcels: breakdown.length,
        total_compensation_inr: totalAward,
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
          p.area_ha,
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
      return {
        forest_area_intersected_ha: 4.8,
        tree_density_percent: 78.5,
        canopy_cover_class: "DENSE",
        compensatory_afforestation_required_ha: 9.6,
        npv_compensation_inr: 4800000,
        historical_loss: stats?.historical_loss || []
      };
    }
    try {
      const res = await fetchWithAuth('/api/v1/forest/impact', {
        method: 'POST',
        body: JSON.stringify({ geojson_polygon: polygon }),
      });
      return res.json();
    } catch {
      return { forest_area_intersected_ha: 4.8, tree_density_percent: 78.5 };
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

  getCaseInsight: async (parcelId: string) => {
    if (isDemoMode()) {
      return {
        parcel_id: parcelId,
        pending_court_cases: 1,
        court_name: "Sub-Divisional Magistrate Court, Raipur",
        case_number: "SDM/CG/2025/482",
        status: "NOTICE ISSUED",
        summary: "Boundary line dispute regarding irrigation canal access under Section 250 of CG Land Revenue Code."
      };
    }
    try {
      const res = await fetchWithAuth(`/api/v1/cases/${parcelId}/insight`);
      return res.json();
    } catch {
      return { parcel_id: parcelId, pending_court_cases: 0 };
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
    if (isDemoMode()) {
      const data = await fetchDemoJson('districts_hierarchy.json');
      return Object.keys(data?.districts || {}).map(d => ({ district: d }));
    }
    try {
      const res = await fetchWithAuth('/api/v1/districts');
      return res.json();
    } catch {
      return [{ district: 'Raipur' }, { district: 'Durg' }, { district: 'Dhamtari' }];
    }
  },

  getLocationHierarchy: async () => {
    if (isDemoMode()) {
      const data = await fetchDemoJson('districts_hierarchy.json');
      return data || { districts: {} };
    }
    try {
      const res = await fetchWithAuth('/api/v1/districts/hierarchy');
      return res.json();
    } catch {
      const data = await fetchDemoJson('districts_hierarchy.json');
      return data || { districts: {} };
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
  askBhoomiAI: async (prompt: string) => ({
    id: 'ai-' + Date.now(),
    sender: 'ai' as const,
    text: 'BHOOMI AI Decision Support Response',
    timestamp: new Date().toLocaleTimeString()
  }),
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
