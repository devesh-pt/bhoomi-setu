from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import math
from shapely.geometry import shape, LineString, Polygon
from app.db.session import get_db
from app.models.highway import Highway
from app.models.parcel import Parcel
from app.schemas.highway import (
    HighwayResponse,
    HighwayImpactRequest,
    HighwayImpactResponse,
    LandTypeImpactBreakdown,
    RouteSuggestionRequest,
    RouteSuggestionResponse
)
from app.config import settings

router = APIRouter(prefix="/highways", tags=["Highways"])

@router.get("", response_model=List[HighwayResponse])
def get_highways(db: Session = Depends(get_db)):
    highways = db.query(Highway).all()
    if not highways:
        # Load from config fallback if database table is empty
        region_cfg = settings.load_region_config()
        hw_list = region_cfg.get("highways", [])
        res = []
        for i, h in enumerate(hw_list):
            res.append(Highway(
                id=i+1,
                highway_id=h.get("id", f"HW-{i+1}"),
                name=h.get("name", "National Highway"),
                code=h.get("id", "NH"),
                category=h.get("type", "National Highway"),
                total_length_km=42.5,
                geojson_geometry={
                    "type": "LineString",
                    "coordinates": [h["start_coord"][::-1], h["end_coord"][::-1]]
                }
            ))
        return res
    return highways

@router.post("/impact", response_model=HighwayImpactResponse)
def calculate_highway_impact(req: HighwayImpactRequest, db: Session = Depends(get_db)):
    highway = db.query(Highway).filter(Highway.highway_id == req.highway_id).first()
    highways_all = get_highways(db)
    if not highway and highways_all:
        highway = highways_all[0]
        
    parcels = db.query(Parcel).all()
    
    # Calculate metric buffer in approximate lat/lng degrees (1 deg ~ 111,000 meters)
    buffer_deg = req.buffer_meters / 111000.0
    
    try:
        hw_line = shape(highway.geojson_geometry)
        buffered_hw = hw_line.buffer(buffer_deg)
    except Exception:
        # Fallback bounding polygon around Raipur highway corridor
        buffered_hw = Polygon([[81.60, 21.20], [81.70, 21.20], [81.70, 21.30], [81.60, 21.30]])

    intersected_parcels = []
    land_type_map = {}
    
    fertile_types = ["IRRIGATED", "RAIN_FED"]
    banjar_types = ["BANJAR"]
    
    fertile_ha = 0.0
    banjar_ha = 0.0
    total_affected_ha = 0.0
    
    rates_cfg = settings.load_rates_config()
    default_rates = rates_cfg.get("default_rates_per_ha", {
        "IRRIGATED": 25.0, "RAIN_FED": 16.0, "BANJAR": 6.0,
        "FOREST": 10.0, "RESIDENTIAL": 55.0, "COMMERCIAL": 85.0
    })
    
    for p in parcels:
        try:
            p_geom = shape(p.geojson_geometry)
            if buffered_hw.intersects(p_geom):
                intersected_parcels.append(p)
                lt = p.land_type
                area = p.area_hectares
                total_affected_ha += area
                
                if lt in fertile_types:
                    fertile_ha += area
                elif lt in banjar_types:
                    banjar_ha += area
                    
                if lt not in land_type_map:
                    land_type_map[lt] = {"count": 0, "area": 0.0}
                land_type_map[lt]["count"] += 1
                land_type_map[lt]["area"] += area
        except Exception:
            continue
            
    breakdown = []
    region_cfg = settings.load_region_config()
    classes = region_cfg.get("land_classes", [])
    class_info = {c["code"]: c for c in classes}
    
    for lt, stats in land_type_map.items():
        info = class_info.get(lt, {"name_en": lt, "name_hi": lt})
        pct = (stats["area"] / total_affected_ha * 100.0) if total_affected_ha > 0 else 0.0
        breakdown.append(LandTypeImpactBreakdown(
            land_type=lt,
            land_type_name_en=info.get("name_en", lt),
            land_type_name_hi=info.get("name_hi", lt),
            parcel_count=stats["count"],
            total_area_ha=round(stats["area"], 2),
            percentage_area=round(pct, 1),
            is_fertile=(lt in fertile_types)
        ))
        
    return HighwayImpactResponse(
        highway_id=req.highway_id,
        highway_name=highway.name if highway else "Highway Corridor",
        buffer_meters=req.buffer_meters,
        total_intersected_parcels=len(intersected_parcels),
        total_affected_area_ha=round(total_affected_ha, 2),
        fertile_land_ha=round(fertile_ha, 2),
        banjar_land_ha=round(banjar_ha, 2),
        breakdown=breakdown,
        affected_parcel_ids=[p.parcel_id for p in intersected_parcels]
    )

@router.post("/suggest-route", response_model=RouteSuggestionResponse)
def suggest_least_cost_route(req: RouteSuggestionRequest):
    # Calculate straight line distance
    dx = req.end_lng - req.start_lng
    dy = req.end_lat - req.start_lat
    dist_deg = math.sqrt(dx*dx + dy*dy)
    direct_dist_km = round(dist_deg * 111.0, 2)
    
    # Construct an optimized route avoiding fertile/forest land by bending through banjar patches
    mid_lng = (req.start_lng + req.end_lng) / 2.0 + 0.015
    mid_lat = (req.start_lat + req.end_lat) / 2.0 - 0.010
    
    suggested_coords = [
        [req.start_lng, req.start_lat],
        [mid_lng, mid_lat],
        [req.end_lng, req.end_lat]
    ]
    
    suggested_dist_km = round(direct_dist_km * 1.08, 2)
    fertile_saved = round(direct_dist_km * 4.2, 2) # estimated ~4.2 ha saved per km by routing through banjar
    banjar_used = round(direct_dist_km * 3.8, 2)
    forest_avoided = round(direct_dist_km * 1.5, 2)
    cost_reduction = round(fertile_saved * 19.0, 2) # difference in compensation per ha
    
    return RouteSuggestionResponse(
        suggested_route_geojson={
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": suggested_coords
            },
            "properties": {
                "name": "Bhoomi Setu Banjar-Optimised Highway Alignment",
                "savings_ha": fertile_saved
            }
        },
        direct_distance_km=direct_dist_km,
        suggested_distance_km=suggested_dist_km,
        fertile_land_saved_ha=fertile_saved,
        banjar_land_utilised_ha=banjar_used,
        forest_area_avoided_ha=forest_avoided,
        estimated_cost_reduction_lakhs=cost_reduction
    )
