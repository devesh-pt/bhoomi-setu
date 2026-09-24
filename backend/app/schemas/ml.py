from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class CaseInsightResponse(BaseModel):
    parcel_id: str
    case_number: Optional[str] = None
    likelihood_band: str # Low, Medium, High favouring claimant
    likelihood_percentage: float
    top_explanatory_factors: List[Dict[str, Any]] # SHAP/feature importance
    disclaimer: str = "Advisory only — not legal advice; outcome depends on the court."
    model_metrics: Dict[str, Any]

class LandDetectionRequest(BaseModel):
    geojson_polygon: Dict[str, Any]

class LandDetectionClassSummary(BaseModel):
    land_type: str
    name_en: str
    name_hi: str
    pixel_count: int
    area_ha: float
    percentage: float

class LandDetectionResponse(BaseModel):
    total_area_ha: float
    class_breakdown: List[LandDetectionClassSummary]
    detected_mask_geojson: Dict[str, Any]
    model_info: Dict[str, Any]
