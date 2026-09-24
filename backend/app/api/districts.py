from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from app.db.session import get_db
from app.models.district import District
from app.models.parcel import Parcel

router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(District).order_by(District.district.asc()).all()
    return [
        {
            "id": d.id,
            "district": d.district,
            "district_hi": d.district_hi,
            "division": d.division,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "note": d.note
        }
        for d in districts
    ]

@router.get("/hierarchy", response_model=List[Dict[str, Any]])
def get_location_hierarchy(db: Session = Depends(get_db)):
    rows = db.query(
        Parcel.district,
        Parcel.district_hi,
        Parcel.tehsil,
        Parcel.tehsil_hi,
        Parcel.village,
        Parcel.village_hi,
        func.max(Parcel.is_pilot).label("is_pilot"),
        func.count(Parcel.id).label("parcel_count"),
        func.min(Parcel.min_lat).label("min_lat"),
        func.min(Parcel.min_lng).label("min_lng"),
        func.max(Parcel.max_lat).label("max_lat"),
        func.max(Parcel.max_lng).label("max_lng"),
        func.avg(Parcel.centroid_lat).label("cent_lat"),
        func.avg(Parcel.centroid_lng).label("cent_lng")
    ).group_by(
        Parcel.district, Parcel.tehsil, Parcel.village
    ).order_by(Parcel.district.asc(), Parcel.tehsil.asc(), Parcel.village.asc()).all()

    districts_map = {}
    for r in rows:
        d_name = r.district
        t_name = r.tehsil or d_name
        v_name = r.village
        
        if d_name not in districts_map:
            districts_map[d_name] = {
                "district": d_name,
                "district_hi": r.district_hi or d_name,
                "tehsils_map": {}
            }
        
        d_obj = districts_map[d_name]
        if t_name not in d_obj["tehsils_map"]:
            d_obj["tehsils_map"][t_name] = {
                "tehsil": t_name,
                "tehsil_hi": r.tehsil_hi or t_name,
                "villages": []
            }
            
        t_obj = d_obj["tehsils_map"][t_name]
        t_obj["villages"].append({
            "village": v_name,
            "village_hi": r.village_hi or v_name,
            "is_pilot": bool(r.is_pilot),
            "parcel_count": r.parcel_count,
            "bounds": {
                "min_lat": float(r.min_lat or r.cent_lat or 21.16),
                "min_lng": float(r.min_lng or r.cent_lng or 81.65),
                "max_lat": float(r.max_lat or r.cent_lat or 21.165),
                "max_lng": float(r.max_lng or r.cent_lng or 81.655)
            },
            "center": [float(r.cent_lat or 21.1625), float(r.cent_lng or 81.6525)]
        })

    result = []
    for d_name, d_val in districts_map.items():
        tehsils_list = []
        for t_name, t_val in d_val["tehsils_map"].items():
            t_val["villages"].sort(key=lambda x: (not x["is_pilot"], x["village"]))
            tehsils_list.append(t_val)
        
        tehsils_list.sort(key=lambda x: x["tehsil"])
        result.append({
            "district": d_val["district"],
            "district_hi": d_val["district_hi"],
            "tehsils": tehsils_list
        })
        
    return result

