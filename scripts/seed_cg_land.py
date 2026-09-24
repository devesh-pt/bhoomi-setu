#!/usr/bin/env python3
"""
Chhattisgarh 33-District State Cadastral Parcel Seeding Script for BHUMISETU
Idempotently loads districts_cg.csv and parcels_cg_demo.csv into the database.
Reads files as UTF-8 with full Devanagari support and stores WKT/GeoJSON geometries with bounding boxes.
"""

import os
import sys
import csv
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.db.session import engine, Base, SessionLocal
from app.models.user import User
from app.models.district import District
from app.models.parcel import Parcel
from app.models.highway import Highway
from app.models.case import LandCase
from app.models.forest import ForestArea
from app.core.security import get_password_hash

def parse_wkt_polygon(wkt_str):
    """
    Parses a WKT POLYGON string like:
    POLYGON((lng1 lat1, lng2 lat2, ...)) into a GeoJSON Geometry dict.
    Returns (geojson_dict, min_lat, min_lng, max_lat, max_lng, cent_lat, cent_lng)
    """
    if not wkt_str or "POLYGON" not in wkt_str.upper():
        # Fallback square polygon
        coords = [[81.63, 21.25], [81.635, 21.25], [81.635, 21.255], [81.63, 21.255], [81.63, 21.25]]
        return {
            "type": "Polygon",
            "coordinates": [coords]
        }, 21.25, 81.63, 21.255, 81.635, 21.2525, 81.6325

    try:
        # Extract numbers inside POLYGON(( ... ))
        coord_part = re.search(r'\(\((.*?)\)\)', wkt_str)
        if not coord_part:
            coord_part = re.search(r'\((.*?)\)', wkt_str)
        
        pairs = coord_part.group(1).split(',')
        ring = []
        lats = []
        lngs = []
        
        for p in pairs:
            parts = p.strip().split()
            if len(parts) >= 2:
                lng = float(parts[0])
                lat = float(parts[1])
                ring.append([lng, lat])
                lngs.append(lng)
                lats.append(lat)

        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        cent_lat = round((min_lat + max_lat) / 2.0, 6)
        cent_lng = round((min_lng + max_lng) / 2.0, 6)

        geojson = {
            "type": "Polygon",
            "coordinates": [ring]
        }
        return geojson, min_lat, min_lng, max_lat, max_lng, cent_lat, cent_lng
    except Exception as e:
        coords = [[81.63, 21.25], [81.635, 21.25], [81.635, 21.255], [81.63, 21.255], [81.63, 21.25]]
        return {
            "type": "Polygon",
            "coordinates": [coords]
        }, 21.25, 81.63, 21.255, 81.635, 21.2525, 81.6325

def seed_demo_users(db):
    demo_users = [
        {"username": "admin", "email": "admin@bhumisetu.gov.in", "full_name": "LAO Officer (Admin)", "role": "admin", "pass": "admin123"},
        {"username": "officer", "email": "officer@bhumisetu.gov.in", "full_name": "Tehsildar Officer", "role": "officer", "pass": "officer123"},
        {"username": "citizen", "email": "citizen@bhumisetu.gov.in", "full_name": "Public Citizen", "role": "citizen", "pass": "user123"}
    ]
    for u in demo_users:
        existing = db.query(User).filter(User.username == u["username"]).first()
        if not existing:
            user = User(
                username=u["username"],
                email=u["email"],
                full_name=u["full_name"],
                role=u["role"],
                hashed_password=get_password_hash(u["pass"]),
                is_active=True
            )
            db.add(user)
    db.commit()
    print("[SUCCESS] Idempotently seeded demo users.")

def seed_districts_csv(db, csv_path):
    if not os.path.exists(csv_path):
        print(f"[WARN] District CSV not found at {csv_path}")
        return

    db.query(District).delete()
    db.commit()

    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        districts_to_add = []
        for row in reader:
            d = District(
                district=row.get("district", "").strip(),
                district_hi=row.get("district_hi", "").strip() or row.get("district", "").strip(),
                division=row.get("division", "").strip(),
                latitude=float(row.get("latitude", 21.25)),
                longitude=float(row.get("longitude", 81.63)),
                note=row.get("note", "").strip()
            )
            districts_to_add.append(d)

    db.add_all(districts_to_add)
    db.commit()
    print(f"[SUCCESS] Idempotently loaded {len(districts_to_add)} districts from {csv_path}.")

