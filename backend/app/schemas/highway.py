from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List

class HighwayBase(BaseModel):
    highway_id: str
    name: str
    code: str
    category: str
    total_length_km: float
    geojson_geometry: Dict[str, Any]

class HighwayResponse(HighwayBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class HighwayImpactRequest(BaseModel):
    highway_id: str
    buffer_meters: float = 45.0  # e.g., 30, 45, 60 meters

class LandTypeImpactBreakdown(BaseModel):
    land_type: str
    land_type_name_en: str
    land_type_name_hi: str
    parcel_count: int
    total_area_ha: float
    percentage_area: float
    is_fertile: bool

class HighwayImpactResponse(BaseModel):
    highway_id: str
    highway_name: str
    buffer_meters: float
    total_intersected_parcels: int
    total_affected_area_ha: float
    fertile_land_ha: float
    banjar_land_ha: float
    breakdown: List[LandTypeImpactBreakdown]
    affected_parcel_ids: List[str]

class RouteSuggestionRequest(BaseModel):
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    optimize_for_banjar: bool = True

class RouteSuggestionResponse(BaseModel):
    suggested_route_geojson: Dict[str, Any]
    direct_distance_km: float
    suggested_distance_km: float
    fertile_land_saved_ha: float
    banjar_land_utilised_ha: float
    forest_area_avoided_ha: float
    estimated_cost_reduction_lakhs: float
