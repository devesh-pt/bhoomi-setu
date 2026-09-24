from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.adapters import get_land_adapter

router = APIRouter()

@router.get("/search-cascading")
def search_cascading(
    district: Optional[str] = Query(None),
    tehsil: Optional[str] = Query(None),
    ri_circle: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    khasra_no: Optional[str] = Query(None),
    owner_name: Optional[str] = Query(None),
    khata_no: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    adapter = get_land_adapter(db)
    results = adapter.search_cascading(
        district=district,
        tehsil=tehsil,
        ri_circle=ri_circle,
        village=village,
        khasra_no=khasra_no,
        owner_name=owner_name,
        khata_no=khata_no,
        query=query
    )
    return {"total": len(results), "items": results}

@router.get("/b1/{khata_no}")
def get_b1_khatauni(
    khata_no: str,
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    adapter = get_land_adapter(db)
    return adapter.get_b1_khatauni(khata_no=khata_no, district=district)

@router.get("/pii/{parcel_id}")
def get_pii_khasra(
    parcel_id: str,
    db: Session = Depends(get_db)
):
    adapter = get_land_adapter(db)
    return adapter.get_pii_khasra(parcel_id=parcel_id)

@router.get("/girdawari/{parcel_id}")
def get_girdawari(
    parcel_id: str,
    db: Session = Depends(get_db)
):
    adapter = get_land_adapter(db)
    return adapter.get_girdawari(parcel_id=parcel_id)
