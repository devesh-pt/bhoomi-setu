#!/usr/bin/env python3
"""
Synthetic Parcel & Ownership Generator for BHUMISETU
Generates 2,000+ realistic cadastral parcels tiled over the central India demo district
(Sehore & Budhni Corridor, MP), seeding reproducible owner names, khasra numbers,
and land types derived from spatial region distribution.
Populates SQLite / Postgres database with is_synthetic = True records.
"""

import os
import sys
import random
import math
import json
from pathlib import Path

# Add backend directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.db.session import engine, Base, SessionLocal
from app.models.user import User
from app.models.parcel import Parcel
from app.models.highway import Highway
from app.models.case import LandCase
from app.core.security import get_password_hash

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

INDIAN_FIRST_NAMES = [
    "Ramesh", "Suresh", "Rajesh", "Mahendra", "Dinesh", "Mukesh", "Vijay", "Sunil", "Anil", "Prakash",
    "Kamlesh", "Sananjay", "Gopal", "Ram", "Shyam", "Kailash", "Mohan", "Devendra", "Hari", "Satish",
    "Sunita", "Anita", "Geeta", "Radha", "Kamla", "Saraswati", "Manju", "Pushpa", "Usha", "Shanti"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Patel", "Singh", "Yadav", "Chouhan", "Gupta", "Joshi", "Mishra", "Tiwari",
    "Rathore", "Malviya", "Meena", "Thakur", "Soni", "Pandey", "Agarwal", "Solanki", "Rajput", "Deshmukh"
]

VILLAGES = [
    "Budhni", "Rehti", "Shahganj", "Bakraaj", "Bakhtra", "Bhairopur", "Barni", "Baya", "Chakaldi", "Dolariya",
    "Gopalpur", "Hasalpur", "Jawai", "Khatpura", "Ladkui", "Mahuakheda", "Nasrullaganj", "Pangarh", "Semri", "Unchod"
]

BASE_MARKET_RATES = {
    "IRRIGATED": 25.0,
    "RAIN_FED": 16.0,
    "BANJAR": 6.0,
    "FOREST": 12.0,
    "RESIDENTIAL": 55.0,
    "COMMERCIAL": 85.0
}

def get_weighted_land_type(lat: float, lng: float) -> str:
    """Deterministically assign land type based on spatial coordinate mock raster rules."""
    val = math.sin(lat * 100.0) * math.cos(lng * 100.0)
    if val > 0.45:
        return "FOREST"
    elif val < -0.40:
        return "BANJAR"
    elif val > 0.15:
        return "IRRIGATED"
    elif val < -0.15:
        return "RAIN_FED"
    elif abs(val) < 0.05:
        return "RESIDENTIAL"
    return "RAIN_FED"

