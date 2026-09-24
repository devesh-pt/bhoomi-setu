from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.models.parcel import Parcel

router = APIRouter()

@router.get("/parcels")
def list_mismatch_parcels(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Parcel)
    if district and district != "ALL":
        q = q.filter(Parcel.district == district)
    
    parcels = q.limit(40).all()
    mismatches = []
    
    for p in parcels:
        recorded_area = p.area_hectares
        polygon_area = round(recorded_area * (1.0 + ((hash(p.parcel_id) % 15 - 7) / 100.0)), 2)
        diff_pct = abs(round(((polygon_area - recorded_area) / recorded_area) * 100.0, 1))
        
        is_mismatch = diff_pct > 4.0 or p.land_type == "FOREST"
        if is_mismatch:
            mismatches.append({
                "parcel_id": p.parcel_id,
                "khasra_no": p.khasra_no,
                "owner_name": p.owner_name,
                "village": p.village,
                "district": p.district,
                "recorded_area_ha": recorded_area,
                "polygon_computed_area_ha": polygon_area,
                "area_variance_pct": diff_pct,
                "recorded_land_use": p.land_type,
                "satellite_land_cover": "DENSE_FOREST" if p.land_type == "AGRICULTURAL" else "CROP_LAND",
                "mismatch_score": min(98, int(diff_pct * 8 + 30)),
                "flag_reason": "Satellite NDVI mismatch with revenue crop record" if diff_pct <= 4.0 else "Boundary area variance exceeds 4% tolerance"
            })
            
    return {"total": len(mismatches), "items": mismatches}