def seed_parcels_csv(db, csv_path):
    if not os.path.exists(csv_path):
        print(f"[WARN] Parcel CSV not found at {csv_path}")
        return

    db.query(Parcel).delete()
    db.commit()

    parcels_to_add = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            wkt = row.get("wkt_geometry", "").strip()
            geojson_geom, min_lat, min_lng, max_lat, max_lng, c_lat, c_lng = parse_wkt_polygon(wkt)
            
            # Read centroid if explicitly present, else use calculated
            raw_c_lat = row.get("centroid_lat")
            raw_c_lng = row.get("centroid_lng")
            if raw_c_lat and raw_c_lat.strip():
                c_lat = float(raw_c_lat)
            if raw_c_lng and raw_c_lng.strip():
                c_lng = float(raw_c_lng)

            # Prevent 'No dispute' or blank values from becoming nulls
            litigation = row.get("litigation_status", "").strip() or "No dispute"
            mutation = row.get("mutation_status", "").strip() or "Mutated"
            encumbrance = row.get("encumbrance_status", "").strip() or "Nil / Unencumbered"
            tribal_flag = str(row.get("tribal_sensitive", "")).strip().lower() in ["1", "true", "yes"]

            # Mark natural CSV pilot villages
            pilot_villages = {"Semra", "Hasda", "Bhanpuri", "Navagaon"}
            is_pilot_flag = row.get("village", "").strip() in pilot_villages

            p = Parcel(
                parcel_id=row.get("parcel_id", "").strip(),
                khasra_no=row.get("khasra_no", "").strip(),
                khata_no=row.get("khata_no", "").strip() or "KH-104",
                village=row.get("village", "").strip(),
                village_hi=row.get("village_hi", "").strip() or row.get("village", "").strip(),
                tehsil=row.get("tehsil", "").strip(),
                tehsil_hi=row.get("tehsil_hi", "").strip() or row.get("tehsil", "").strip(),
                district=row.get("district", "").strip(),
                district_hi=row.get("district_hi", "").strip() or row.get("district", "").strip(),
                state="Chhattisgarh",
                owner_name=row.get("owner_name", "").strip(),
                owner_name_hi=row.get("owner_name_hi", "").strip() or row.get("owner_name", "").strip(),
                father_name=row.get("father_name", "").strip() or "N/A",
                father_name_hi=row.get("father_name_hi", "").strip() or "N/A",
                area_hectares=float(row.get("area_hectares", 1.0)),
                area_acres=float(row.get("area_acres", 2.47)),
                area_bigha=float(row.get("area_bigha", 3.95)),
                area_sqm=float(row.get("area_sqm", 10000.0)),
                land_type=row.get("land_type", "IRRIGATED").strip().upper(),
                soil_type=row.get("soil_type", "").strip() or "Matasi Soil",
                irrigation_source=row.get("irrigation_source", "").strip() or "Canal Network",
                market_value_per_ha=float(row.get("market_value_per_ha", 15.0)),
                circle_rate=float(row.get("circle_rate", 12.5)),
                last_mutation_date=row.get("last_mutation_date", "").strip() or "2023-01-01",
                mutation_status=mutation,
                encumbrance_status=encumbrance,
                litigation_status=litigation,
                case_status="pending" if "pending" in litigation.lower() or "stay" in litigation.lower() else ("disposed" if "disposed" in litigation.lower() else "none"),
                case_details=litigation if litigation != "No dispute" else "No active legal dispute recorded.",
                tribal_sensitive=tribal_flag,
                forest_distance_km=float(row.get("forest_distance_km", 2.5)),
                highway_distance_km=float(row.get("highway_distance_km", 1.5)),
                data_source=row.get("data_source", "synthetic_demo").strip(),
                wkt_geometry=wkt,
                geojson_geometry=geojson_geom,
                centroid_lat=c_lat,
                centroid_lng=c_lng,
                min_lat=float(row.get("min_lat", min_lat)) if row.get("min_lat") else min_lat,
                min_lng=float(row.get("min_lng", min_lng)) if row.get("min_lng") else min_lng,
                max_lat=float(row.get("max_lat", max_lat)) if row.get("max_lat") else max_lat,
                max_lng=float(row.get("max_lng", max_lng)) if row.get("max_lng") else max_lng,
                is_synthetic=True,
                is_pilot=is_pilot_flag
            )
            parcels_to_add.append(p)

    db.add_all(parcels_to_add)
    db.commit()
    print(f"[SUCCESS] Idempotently loaded {len(parcels_to_add)} parcels from {csv_path}.")

def seed_demo_mutations(db):
    from app.models.mutation import MutationApplication
    db.query(MutationApplication).delete()
    db.commit()

    mutations = [
        MutationApplication(
            application_id="CG-MUT-1001",
            parcel_id="CG-RAI-0001",
            khasra_no="860/2",
            applicant_name="Rajesh Verma",
            applicant_phone="9876543210",
            mutation_type="Registered Transfer / Sale (बिक्री नामांतरण)",
            transferor_name="Bhupendra Verma",
            transferee_name="Rajesh Verma",
            status="objection_window",
            stage_index=3,
            remarks="Registered sale deed submitted. Public notice 15-day objection window active."
        ),
        MutationApplication(
            application_id="CG-MUT-1002",
            parcel_id="CG-RAI-0002",
            khasra_no="560/3-B",
            applicant_name="Devendra Kashyap",
            applicant_phone="9888888888",
            mutation_type="Inheritance (फौती नामांतरण)",
            transferor_name="Ramesh Kashyap (Deceased)",
            transferee_name="Devendra Kashyap",
            status="notice_issued",
            stage_index=2,
            remarks="Death certificate verified. Public notice published in Gram Panchayat."
        ),
        MutationApplication(
            application_id="CG-MUT-1003",
            parcel_id="CG-RAI-0003",
            khasra_no="228/1-A",
            applicant_name="Phoolchand Chandrakar",
            applicant_phone="9999999999",
            mutation_type="Partition (बंटवारा)",
            transferor_name="Ghanshyam Chandrakar",
            transferee_name="Phoolchand Chandrakar",
            status="applied",
            stage_index=1,
            remarks="Joint family partition deed submitted to Tehsildar court."
        )
    ]
    db.add_all(mutations)
    db.commit()
    print(f"[SUCCESS] Idempotently loaded {len(mutations)} demo mutation applications.")

