import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polygon, Polyline, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../../services/api';
import { BhunakshaSidebar } from './BhunakshaSidebar';
import { ParcelCompareModal } from '../parcel/ParcelCompareModal';
import { MapErrorBoundary } from './MapErrorBoundary';
import { useToast } from '../ui/ToastContext';
import {
  normalizeParcels,
  normalizePolygonCoordinates,
  normalizeForestAreas,
  normalizeHighways
} from '../../utils/parcelUtils';
import 'leaflet/dist/leaflet.css';

// Helper component to programmatically pan/zoom Leaflet map
const MapFlyTo: React.FC<{ center: [number, number] | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Helper component to fit Leaflet map to bounds
const MapFitBounds: React.FC<{ bounds: [[number, number], [number, number]] | null }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17, animate: true });
    }
  }, [bounds, map]);
  return null;
};

// Helper component to handle map taps, moveend, and zoomend events
const MapEventHandler: React.FC<{
  onMapTap: (lat: number, lng: number, zoom: number) => void;
  onZoomChange: (zoom: number) => void;
  onMapMoveEnd: (bounds: L.LatLngBounds, zoom: number) => void;
}> = ({ onMapTap, onZoomChange, onMapMoveEnd }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onMapTap(e.latlng.lat, e.latlng.lng, map.getZoom());
    };
    const handleMove = () => {
      onZoomChange(map.getZoom());
      onMapMoveEnd(map.getBounds(), map.getZoom());
    };
    map.on('click', handleMapClick);
    map.on('moveend', handleMove);
    map.on('zoomend', handleMove);
    return () => {
      map.off('click', handleMapClick);
      map.off('moveend', handleMove);
      map.off('zoomend', handleMove);
    };
  }, [map, onMapTap, onZoomChange, onMapMoveEnd]);
  return null;
};

// Ray-casting point-in-polygon helper for touch precision
const isPointInPolygon = (pt: [number, number], ring: [number, number][]) => {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  let x = pt[0], y = pt[1];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    let xi = ring[i]?.[0] ?? 0, yi = ring[i]?.[1] ?? 0;
    let xj = ring[j]?.[0] ?? 0, yj = ring[j]?.[1] ?? 0;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi || 1) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

