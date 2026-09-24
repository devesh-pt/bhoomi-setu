import os
import math
import json
import csv
import random
from pathlib import Path
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
import numpy as np
from scipy.spatial import Voronoi
from shapely.geometry import Polygon, Point, box, mapping
from shapely.wkt import dumps as wkt_dumps

from app.db.session import get_db
from app.models.parcel import Parcel
from app.models.forest import ForestArea

router = APIRouter(tags=["Identify Parcel Everywhere"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DISTRICTS_CSV_PATH = BASE_DIR / "data" / "districts_cg.csv"

# Load Chhattisgarh Districts once
DISTRICTS_DATA: List[Dict[str, Any]] = []
if os.path.exists(DISTRICTS_CSV_PATH):
    with open(DISTRICTS_CSV_PATH, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                DISTRICTS_DATA.append({
                    "district": row.get("district", "").strip(),
                    "district_hi": row.get("district_hi", "").strip() or row.get("district", "").strip(),
                    "division": row.get("division", "").strip() or "Chhattisgarh",
                    "latitude": float(row.get("latitude", 21.25)),
                    "longitude": float(row.get("longitude", 81.63))
                })
            except Exception:
                pass

# Real CG Name Pool
OWNERS_POOL = [
    ("Rajesh Verma", "राजेश वर्मा", "Late Bhupendra Verma", "स्व. भूपेंद्र वर्मा"),
    ("Phoolchand Chandrakar", "फूलचंद चंद्राकर", "Late Ghanshyam Chandrakar", "स्व. घनश्याम चंद्राकर"),
    ("Suresh Sahu", "सुरेश साहू", "Late Rameshwar Sahu", "स्व. रामेश्वर साहू"),
    ("Anita Patel", "अनीता पटेल", "Gopal Patel", "गोपाल पटेल"),
    ("Devendra Kashyap", "देवेंद्र कश्यप", "Late Ramesh Kashyap", "स्व. रमेश कश्यप"),
    ("Bhupendra Kanwar", "भूपेंद्र कंवर", "Late Ramesh Kanwar", "स्व. रमेश कंवर"),
    ("Chaitanya Yadav", "चैतन्य यादव", "Late Rajesh Yadav", "स्व. राजेश यादव"),
    ("Budhram Mandavi", "बुधराम मंडावी", "Sukhlal Mandavi", "सुखलाल मंडावी"),
    ("Kamla Agrawal", "कमला अग्रवाल", "Murarilal Agrawal", "मुरारीलाल अग्रवाल"),
    ("Lokesh Netam", "लोकेश नेताम", "Mangal Netam", "मंगल नेताम"),
    ("Prakash Sinha", "प्रकाश सिन्हा", "Narayan Sinha", "नारायण सिन्हा"),
    ("Dhaniram Kurmi", "धनीराम कुर्मी", "Late Komal Kurmi", "स्व. कोमल कुर्मी"),
    ("Suresh Jangde", "सुरेश जांगड़े", "Late Ramgopal Jangde", "स्व. रामगोपाल जांगड़े"),
    ("Komal Chandrakar", "कोमल चंद्राकर", "Late Lalita Chandrakar", "स्व. ललिता चंद्राकर"),
    ("Sunita Sharma", "सुनीता शर्मा", "Rameshwar Sharma", "रामेश्वर शर्मा")
]

VILLAGE_POOL = [
    ("Semra", "सेमरा"), ("Hasda", "हसदा"), ("Bhanpuri", "भानपुरी"), ("Navagaon", "नवागांव"),
    ("Khurpa", "खुरपा"), ("Tenda", "टेंडा"), ("Pipariya", "पिपरिया"), ("Nandghat", "नंदघाट"),
    ("Arang", "आरंग"), ("Abhanpur", "अभनपुर"), ("Mana", "माना"), ("Patan", "पाटन"),
    ("Kurud", "कुरुद"), ("Dhamtari", "धमतरी"), ("Bhatapara", "भाटापारा"), ("Tilda", "तिल्दा"),
    ("Sankra", "सांकरा"), ("Dunda", "डूंडा"), ("Chandkhuri", "चंदखुरी"), ("Birgaon", "बीरगांव"),
    ("Raipura", "रायपुरा"), ("Boria", "बोरिया"), ("Mandir Hasaud", "मंदिर हसौद"),
    ("Korpali", "कोरपाली"), ("Tarighat", "तारीघाट"), ("Khokhra", "खोखरा")
]

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def find_nearest_district(lat: float, lng: float) -> Dict[str, Any]:
    if not DISTRICTS_DATA:
        return {"district": "Raipur", "district_hi": "रायपुर", "division": "Raipur", "distance_km": 0.0}
    
    best_dist = float('inf')
    best_d = DISTRICTS_DATA[0]
    for d in DISTRICTS_DATA:
        dist = haversine_km(lat, lng, d["latitude"], d["longitude"])
        if dist < best_dist:
            best_dist = dist
            best_d = d
            
    return {
        "district": best_d["district"],
        "district_hi": best_d["district_hi"],
        "division": best_d["division"],
        "distance_km": round(best_dist, 2)
    }

def generate_on_demand_parcel(lat: float, lng: float) -> Dict[str, Any]:
    """
    Generates a deterministic Voronoi cadastral parcel for any lat/lng in Chhattisgarh.
    Grid cell size ~ 300m (0.0025 deg lat, 0.0027 deg lng).
    """
    d_lat, d_lng = 0.0025, 0.0027
    row = int(math.floor(lat / d_lat))
    col = int(math.floor(lng / d_lng))

    seeds = []
    seed_meta = []
    
    for r in range(row - 2, row + 3):
        for c in range(col - 2, col + 3):
            cell_seed = (r * 73856093 ^ c * 19349663) & 0x7FFFFFFF
            rng = random.Random(cell_seed)
            for i in range(3):
                s_lat = (r + rng.uniform(0.1, 0.9)) * d_lat
                s_lng = (c + rng.uniform(0.1, 0.9)) * d_lng
                seeds.append((s_lng, s_lat))
                seed_meta.append((r, c, i))

    seeds_arr = np.array(seeds)
    target_pt = np.array([lng, lat])
    dists = np.linalg.norm(seeds_arr - target_pt, axis=1)
    nearest_idx = int(np.argmin(dists))

    vor = Voronoi(seeds_arr)
    region_idx = vor.point_region[nearest_idx]
    region = vor.regions[region_idx]

    bbox = box(lng - 0.004, lat - 0.004, lng + 0.004, lat + 0.004)

    if -1 not in region and len(region) > 2:
        poly_pts = [vor.vertices[i] for i in region]
        raw_poly = Polygon(poly_pts)
        poly = raw_poly.intersection(bbox)
        if poly.is_empty or not isinstance(poly, Polygon):
            poly = box(seeds[nearest_idx][0] - 0.0008, seeds[nearest_idx][1] - 0.0008, seeds[nearest_idx][0] + 0.0008, seeds[nearest_idx][1] + 0.0008)
    else:
        nearest_seed = seeds[nearest_idx]
        poly = box(nearest_seed[0] - 0.0008, nearest_seed[1] - 0.0008, nearest_seed[0] + 0.0008, nearest_seed[1] + 0.0008)

    # Metric area calculation
    approx_area_sqm = poly.area * 110900.0 * 103500.0 * math.cos(math.radians(lat))
    area_ha = round(max(0.2, min(3.2, approx_area_sqm / 10000.0)), 2)
    area_acres = round(area_ha * 2.47105, 2)
    area_bigha = round(area_ha * 3.95, 2)
    area_sqm = round(area_ha * 10000.0, 1)

    # District & Tehsil lookup
    nearest_dist_info = find_nearest_district(lat, lng)
    district_en = nearest_dist_info["district"]
    district_hi = nearest_dist_info["district_hi"]
    tehsil_en = f"{district_en} Khas"
    tehsil_hi = f"{district_hi} खास"

    # Virtual village block (3 km blocks)
    v_row = int(math.floor(lat / (d_lat * 12)))
    v_col = int(math.floor(lng / (d_lng * 12)))
    v_hash = (v_row * 31337 + v_col * 99991) & 0x7FFFFFFF
    village_en, village_hi = VILLAGE_POOL[v_hash % len(VILLAGE_POOL)]

    # Deterministic Khasra Number
    r_target, c_target, i_target = seed_meta[nearest_idx]
    khasra_idx = 1 + ((r_target * 1009 + c_target * 503 + i_target * 37) % 320)
    sub_idx = (r_target + c_target) % 3
    khasra_no = f"{khasra_idx}/{sub_idx + 1}" if sub_idx > 0 else f"{khasra_idx}"
    khata_no = f"KH-{100 + (khasra_idx % 180)}"

    # Deterministic Attribute Generator
    parcel_seed = (r_target * 31337 + c_target * 99991 + khasra_idx * 13) & 0x7FFFFFFF
    prng = random.Random(parcel_seed)

    owner_en, owner_hi, father_en, father_hi = prng.choice(OWNERS_POOL)
    land_types = ["IRRIGATED", "RAIN_FED", "BANJAR", "RESIDENTIAL", "COMMERCIAL", "FOREST"]
    l_type = prng.choice(land_types)
    soil_types = ["Matasi (Yellow Clay Soil)", "Dorsa (Medium Clay-Loam)", "Kanhar (Deep Black Cotton Soil)", "Bhata (Red Gravelly Soil)"]
    s_type = prng.choice(soil_types)
    irrigation_sources = ["Mahanadi Canal Network", "Tube Well / Borewell", "Pond / Stop Dam", "Hasdeo Canal System", "Rainfed"]
    irr_src = prng.choice(irrigation_sources)
    market_value = round(prng.uniform(12.5, 45.0), 1)
    circle_rate = round(market_value * 0.75, 1)
    litigation_statuses = ["No dispute", "SDM Court Partition Appeal", "Pending Boundary Case"]
    lit_stat = prng.choice(litigation_statuses)
    encumbrance_statuses = ["Nil / Unencumbered", "Bank Mortgage (SBI)", "Cooperative Society Loan"]
    enc_stat = prng.choice(encumbrance_statuses)
    mutation_statuses = ["Mutated", "Hearing Scheduled", "Pending Notice"]
    mut_stat = prng.choice(mutation_statuses)
    tribal_flag = (prng.random() < 0.15)

    dist_code = district_en[:3].upper()
    parcel_id = f"CG-{dist_code}-{abs(v_row)%99:02d}{abs(v_col)%99:02d}-{khasra_idx:04d}"

    centroid_lat = round(poly.centroid.y, 6)
    centroid_lng = round(poly.centroid.x, 6)

    min_lng, min_lat, max_lng, max_lat = poly.bounds

    return {
        "parcel_id": parcel_id,
        "khasra_no": khasra_no,
        "khata_no": khata_no,
        "village": village_en,
        "village_hi": village_hi,
        "tehsil": tehsil_en,
        "tehsil_hi": tehsil_hi,
        "district": district_en,
        "district_hi": district_hi,
        "state": "Chhattisgarh",
        "owner_name": owner_en,
        "owner_name_hi": owner_hi,
        "father_name": father_en,
        "father_name_hi": father_hi,
        "area_hectares": area_ha,
        "area_acres": area_acres,
        "area_bigha": area_bigha,
        "area_sqm": area_sqm,
        "land_type": l_type,
        "soil_type": s_type,
        "irrigation_source": irr_src,
        "market_value_per_ha": market_value,
        "circle_rate": circle_rate,
        "last_mutation_date": "2023-04-15",
        "mutation_status": mut_stat,
        "encumbrance_status": enc_stat,
        "litigation_status": lit_stat,
        "case_status": "pending" if lit_stat != "No dispute" else "none",
        "case_details": lit_stat if lit_stat != "No dispute" else "No active legal dispute recorded.",
        "tribal_sensitive": tribal_flag,
        "forest_distance_km": round(prng.uniform(1.0, 8.0), 1),
        "highway_distance_km": round(prng.uniform(0.5, 5.0), 1),
        "data_source": "Demo data",
        "wkt_geometry": poly.wkt,
        "geojson_geometry": mapping(poly),
        "centroid_lat": centroid_lat,
        "centroid_lng": centroid_lng,
        "min_lat": round(min_lat, 6),
        "min_lng": round(min_lng, 6),
        "max_lat": round(max_lat, 6),
        "max_lng": round(max_lng, 6),
        "is_synthetic": True
    }


@router.get("/identify")
def identify_location(
    lat: float = Query(..., description="Latitude coordinate"),
    lng: float = Query(..., description="Longitude coordinate"),
    zoom: Optional[float] = Query(15.0, description="Current map zoom level"),
    db: Session = Depends(get_db)
):
    """
    Identifies the land parcel, district, highway, and forest area at any (lat, lng) point in Chhattisgarh.
    If a database parcel (such as seeded pilot parcels) contains the point, it overrides the generated one.
    Otherwise, generates a deterministic Voronoi parcel on demand.
    """
    target_pt = Point(lng, lat)
    
    # 1. Database parcel override search
    candidate_parcels = db.query(Parcel).filter(
        Parcel.min_lat <= lat + 0.001,
        Parcel.max_lat >= lat - 0.001,
        Parcel.min_lng <= lng + 0.001,
        Parcel.max_lng >= lng - 0.001
    ).all()

    db_parcel = None
    for p in candidate_parcels:
        try:
            poly = Polygon(p.geojson_geometry["coordinates"][0])
            if poly.contains(target_pt) or poly.distance(target_pt) < 0.0001:
                db_parcel = p
                break
        except Exception:
            continue

    if db_parcel:
        parcel_data = {
            "parcel_id": db_parcel.parcel_id,
            "khasra_no": db_parcel.khasra_no,
            "khata_no": db_parcel.khata_no,
            "village": db_parcel.village,
            "village_hi": db_parcel.village_hi,
            "tehsil": db_parcel.tehsil,
            "tehsil_hi": db_parcel.tehsil_hi,
            "district": db_parcel.district,
            "district_hi": db_parcel.district_hi,
            "state": db_parcel.state,
            "owner_name": db_parcel.owner_name,
            "owner_name_hi": db_parcel.owner_name_hi,
            "father_name": db_parcel.father_name,
            "father_name_hi": db_parcel.father_name_hi,
            "area_hectares": db_parcel.area_hectares,
            "area_acres": db_parcel.area_acres,
            "area_bigha": db_parcel.area_bigha,
            "area_sqm": db_parcel.area_sqm,
            "land_type": db_parcel.land_type,
            "soil_type": db_parcel.soil_type,
            "irrigation_source": db_parcel.irrigation_source,
            "market_value_per_ha": db_parcel.market_value_per_ha,
            "circle_rate": db_parcel.circle_rate,
            "last_mutation_date": db_parcel.last_mutation_date,
            "mutation_status": db_parcel.mutation_status,
            "encumbrance_status": db_parcel.encumbrance_status,
            "litigation_status": db_parcel.litigation_status,
            "case_status": db_parcel.case_status,
            "case_details": db_parcel.case_details,
            "tribal_sensitive": db_parcel.tribal_sensitive,
            "forest_distance_km": db_parcel.forest_distance_km,
            "highway_distance_km": db_parcel.highway_distance_km,
            "data_source": "Demo data",
            "wkt_geometry": db_parcel.wkt_geometry,
            "geojson_geometry": db_parcel.geojson_geometry,
            "centroid_lat": db_parcel.centroid_lat,
            "centroid_lng": db_parcel.centroid_lng,
            "min_lat": db_parcel.min_lat,
            "min_lng": db_parcel.min_lng,
            "max_lat": db_parcel.max_lat,
            "max_lng": db_parcel.max_lng,
            "is_synthetic": db_parcel.is_synthetic
        }
    else:
        # 2. On-demand Voronoi parcel generation
        parcel_data = generate_on_demand_parcel(lat, lng)

    # 3. Nearest District Info
    district_info = find_nearest_district(lat, lng)

    # 4. Forest Area Lookup
    candidate_forests = db.query(ForestArea).filter(
        ForestArea.min_lat <= lat + 0.05,
        ForestArea.max_lat >= lat - 0.05,
        ForestArea.min_lng <= lng + 0.05,
        ForestArea.max_lng >= lng - 0.05
    ).all()

    forest_info = None
    for f in candidate_forests:
        try:
            coords = f.geojson_geometry["coordinates"][0]
            f_poly = Polygon(coords)
            if f_poly.contains(target_pt) or f_poly.distance(target_pt) < 0.0001:
                forest_info = {
                    "forest_id": f.forest_id,
                    "name": f.name,
                    "name_hi": f.name_hi,
                    "type": f.type,
                    "district": f.district,
                    "area_km2": f.area_km2,
                    "canopy_density": f.canopy_density,
                    "main_species": f.main_species,
                    "wildlife": f.wildlife,
                    "elephant_corridor": f.elephant_corridor,
                    "eco_sensitive_buffer_km": f.eco_sensitive_buffer_km,
                    "forest_clearance_required": f.forest_clearance_required,
                    "fra_claims_count": f.fra_claims_count,
                    "estimated_tree_count": f.estimated_tree_count,
                    "carbon_stock_estimate_tons": f.carbon_stock_estimate_tons,
                    "loss_time_series": f.loss_time_series,
                    "geojson_geometry": f.geojson_geometry,
                    "data_source": "Demo data",
                    "approximate": f.approximate
                }
                break
        except Exception:
            continue

    # If tapped inside a forest, override parcel land_type, market value & clearance flag
    if forest_info:
        parcel_data["land_type"] = "FOREST"
        parcel_data["market_value_per_ha"] = round(parcel_data["market_value_per_ha"] * 0.6, 1)
        parcel_data["forest_clearance_required"] = True
        parcel_data["forest_distance_km"] = 0.0

    highway_info = None

    return {
        "status": "success",
        "data_source": "Demo data",
        "parcel": parcel_data,
        "district": district_info,
        "forest": forest_info,
        "highway": highway_info
    }
