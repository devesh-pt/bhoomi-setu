from pydantic import BaseModel, ConfigDict
from typing import Optional, Any, Dict, List

def mask_text(text: Optional[str]) -> Optional[str]:
    if not text:
        return text
    parts = text.split()
    masked = []
    for p in parts:
        if len(p) <= 2:
            masked.append(p)
        else:
            masked.append(p[0] + '*' * (len(p) - 2) + p[-1])
    return ' '.join(masked)

class ParcelBase(BaseModel):
    parcel_id: str
    khasra_no: str
    khata_no: Optional[str] = None
    village: str
    village_hi: Optional[str] = None
    tehsil: Optional[str] = None
    tehsil_hi: Optional[str] = None
    district: str
    district_hi: Optional[str] = None
    state: str = "Chhattisgarh"
    owner_name: str
    owner_name_hi: Optional[str] = None
    father_name: Optional[str] = None
    father_name_hi: Optional[str] = None
    area_hectares: float
    area_acres: float
    area_bigha: float
    area_sqm: Optional[float] = None
    land_type: str
    soil_type: Optional[str] = "Matasi Soil"
    irrigation_source: Optional[str] = "Canal Network"
    market_value_per_ha: float
    circle_rate: Optional[float] = None
    last_mutation_date: Optional[str] = "2023-04-15"
    mutation_status: Optional[str] = "Mutated"
    encumbrance_status: Optional[str] = "Nil / Unencumbered"
    litigation_status: Optional[str] = "No dispute"
    case_status: str
    case_details: Optional[str] = None
    tribal_sensitive: Optional[bool] = False
    forest_distance_km: Optional[float] = 2.5
    highway_distance_km: Optional[float] = 1.5
    data_source: Optional[str] = "synthetic_demo"
    wkt_geometry: Optional[str] = None
    geojson_geometry: Dict[str, Any]
    centroid_lat: float
    centroid_lng: float
    min_lat: Optional[float] = None
    min_lng: Optional[float] = None
    max_lat: Optional[float] = None
    max_lng: Optional[float] = None
    is_synthetic: bool = True
    is_pilot: Optional[bool] = False


class ParcelResponse(ParcelBase):
    id: int
    nearest_highway: Optional[str] = "NH-53 Expressway"
    nearest_highway_dist_km: Optional[float] = 1.2
    is_in_acquisition_corridor: Optional[bool] = False
    forest_proximity_km: Optional[float] = 3.5
    forest_5yr_change_pct: Optional[float] = -1.2
    ai_dispute_winner_prediction: Optional[str] = "Recorded Owner (87% confidence)"
    ai_dispute_reasoning: Optional[str] = "Clear Bhuiyan mutation record + 12-year undisputed possession history"
    ai_confidence_score: Optional[float] = 87.5

    model_config = ConfigDict(from_attributes=True)

class ParcelListResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[ParcelResponse]
