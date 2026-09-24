from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class CompensationEstimateRequest(BaseModel):
    parcel_ids: List[str]
    rural_multiplier: Optional[float] = 2.0
    include_solatium: Optional[bool] = True

class ParcelCompensationDetail(BaseModel):
    parcel_id: str
    khasra_no: str
    owner_name: str
    land_type: str
    area_ha: float
    base_market_rate_per_ha_lakhs: float
    base_market_value_lakhs: float
    location_multiplier: float
    multiplied_market_value_lakhs: float
    solatium_amount_lakhs: float
    asset_crop_allowance_lakhs: float
    total_muavja_lakhs: float
    total_muavja_inr: float
    is_synthetic: bool = True

class CompensationEstimateResponse(BaseModel):
    total_parcels: int
    total_affected_area_ha: float
    total_base_value_lakhs: float
    total_solatium_lakhs: float
    total_asset_allowance_lakhs: float
    grand_total_muavja_lakhs: float
    grand_total_muavja_inr: float
    act_reference: str
    parcels_breakdown: List[ParcelCompensationDetail]
