from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ForestImpactRequest(BaseModel):
    geojson_polygon: Dict[str, Any]

class AnnualForestLossItem(BaseModel):
    year: int
    loss_ha: float

class ForestImpactResponse(BaseModel):
    total_area_ha: float
    current_forest_cover_ha: float
    forest_cover_percentage: float
    historical_loss_series: List[AnnualForestLossItem]
    projected_loss_ha: float
    estimated_trees_affected: int
    estimated_carbon_impact_tons_co2: float
    requires_forest_clearance: bool
    clearance_warning_message: Optional[str] = None
    suggested_alternative_polygon: Optional[Dict[str, Any]] = None
    gfw_alerts_count: int