def generate_parcels(db, total_parcels: int = 2000):
    print(f"[INFO] Generating {total_parcels} synthetic cadastral parcels over Sehore & Budhni Corridor...")
    
    min_lat, max_lat = 22.6500, 22.8500
    min_lng, max_lng = 77.1000, 77.4000
    
    grid_steps = int(math.sqrt(total_parcels))
    lat_step = (max_lat - min_lat) / grid_steps
    lng_step = (max_lng - min_lng) / grid_steps
    
    db.query(LandCase).delete()
    db.query(Parcel).delete()
    db.commit()

    parcels_buffer = []
    cases_buffer = []
    count = 0
    
    for i in range(grid_steps):
        for j in range(grid_steps):
            count += 1
            b_lat = min_lat + (i * lat_step) + random.uniform(-0.001, 0.001)
            b_lng = min_lng + (j * lng_step) + random.uniform(-0.001, 0.001)
            
            p_width = random.uniform(0.002, 0.004)
            p_height = random.uniform(0.002, 0.004)
            
            poly_coords = [
                [round(b_lng, 6), round(b_lat, 6)],
                [round(b_lng + p_width, 6), round(b_lat, 6)],
                [round(b_lng + p_width, 6), round(b_lat + p_height, 6)],
                [round(b_lng, 6), round(b_lat + p_height, 6)],
                [round(b_lng, 6), round(b_lat, 6)]
            ]
            
            centroid_lat = round(b_lat + (p_height / 2.0), 6)
            centroid_lng = round(b_lng + (p_width / 2.0), 6)
            
            area_ha = round((p_width * 111.0) * (p_height * 111.0) * 100.0, 2)
            if area_ha < 0.5:
                area_ha = 1.25
            area_acres = round(area_ha * 2.47105, 2)
            area_bigha = round(area_ha * 3.95, 2)
            
            village = random.choice(VILLAGES)
            khasra_main = random.randint(101, 999)
            sub_num = random.choice(["", "/1", "/2", "/1-A", "/3-B"])
            khasra_no = f"{khasra_main}{sub_num}"
            parcel_id = f"MP-SEH-{village[:3].upper()}-{count:04d}"
            
            owner = f"{random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}"
            land_type = get_weighted_land_type(centroid_lat, centroid_lng)
            market_rate = BASE_MARKET_RATES.get(land_type, 15.0) * random.uniform(0.9, 1.1)
            
            case_prob = random.random()
            if case_prob < 0.12:
                case_status = "pending"
                case_details = f"Pending revenue dispute in SDO Court, Sehore regarding khasra partition and boundary alignment."
            elif case_prob < 0.20:
                case_status = "disposed"
                case_details = f"Disposed by District Court Sehore in 2021. Title confirmed in favor of current recorded owner."
            else:
                case_status = "none"
                case_details = "No legal dispute or title encumbrance recorded."
                
            parcel_obj = Parcel(
                parcel_id=parcel_id,
                khasra_no=khasra_no,
                village=village,
                district="Sehore",
                state="Madhya Pradesh",
                owner_name=owner,
                area_hectares=area_ha,
                area_acres=area_acres,
                area_bigha=area_bigha,
                land_type=land_type,
                market_value_per_ha=round(market_rate, 2),
                case_status=case_status,
                case_details=case_details,
                geojson_geometry={
                    "type": "Polygon",
                    "coordinates": [poly_coords]
                },
                centroid_lat=centroid_lat,
                centroid_lng=centroid_lng,
                is_synthetic=True
            )
            parcels_buffer.append(parcel_obj)
            
            if case_status != "none":
                case_obj = LandCase(
                    parcel_id=parcel_id,
                    case_number=f"CS/{2020 + random.randint(0,4)}/{count:04d}",
                    court_name="Revenue Tribunal / District Court Sehore",
                    case_type=random.choice(["Title Dispute", "Compensation Enhancement", "Boundary Partition", "Inheritance Challenge"]),
                    petitioner=f"State / {random.choice(INDIAN_FIRST_NAMES)} {random.choice(INDIAN_LAST_NAMES)}",
                    respondent=owner,
                    status="Pending" if case_status == "pending" else "Disposed",
                    filed_year=2020 + random.randint(0,4),
                    case_age_years=round(random.uniform(1.0, 5.5), 1),
                    document_completeness_pct=round(random.uniform(60.0, 95.0), 1),
                    dispute_severity=random.choice(["High", "Medium", "Low"]),
                    summary=case_details
                )
                cases_buffer.append(case_obj)
                
    db.bulk_save_objects(parcels_buffer)
    db.bulk_save_objects(cases_buffer)
    db.commit()
    print(f"[SUCCESS] Successfully seeded {len(parcels_buffer)} synthetic parcels and {len(cases_buffer)} land dispute cases.")

def generate_highways(db):
    db.query(Highway).delete()
    db.commit()
        
    nh46 = Highway(
        highway_id="NH-46",
        name="National Highway 46 (Gwalior-Bhopal-Betul)",
        code="NH-46",
        category="National Highway",
        total_length_km=42.5,
        geojson_geometry={
            "type": "LineString",
            "coordinates": [
                [77.1200, 22.6700],
                [77.1800, 22.7100],
                [77.2500, 22.7500],
                [77.3200, 22.7900],
                [77.3800, 22.8300]
            ]
        }
    )
    sh22 = Highway(
        highway_id="SH-22",
        name="State Highway 22 (Bhopal-Hoshangabad Link)",
        code="SH-22",
        category="State Highway",
        total_length_km=31.0,
        geojson_geometry={
            "type": "LineString",
            "coordinates": [
                [77.3000, 22.6600],
                [77.2600, 22.7200],
                [77.2200, 22.7800],
                [77.2000, 22.8400]
            ]
        }
    )
    db.add(nh46)
    db.add(sh22)
    db.commit()
    print("[SUCCESS] Seeded highway corridor geometries.")

def generate_demo_users(db):
    # Wipe old user accounts to guarantee clean un-locked state
    db.query(User).delete()
    db.commit()

    admin_user = User(
        username="admin",
        email="admin@bhumisetu.gov.in",
        full_name="District Collector / Admin",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True,
        failed_login_attempts=0,
        locked_until=None
    )
    officer_user = User(
        username="officer",
        email="lao@bhumisetu.gov.in",
        full_name="Land Acquisition Officer (LAO)",
        hashed_password=get_password_hash("officer123"),
        role="officer",
        is_active=True,
        failed_login_attempts=0,
        locked_until=None
    )
    citizen_user = User(
        username="citizen",
        email="citizen@bhumisetu.gov.in",
        full_name="Ramesh Chandra Sharma (Landowner)",
        hashed_password=get_password_hash("user123"),
        role="citizen",
        is_active=True,
        failed_login_attempts=0,
        locked_until=None
    )
    db.add(admin_user)
    db.add(officer_user)
    db.add(citizen_user)
    db.commit()
    print("[SUCCESS] Seeded fresh demo users (admin/admin123, officer/officer123, citizen/user123).")

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        generate_demo_users(db)
        generate_highways(db)
        generate_parcels(db, total_parcels=2025)
        print("=" * 60)
        print("BHUMISETU Synthetic Data Generation Completed!")
        print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    main()