def seed_forests_json(db, json_path):
    if not os.path.exists(json_path):
        print(f"[WARN] Forest GeoJSON not found at {json_path}")
        return

    db.query(ForestArea).delete()
    db.commit()

    with open(json_path, mode="r", encoding="utf-8") as f:
        data = json.load(f)

    forests_to_add = []
    for feat in data.get("features", []):
        props = feat.get("properties", {})
        geom = feat.get("geometry", {})

        coords = geom.get("coordinates", [[]])[0]
        if not coords:
            continue
        lats = [pt[1] for pt in coords]
        lngs = [pt[0] for pt in coords]
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)

        f_obj = ForestArea(
            forest_id=props.get("id"),
            name=props.get("name"),
            name_hi=props.get("name_hi"),
            type=props.get("type"),
            district=props.get("district"),
            area_km2=float(props.get("area_km2", 0.0)),
            canopy_density=props.get("canopy_density", "Moderately Dense"),
            main_species=props.get("main_species", ""),
            wildlife=props.get("wildlife", ""),
            elephant_corridor=bool(props.get("elephant_corridor", False)),
            eco_sensitive_buffer_km=float(props.get("eco_sensitive_buffer_km", 1.0)),
            forest_clearance_required=bool(props.get("forest_clearance_required", True)),
            fra_claims_count=int(props.get("fra_claims_count", 0)),
            estimated_tree_count=int(props.get("estimated_tree_count", 0)),
            carbon_stock_estimate_tons=float(props.get("carbon_stock_estimate_tons", 0.0)),
            loss_time_series=props.get("loss_time_series", []),
            geojson_geometry=geom,
            wkt_geometry=f"POLYGON(({', '.join([f'{p[0]} {p[1]}' for p in coords])}))",
            min_lat=min_lat,
            min_lng=min_lng,
            max_lat=max_lat,
            max_lng=max_lng,
            data_source=props.get("data_source", "Demo data"),
            approximate=bool(props.get("approximate", True))
        )
        forests_to_add.append(f_obj)

    db.add_all(forests_to_add)
    db.commit()
    print(f"[SUCCESS] Idempotently loaded {len(forests_to_add)} forest areas from {json_path}.")

def seed_highways_data(db):
    db.query(Highway).delete()
    db.commit()

    highways = [
        Highway(
            highway_id="NH-30",
            name="National Highway 30 (Raipur-Abhanpur-Dhamtari Corridor)",
            code="NH-30",
            category="National Highway",
            total_length_km=42.5,
            geojson_geometry={
                "type": "LineString",
                "coordinates": [
                    [81.632, 21.280],
                    [81.635, 21.260],
                    [81.640, 21.240],
                    [81.645, 21.220],
                    [81.650, 21.150]
                ]
            }
        ),
        Highway(
            highway_id="NH-53",
            name="National Highway 53 (Durg-Bhilai-Raipur-Arang Link)",
            code="NH-53",
            category="National Highway",
            total_length_km=38.0,
            geojson_geometry={
                "type": "LineString",
                "coordinates": [
                    [81.580, 21.250],
                    [81.610, 21.255],
                    [81.635, 21.258],
                    [81.660, 21.260],
                    [81.700, 21.265]
                ]
            }
        ),
        Highway(
            highway_id="NH-130",
            name="National Highway 130 (Raipur-Simga-Bilaspur Link)",
            code="NH-130",
            category="National Highway",
            total_length_km=54.2,
            geojson_geometry={
                "type": "LineString",
                "coordinates": [
                    [81.625, 21.220],
                    [81.630, 21.245],
                    [81.635, 21.270],
                    [81.640, 21.290],
                    [81.650, 21.350]
                ]
            }
        )
    ]
    db.add_all(highways)
    db.commit()
    print(f"[SUCCESS] Idempotently seeded {len(highways)} highways.")

def main():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        districts_csv = BASE_DIR / "backend" / "data" / "districts_cg.csv"
        parcels_csv = BASE_DIR / "backend" / "data" / "parcels_cg_demo.csv"
        forests_geojson = BASE_DIR / "backend" / "data" / "forest_areas.geojson"

        seed_demo_users(db)
        seed_districts_csv(db, str(districts_csv))
        seed_parcels_csv(db, str(parcels_csv))
        seed_demo_mutations(db)
        seed_forests_json(db, str(forests_geojson))
        seed_highways_data(db)

        print("=" * 60)
        print("BHUMISETU Chhattisgarh CSV Data & Forest Seeding Completed!")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    main()