export const LandMapModule: React.FC = () => {
  const { t } = useTranslation();
  
  // Location Hierarchy & Selection State
  const [hierarchy, setHierarchy] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Raipur');
  const [selectedTehsil, setSelectedTehsil] = useState<string>('Abhanpur');
  const [selectedVillage, setSelectedVillage] = useState<string>('Bhanpuri');

  // Parcels, Highways & Forests data
  const [parcels, setParcels] = useState<any[]>([]);
  const { showToast } = useToast();
  const [highways, setHighways] = useState<any[]>([]);
  const [forestAreas, setForestAreas] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [selectedForest, setSelectedForest] = useState<any | null>(null);
  const [hoveredParcelId, setHoveredParcelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [identifying, setIdentifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // View state & programmatic controls
  const [mapCenter, setMapCenter] = useState<[number, number] | null>([21.272, 81.650]);
  const [mapZoom, setMapZoom] = useState<number>(15);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | null>(null);

  // Compare modal state
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Layer & Display Settings (Parcels OFF by default unless village selected or toggled)
  const [layerSettings, setLayerSettings] = useState<{
    basemap: 'satellite' | 'street';
    showParcels: boolean;
    showHighways: boolean;
    showForests: boolean;
    showLandTypeColors: boolean;
    colorBy: 'land_type' | 'litigation' | 'mutation';
  }>({
    basemap: 'satellite',
    showParcels: false,        // OFF by default
    showHighways: true,         // ON by default
    showForests: false,        // OFF by default
    showLandTypeColors: false,  // OFF by default
    colorBy: 'land_type'
  });

  // Debouncing & AbortController refs for viewport bbox fetching
  const abortControllerRef = useRef<AbortController | null>(null);
  const moveDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Mount: Load Hierarchy, Highways & Forest Areas
  useEffect(() => {
    loadHierarchyAndInitialVillage();
    loadHighwaysData();
    loadForestsData();

    return () => {
      if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const loadForestsData = async () => {
    try {
      const fData = await api.getForestAreas().catch(() => null);
      setForestAreas(normalizeForestAreas(fData));
    } catch (err) {
      console.error('Failed to load forest areas', err);
      setForestAreas([]);
    }
  };

  const loadHierarchyAndInitialVillage = async () => {
    try {
      const rawData = await api.getLocationHierarchy().catch(() => []);
      const data = Array.isArray(rawData) ? rawData : [];
      if (data.length > 0) {
        setHierarchy(data);

        const raipurObj = data.find((d: any) => d.district === 'Raipur') || data[0];
        const distName = raipurObj?.district || 'Raipur';

        const tehsils = Array.isArray(raipurObj?.tehsils) ? raipurObj.tehsils : [];
        const abhanpurObj = tehsils.find((t: any) => t.tehsil === 'Abhanpur') || tehsils[0];
        const tehsilName = abhanpurObj?.tehsil || 'Abhanpur';

        const villages = Array.isArray(abhanpurObj?.villages) ? abhanpurObj.villages : [];
        const bhanpuriObj = villages.find((v: any) => v.village === 'Bhanpuri') || villages[0];
        const villageName = bhanpuriObj?.village || 'Bhanpuri';

        setSelectedDistrict(distName);
        setSelectedTehsil(tehsilName);
        setSelectedVillage(villageName);

        loadVillageParcels(distName, tehsilName, villageName, bhanpuriObj);
      }
    } catch (err) {
      console.error('Failed to load hierarchy', err);
      setHierarchy([]);
    }
  };

  const loadHighwaysData = async () => {
    try {
      const hData = await api.getHighways().catch(() => []);
      setHighways(normalizeHighways(hData));
    } catch (err) {
      console.error('Failed to load highways', err);
      setHighways([]);
    }
  };

  // 2. Fetch Village Parcels with safe normalization
  const loadVillageParcels = async (district: string, tehsil: string, village: string, vObj?: any) => {
    setLoading(true);
    try {
      const res = await api.getParcels({ district, tehsil, village, size: 1000 }).catch(() => []);
      const loadedParcels = normalizeParcels(res);
      setParcels(loadedParcels);

      if (vObj && vObj.centroid_lat && vObj.centroid_lng) {
        setMapBounds(null);
        setMapCenter([vObj.centroid_lat, vObj.centroid_lng]);
        setMapZoom(15);
      } else if (loadedParcels.length > 0 && loadedParcels[0]?.centroid_lat) {
        const b = loadedParcels[0];
        setMapCenter([b.centroid_lat, b.centroid_lng]);
        setMapZoom(15);
      }
    } catch (err) {
      console.error('Failed to fetch village parcels', err);
      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Debounced Bounding Box Fetching with AbortController
  const handleMapMoveEnd = useCallback((bounds: L.LatLngBounds, zoom: number) => {
    if (zoom < 14) return;

    if (moveDebounceRef.current) {
      clearTimeout(moveDebounceRef.current);
    }

    moveDebounceRef.current = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const bboxStr = `${sw.lng.toFixed(6)},${sw.lat.toFixed(6)},${ne.lng.toFixed(6)},${ne.lat.toFixed(6)}`;

        const res = await api.getParcels(
          { bbox: bboxStr, size: 500 },
          { signal: controller.signal }
        );

        if (!controller.signal.aborted) {
          const bboxParcels = normalizeParcels(res);
          if (bboxParcels.length > 0) {
            setParcels(bboxParcels);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch bbox parcels', err);
        }
      }
    }, 300);
  }, []);

  // On Tap Anywhere Handler
  const handleMapTap = useCallback(async (lat: number, lng: number, zoom: number) => {
    setMapZoom(zoom);
    if (zoom < 14) {
      setToastMessage("Zoom in to tap land (Minimum zoom level 14)");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIdentifying(true);
    try {
      const data = await api.identify(lat, lng, zoom).catch(() => null);
      if (data) {
        if (data.parcel) {
          setSelectedParcel(data.parcel);
        }
        if (data.forest) {
          setSelectedForest(data.forest);
        } else {
          setSelectedForest(null);
        }
        if (data.district && data.district.district) {
          setSelectedDistrict(data.district.district);
        }
      }
    } catch (err) {
      console.error('Failed to identify land point', err);
    } finally {
      setIdentifying(false);
    }
  }, []);

  // Handle Location Selector Change
  const handleSelectLocation = (district: string, tehsil: string, village: string, vObj?: any) => {
    setSelectedDistrict(district);
    setSelectedTehsil(tehsil);
    setSelectedVillage(village);
    loadVillageParcels(district, tehsil, village, vObj);
  };

  // Handle Plot Khasra Search
  const handleSearchKhasra = (khasraNo: string) => {
    const safeList = normalizeParcels(parcels);
    const found = safeList.find(
      (p) => p.khasra_no === khasraNo || p.khasra_no?.toLowerCase().includes(khasraNo.toLowerCase())
    );
    if (found) {
      setSelectedParcel(found);
      if (found.centroid_lat && found.centroid_lng) {
        setMapBounds(null);
        setMapCenter([found.centroid_lat, found.centroid_lng]);
        setMapZoom(17);
      }
    } else {
      showToast(`Khasra Plot No. "${khasraNo}" not found in current village (${selectedVillage}).`, "warning");
    }
  };

  // Compare Handlers
  const handleAddToCompare = (parcel: any) => {
    if (!parcel) return;
    const safeCompare = Array.isArray(compareList) ? compareList : [];
    if (safeCompare.find((p) => p.parcel_id === parcel.parcel_id)) return;
    if (safeCompare.length >= 3) {
      showToast("You can compare up to 3 parcels at a time.", "warning");
      return;
    }
    setCompareList([...safeCompare, parcel]);
  };

  const handleRemoveCompare = (parcelId: string) => {
    const safeCompare = Array.isArray(compareList) ? compareList : [];
    setCompareList(safeCompare.filter((p) => p.parcel_id !== parcelId));
  };

  // Compute Polygon Fill Color
  const getParcelFillColor = (p: any) => {
    if (layerSettings.colorBy === 'litigation') {
      const status = (p.litigation_status || p.case_status || '').toLowerCase();
      if (status.includes('pending') || status.includes('stay') || status.includes('appeal') || status.includes('dispute')) {
        return '#ef4444'; // Red for litigation
      }
      return '#22c55e'; // Green for clear
    }

    if (layerSettings.colorBy === 'mutation') {
      const status = (p.mutation_status || '').toLowerCase();
      if (status.includes('hearing') || status.includes('notice') || status.includes('pending')) {
        return '#f59e0b'; // Amber for pending mutation
      }
      return '#22c55e'; // Green for mutated
    }

    switch (p.land_type) {
      case 'IRRIGATED': return '#22c55e';   // Green
      case 'RAIN_FED': return '#84cc16';    // Lime
      case 'BANJAR': return '#f59e0b';      // Amber
      case 'FOREST': return '#15803d';      // Dark Green
      case 'RESIDENTIAL': return '#ef4444'; // Red
      case 'COMMERCIAL': return '#a855f7';  // Purple
      default: return '#64748b';
    }
  };

  // Filter display parcels: Only draw when needed (village selected, khasra searched, parcel clicked, or toggled ON)
  const displayParcels = useMemo(() => {
    const safeParcels = normalizeParcels(parcels);

    // Below zoom 15, do not draw parcel outlines unless selectedParcel is explicitly focused
    if (mapZoom < 15 && !selectedParcel) {
      return [];
    }

    let list: any[] = [];
    if (layerSettings.showParcels || selectedVillage || selectedParcel) {
      if (selectedVillage) {
        list = safeParcels.filter(
          (p) => p.village?.toLowerCase() === selectedVillage.toLowerCase()
        );
      } else {
        list = [...safeParcels];
      }
    }

    if (selectedParcel && !list.find((p) => p.parcel_id === selectedParcel.parcel_id)) {
      list.push(selectedParcel);
    }
    return list;
  }, [parcels, selectedParcel, selectedVillage, mapZoom, layerSettings.showParcels]);

  const safeHighways = useMemo(() => normalizeHighways(highways), [highways]);
  const safeForestAreas = useMemo(() => normalizeForestAreas(forestAreas), [forestAreas]);

  return (
    <div className="relative w-full h-[calc(100dvh-4rem)] bg-slate-950 overflow-hidden flex flex-col select-none">
      
      {/* Zoom / Tap Notification Toast */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-500/90 text-slate-950 text-xs font-black px-4 py-2 rounded-full border border-amber-300 shadow-2xl flex items-center gap-2 animate-bounce">
          <span>⚠️ {toastMessage}</span>
        </div>
      )}

      {identifying && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-sky-900/90 text-sky-200 text-xs font-bold px-4 py-2 rounded-full border border-sky-400/50 shadow-xl flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Identifying land parcel everywhere in CG...</span>
        </div>
      )}

      {/* Floating Map Clean Status Indicator */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-slate-900/85 backdrop-blur-md text-slate-300 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-700/60 shadow-lg flex items-center gap-2 pointer-events-none">
        {loading ? (
          <>
            <div className="w-2.5 h-2.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading cadastral data...</span>
          </>
        ) : displayParcels.length > 0 ? (
          <span className="text-emerald-400 font-bold">
            {displayParcels.length} {displayParcels.length === 1 ? 'parcel' : 'parcels'} in {selectedVillage || 'current view'}
          </span>
        ) : (
          <span className="text-slate-400">
            Satellite view — Select village or toggle Parcels in Layers tab
          </span>
        )}
      </div>

      {/* Resilient Map Error Boundary Wrapper */}
      <div className="flex-1 w-full h-full z-0 relative">
        <MapErrorBoundary zoom={mapZoom}>
          <MapContainer
            center={mapCenter || [21.272, 81.650]}
            zoom={mapZoom}
            minZoom={10}
            maxZoom={19}
            className="w-full h-full"
          >
            <MapFlyTo center={mapCenter} zoom={mapZoom} />
            <MapFitBounds bounds={mapBounds} />
            <MapEventHandler
              onMapTap={handleMapTap}
              onZoomChange={(z) => setMapZoom(z)}
              onMapMoveEnd={handleMapMoveEnd}
            />

            {/* Base Tile Layer */}
            {layerSettings.basemap === 'satellite' ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS, GeoEye"
                maxZoom={19}
                maxNativeZoom={18}
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={19}
                maxNativeZoom={19}
              />
            )}

            {/* Highways Corridor Overlay with Permanent Code Labels */}
            {layerSettings.showHighways !== false && safeHighways.map((hw, idx) => {
              const coords = normalizePolygonCoordinates(hw.geojson_geometry?.coordinates);
              if (coords.length === 0) return null;
              const hwCode = hw.code || hw.highway_id || 'Highway';
              return (
                <Polyline
                  key={hw.highway_id || idx}
                  positions={coords}
                  pathOptions={{ color: '#ef4444', weight: 3.5, dashArray: '6, 6' }}
                >
                  <Tooltip permanent direction="center" className="bg-rose-950/90 text-rose-200 font-black text-[10px] px-1.5 py-0.5 border border-rose-500/60 rounded shadow">
                    {hwCode}
                  </Tooltip>
                </Polyline>
              );
            })}

            {/* Forest Reserves Overlay */}
            {layerSettings.showForests && safeForestAreas.map((feat: any, idx: number) => {
              const coords = normalizePolygonCoordinates(feat.geometry?.coordinates);
              if (coords.length === 0) return null;
              const props = feat.properties || {};
              const isSelected = selectedForest?.forest_id === props.id || selectedForest?.id === props.id;
              return (
                <Polygon
                  key={props.id || idx}
                  positions={coords}
                  pathOptions={{
                    color: isSelected ? '#f59e0b' : '#15803d',
                    dashArray: '6, 6',
                    fillColor: '#22c55e',
                    fillOpacity: isSelected ? 0.38 : 0.22,
                    weight: isSelected ? 3.5 : 2.0
                  }}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e.originalEvent);
                      setSelectedForest({ ...props, geojson_geometry: feat.geometry });
                    }
                  }}
                >
                  <Popup>
                    <div className="text-xs space-y-1.5 p-1 min-w-[200px] select-text">
                      <div className="font-extrabold text-slate-900 border-b border-slate-200 pb-1 flex justify-between items-center gap-1">
                        <span>🌲 {props.name}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-1 py-0.5 rounded">
                          {props.type}
                        </span>
                      </div>
                      {props.name_hi && <div className="text-emerald-800 text-[11px] font-semibold">{props.name_hi}</div>}
                      <div className="text-slate-700">District: <strong>{props.district}</strong></div>
                      <div className="text-slate-700">Area: <strong>{props.area_km2} km²</strong></div>
                      <div className="text-slate-700">Canopy: <strong>{props.canopy_density}</strong></div>
                      {props.forest_clearance_required && (
                        <div className="text-rose-600 font-extrabold text-[10px] pt-0.5">⚠️ Forest Clearance Required (FCA 1980)</div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForest({ ...props, geojson_geometry: feat.geometry });
                        }}
                        className="w-full mt-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-[11px] font-bold shadow transition flex items-center justify-center gap-1"
                      >
                        <span>Inspect Forest Reserve</span>
                      </button>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Clean Cadastral Polygon Parcels */}
            {displayParcels.map((p) => {
              const leafletCoords = normalizePolygonCoordinates(p.geojson_geometry?.coordinates);
              if (leafletCoords.length === 0) return null;
              const isSelected = selectedParcel?.parcel_id === p.parcel_id;
              const isHovered = hoveredParcelId === p.parcel_id;

              const fillColor = layerSettings.showLandTypeColors ? getParcelFillColor(p) : '#38bdf8';
              const fillOpacity = layerSettings.showLandTypeColors
                ? (isSelected ? 0.45 : isHovered ? 0.35 : 0.18)
                : (isSelected ? 0.30 : isHovered ? 0.20 : 0.08);

              return (
                <Polygon
                  key={p.parcel_id}
                  positions={leafletCoords}
                  pathOptions={{
                    fillColor: fillColor,
                    fillOpacity: fillOpacity,
                    color: isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#38bdf8',
                    weight: isSelected ? 3.5 : isHovered ? 2.0 : 1.0
                  }}
                  eventHandlers={{
                    click: (e) => {
                      if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
                      const latlng = e.latlng;
                      if (latlng) {
                        const candidates = displayParcels.filter((candidate) => {
                          const ring = normalizePolygonCoordinates(candidate.geojson_geometry?.coordinates);
                          return isPointInPolygon([latlng.lng, latlng.lat], ring);
                        });
                        if (candidates.length > 1) {
                          candidates.sort((a, b) => (a.area_hectares || 0) - (b.area_hectares || 0));
                          setSelectedParcel(candidates[0]);
                          return;
                        }
                      }
                      setSelectedParcel(p);
                    },
                    mouseover: () => setHoveredParcelId(p.parcel_id),
                    mouseout: () => setHoveredParcelId(null)
                  }}
                >
                  {/* Khasra Label Tooltip visible at zoom >= 17 */}
                  {mapZoom >= 17 && (
                    <Tooltip permanent direction="center" className="bg-slate-900/90 text-amber-300 font-bold text-[10px] px-1.5 py-0.5 border border-amber-500/40 rounded shadow-sm">
                      Khasra {p.khasra_no}
                    </Tooltip>
                  )}

                  <Popup>
                    <div className="text-xs space-y-2 p-1 min-w-[210px] select-text">
                      <div className="border-b border-slate-200 pb-1 flex justify-between items-center gap-1">
                        <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                          Khasra No. {p.khasra_no}
                        </span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded">
                          Demo data
                        </span>
                      </div>
                      <div className="space-y-1 text-slate-800">
                        <div>Owner: <strong className="text-emerald-900">{p.owner_name}</strong></div>
                        {p.owner_name_hi && <div className="text-amber-800 text-[11px] font-medium">{p.owner_name_hi}</div>}
                        <div>
                          Area: <strong>{p.area_hectares} ha</strong> ({p.area_acres || 0} ac)
                        </div>
                        <div>Land Type: <strong className="text-slate-900">{p.land_type}</strong></div>
                        <div>Village: <strong className="text-slate-700">{p.village} ({p.district})</strong></div>
                      </div>
                      <div className="pt-1.5 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedParcel(p);
                          }}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold shadow transition flex items-center justify-center gap-1"
                        >
                          <span>More details</span>
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </MapErrorBoundary>
      </div>

      {/* Bhunaksha 4-Tab Sidebar */}
      <BhunakshaSidebar
        locationHierarchy={hierarchy}
        selectedDistrict={selectedDistrict}
        selectedTehsil={selectedTehsil}
        selectedVillage={selectedVillage}
        onSelectLocation={handleSelectLocation}
        selectedParcel={selectedParcel}
        forestInfo={selectedForest}
        onParcelSelect={(p) => setSelectedParcel(p)}
        onSearchKhasra={handleSearchKhasra}
        layerSettings={layerSettings}
        onUpdateLayerSettings={(newSettings) => setLayerSettings(newSettings)}
        onCompareParcel={handleAddToCompare}
      />

      {/* Side-by-Side Parcel Compare Modal */}
      <ParcelCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        parcels={compareList}
        onRemove={handleRemoveCompare}
      />
    </div>
  );
};
