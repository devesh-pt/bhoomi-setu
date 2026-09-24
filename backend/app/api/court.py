from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.adapters import get_land_adapter

router = APIRouter()

@router.get("/cases")
def list_court_cases(
    parcel_id: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    adapter = get_land_adapter(db)
    cases = adapter.get_revenue_court_cases(parcel_id=parcel_id, district=district)
    return {"total": len(cases), "items": cases}
