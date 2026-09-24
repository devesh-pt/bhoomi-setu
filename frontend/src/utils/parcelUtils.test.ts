import { describe, it, expect } from 'vitest';
import {
  normalizeParcels,
  normalizePolygonCoordinates,
  normalizeForestAreas,
  normalizeHighways
} from './parcelUtils';

describe('parcelUtils - normalizeParcels', () => {
  it('returns empty array when given null or undefined', () => {
    expect(normalizeParcels(null)).toEqual([]);
    expect(normalizeParcels(undefined)).toEqual([]);
  });

  it('returns empty array when given an error object', () => {
    expect(normalizeParcels({ detail: 'Internal Server Error' })).toEqual([]);
    expect(normalizeParcels({ error: 'Network failure', message: 'Failed' })).toEqual([]);
  });

  it('returns empty array when items property is null or not array', () => {
    expect(normalizeParcels({ total: 0, items: null })).toEqual([]);
    expect(normalizeParcels({ items: 'not-an-array' })).toEqual([]);
  });

  it('handles empty array correctly', () => {
    expect(normalizeParcels([])).toEqual([]);
  });

  it('normalises wrapped items object into an array', () => {
    const rawResponse = {
      total: 2,
      page: 1,
      size: 10,
      items: [
        { parcel_id: 'P101', khasra_no: '12/1', land_type: 'IRRIGATED' },
        { parcel_id: 'P102', khasra_no: '12/2', land_type: 'BANJAR' }
      ]
    };
    const result = normalizeParcels(rawResponse);
    expect(result).toHaveLength(2);
    expect(result[0].parcel_id).toBe('P101');
    expect(result[1].parcel_id).toBe('P102');
  });

  it('normalises direct array input correctly', () => {
    const directArray = [
      { parcel_id: 'P201', khasra_no: '45/A' },
      { parcel_id: 'P202', khasra_no: '45/B' }
    ];
    const result = normalizeParcels(directArray);
    expect(result).toHaveLength(2);
    expect(result[0].parcel_id).toBe('P201');
  });

  it('normalises GeoJSON FeatureCollection', () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        { properties: { parcel_id: 'F1', khasra_no: '100' } }
      ]
    };
    const result = normalizeParcels(geojson);
    expect(result).toHaveLength(1);
    expect(result[0].parcel_id).toBe('F1');
  });
});

describe('parcelUtils - normalizePolygonCoordinates', () => {
  it('returns empty array for invalid inputs', () => {
    expect(normalizePolygonCoordinates(null)).toEqual([]);
    expect(normalizePolygonCoordinates(undefined)).toEqual([]);
    expect(normalizePolygonCoordinates('invalid')).toEqual([]);
    expect(normalizePolygonCoordinates([])).toEqual([]);
  });

  it('normalises nested ring coordinates into Leaflet lat/lng points', () => {
    const rawCoords = [
      [
        [81.65, 21.16],
        [81.66, 21.17],
        [81.65, 21.17]
      ]
    ];
    const leafletCoords = normalizePolygonCoordinates(rawCoords);
    expect(leafletCoords).toEqual([
      [21.16, 81.65],
      [21.17, 81.66],
      [21.17, 81.65]
    ]);
  });
});

describe('parcelUtils - normalizeForestAreas & Highways', () => {
  it('safely normalises forest areas', () => {
    expect(normalizeForestAreas(null)).toEqual([]);
    expect(normalizeForestAreas({ features: [{ id: 1 }] })).toEqual([{ id: 1 }]);
  });

  it('safely normalises highways', () => {
    expect(normalizeHighways(null)).toEqual([]);
    expect(normalizeHighways([{ highway_id: 'NH-30' }])).toEqual([{ highway_id: 'NH-30' }]);
  });
});
