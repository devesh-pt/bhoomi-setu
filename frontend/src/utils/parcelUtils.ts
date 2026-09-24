import { z } from 'zod';

// Zod Schema for Parcel object
export const ParcelSchema = z.object({
  parcel_id: z.string().or(z.number()).transform((val) => String(val)),
  khasra_no: z.string().default('N/A'),
  khata_no: z.string().optional().nullable(),
  owner_name: z.string().default('Unknown Owner'),
  owner_name_hi: z.string().optional().nullable(),
  father_name: z.string().optional().nullable(),
  village: z.string().default(''),
  village_hi: z.string().optional().nullable(),
  tehsil: z.string().default(''),
  district: z.string().default(''),
  area_hectares: z.number().default(0),
  area_acres: z.number().optional().default(0),
  area_sqm: z.number().optional().default(0),
  land_type: z.string().default('IRRIGATED'),
  centroid_lat: z.number().optional().nullable(),
  centroid_lng: z.number().optional().nullable(),
  case_status: z.string().optional().default('none'),
  litigation_status: z.string().optional().nullable(),
  mutation_status: z.string().optional().nullable(),
  market_value_per_ha: z.number().optional().default(0),
  circle_rate: z.number().optional().default(0),
  geojson_geometry: z.object({
    type: z.string().default('Polygon'),
    coordinates: z.array(z.any()).default([])
  }).optional().nullable()
}).passthrough();

export type ParcelData = z.infer<typeof ParcelSchema>;

// Zod Schema for API response envelope
export const ParcelListResponseSchema = z.object({
  total: z.number().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
  items: z.array(z.any()).optional().nullable()
});

/**
 * Normalises any input data (null, undefined, error objects, direct array, wrapped items object)
 * into a safe, validated Parcel[] array.
 */
export function normalizeParcels(data: unknown): any[] {
  if (!data) return [];

  // If input is an array directly
  if (Array.isArray(data)) {
    return data.filter(Boolean);
  }

  // If input is an object
  if (typeof data === 'object') {
    const obj = data as Record<string, any>;

    // Check if it's an error object like { detail: "..." } or { error: "..." }
    if (obj.detail || obj.error || obj.message && !obj.items && !obj.features) {
      return [];
    }

    // Check if wrapped in { items: [...] }
    if (Array.isArray(obj.items)) {
      return obj.items.filter(Boolean);
    }

    // Check if wrapped in GeoJSON FeatureCollection { features: [...] }
    if (Array.isArray(obj.features)) {
      return obj.features
        .map((feat: any) => feat.properties || feat)
        .filter(Boolean);
    }
  }

  return [];
}

/**
 * Safely extracts coordinates for Leaflet Polygon rendering [lat, lng][].
 */
export function normalizePolygonCoordinates(rawCoords: unknown): [number, number][] {
  if (!Array.isArray(rawCoords) || rawCoords.length === 0) {
    return [];
  }

  // Handle nested ring structure [ [ [lng, lat], ... ] ] or [ [lng, lat], ... ]
  let ring: any[] = rawCoords;
  if (Array.isArray(ring[0]) && Array.isArray(ring[0][0])) {
    ring = ring[0];
  }

  if (!Array.isArray(ring)) return [];

  const result: [number, number][] = [];
  for (const pt of ring) {
    if (Array.isArray(pt) && pt.length >= 2) {
      const lng = Number(pt[0]);
      const lat = Number(pt[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        result.push([lat, lng]);
      }
    }
  }
  return result;
}

/**
 * Safely normalises forest areas response.
 */
export function normalizeForestAreas(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.features)) return obj.features.filter(Boolean);
  }
  return [];
}

/**
 * Safely normalises highways response.
 */
export function normalizeHighways(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, any>;
    if (Array.isArray(obj.items)) return obj.items.filter(Boolean);
    if (Array.isArray(obj.highways)) return obj.highways.filter(Boolean);
  }
  return [];
}
