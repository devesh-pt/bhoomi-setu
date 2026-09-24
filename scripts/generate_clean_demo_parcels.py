#!/usr/bin/env python3
"""
Generates 3,300 clean, non-overlapping, irregular Voronoi field polygons across all 33 Chhattisgarh districts for BHUMISETU.
Replaces square grid boxes in backend/data/parcels_cg_demo.csv with authentic-looking
cadastral field boundaries that have ZERO overlaps and realistic areas.
"""

import csv
import json
import random
import math
from pathlib import Path
import numpy as np
from scipy.spatial import Voronoi
from shapely.geometry import Polygon, box, mapping, Point

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "backend" / "data" / "parcels_cg_demo.csv"
DISTRICTS_CSV = BASE_DIR / "backend" / "data" / "districts_cg.csv"

# Read 33 districts
districts_data = []
if DISTRICTS_CSV.exists():
    with open(DISTRICTS_CSV, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            districts_data.append({
                "district": row.get("district", "").strip(),
                "district_hi": row.get("district_hi", "").strip() or row.get("district", "").strip(),
                "lat": float(row.get("latitude", 21.25)),
                "lng": float(row.get("longitude", 81.63))
            })

OWNERS = [
    ("Rajesh Verma", "राजेश वर्मा", "Late Bhupendra Verma", "स्व. भूपेंद्र वर्मा"),
    ("Phoolchand Chandrakar", "फूलचंद चंद्राकर", "Late Ghanshyam Chandrakar", "स्व. घनश्याम चंद्राकर"),
    ("Suresh Sahu", "सुरेश साहू", "Late Rameshwar Sahu", "स्व. रामेश्वर साहू"),
    ("Anita Patel", "अनीता पटेल", "Gopal Patel", "गोपाल पटेल"),
    ("Devendra Kashyap", "देवेंद्र कश्यप", "Late Ramesh Kashyap", "स्व. रमेश कश्यप"),
    ("Bhupendra Kanwar", "भूपेंद्र कंवर", "Late Ramesh Kanwar", "स्व. रमेश कंवर"),
    ("Chaitanya Yadav", "चैतन्य यादव", "Late Rajesh Yadav", "स्व. राजेश यादव"),
    ("Budhram Mandavi", "बुधराम मंडावी", "Sukhlal Mandavi", "सुखलाल मंडावी"),
    ("Kamla Agrawal", "कमला अग्रवाल", "Murarilal Agrawal", "मुरारीलाल अग्रवाल"),
    ("Lokesh Netam", "लोकेश नेताम", "Mangal Netam", "मंगल नेताम")
]

LAND_TYPES = ["IRRIGATED", "RAIN_FED", "BANJAR", "FOREST", "RESIDENTIAL", "COMMERCIAL"]
LITIGATION_STATUSES = ["No dispute", "SDM Court Stay Order", "Pending Boundary Case", "Disposed Appeal"]

def generate_voronoi_parcels(c_lat, c_lng, count=100, seed_base=100):
    rng = random.Random(seed_base)
    delta_lat, delta_lng = 0.02, 0.02
    center_box = box(c_lng - delta_lng, c_lat - delta_lat, c_lng + delta_lng, c_lat + delta_lat)

    nx = int(math.ceil(math.sqrt(count)))
    ny = int(math.ceil(count / nx))

    pts = []
    for ix in range(nx):
        for iy in range(ny):
            if len(pts) >= count:
                break
            x = c_lng - delta_lng + (ix + 0.5) * (2 * delta_lng / nx) + rng.uniform(-0.001, 0.001)
            y = c_lat - delta_lat + (iy + 0.5) * (2 * delta_lat / ny) + rng.uniform(-0.001, 0.001)
            pts.append([x, y])

    border_pts = []
    for angle in np.linspace(0, 2 * math.pi, 16, endpoint=False):
        border_pts.append([c_lng + 0.08 * math.cos(angle), c_lat + 0.08 * math.sin(angle)])

    all_pts = np.array(pts + border_pts)
    vor = Voronoi(all_pts)

    clean_polys = []
    used_area = None

    for idx in range(len(pts)):
        region_idx = vor.point_region[idx]
        region = vor.regions[region_idx]
        if -1 not in region and len(region) >= 3:
            polygon_pts = [vor.vertices[i] for i in region]
            poly = Polygon(polygon_pts).intersection(center_box)
            if not poly.is_empty and isinstance(poly, Polygon) and poly.area > 1e-8:
                if used_area is not None:
                    poly = poly.difference(used_area)
                if not poly.is_empty and isinstance(poly, Polygon) and poly.area > 1e-8:
                    clean_polys.append(poly)
                    used_area = poly if used_area is None else used_area.union(poly)

    return clean_polys

def main():
    print("Generating 3,300 clean, non-overlapping irregular Voronoi field parcels across CG...")
    rows = []
    parcel_counter = 1

    for d_idx, d_info in enumerate(districts_data):
        dist_name = d_info["district"]
        dist_hi = d_info["district_hi"]
        c_lat, c_lng = d_info["lat"], d_info["lng"]
        tehsil_en = f"{dist_name} Khas"
        tehsil_hi = f"{dist_hi} खास"

        villages_in_dist = [
            (f"{dist_name}_Village_A", "ग्राम अ"),
            (f"{dist_name}_Village_B", "ग्राम ब"),
            (f"Semra" if dist_name == "Raipur" else f"{dist_name}_Semra", "सेमरा"),
            (f"Bhanpuri" if dist_name == "Raipur" else f"{dist_name}_Bhanpuri", "भानपुरी")
        ]

        polys = generate_voronoi_parcels(c_lat, c_lng, count=100, seed_base=1000 + d_idx * 77)

        for p_idx, poly in enumerate(polys):
            v_en, v_hi = villages_in_dist[p_idx % len(villages_in_dist)]
            is_pilot_val = 1 if (dist_name == "Raipur" and v_en in ["Semra", "Bhanpuri", "Hasda", "Navagaon"]) else 0

            khasra_no = f"{100 + p_idx * 5}/{p_idx % 3 + 1}"
            khata_no = f"KH-{100 + (p_idx % 80)}"
            owner_en, owner_hi, f_en, f_hi = OWNERS[(d_idx + p_idx) % len(OWNERS)]
            l_type = LAND_TYPES[(d_idx * 2 + p_idx) % len(LAND_TYPES)]
            lit_stat = LITIGATION_STATUSES[(d_idx + p_idx) % len(LITIGATION_STATUSES)]

            area_ha = round(max(0.4, min(4.5, poly.area * 110900.0 * 103500.0 / 10000.0)), 2)
            area_acres = round(area_ha * 2.47105, 2)
            area_bigha = round(area_ha * 3.95, 2)
            area_sqm = round(area_ha * 10000.0, 1)

            cent_lat = round(poly.centroid.y, 6)
            cent_lng = round(poly.centroid.x, 6)
            min_lng, min_lat, max_lng, max_lat = poly.bounds

            ring = list(poly.exterior.coords)
            wkt = f"POLYGON(({', '.join([f'{pt[0]:.6f} {pt[1]:.6f}' for pt in ring])}))"

            p_id = f"CG-{dist_name[:3].upper()}-{parcel_counter:04d}"
            parcel_counter += 1

            rows.append({
                "parcel_id": p_id,
                "khasra_no": khasra_no,
                "khata_no": khata_no,
                "village": v_en,
                "village_hi": v_hi,
                "tehsil": tehsil_en,
                "tehsil_hi": tehsil_hi,
                "district": dist_name,
                "district_hi": dist_hi,
                "owner_name": owner_en,
                "owner_name_hi": owner_hi,
                "father_name": f_en,
                "father_name_hi": f_hi,
                "area_hectares": area_ha,
                "area_acres": area_acres,
                "area_bigha": area_bigha,
                "area_sqm": area_sqm,
                "land_type": l_type,
                "soil_type": "Matasi (Yellow Clay Soil)" if l_type == "IRRIGATED" else "Dorsa (Medium Clay-Loam)",
                "irrigation_source": "Mahanadi Canal Network" if l_type == "IRRIGATED" else "Rainfed",
                "market_value_per_ha": 18.0 if l_type in ["RESIDENTIAL", "COMMERCIAL"] else 12.5,
                "circle_rate": 13.5 if l_type in ["RESIDENTIAL", "COMMERCIAL"] else 9.5,
                "last_mutation_date": "2023-01-15",
                "mutation_status": "Mutated",
                "encumbrance_status": "Nil / Unencumbered",
                "litigation_status": lit_stat,
                "tribal_sensitive": "1" if p_idx % 7 == 0 else "0",
                "forest_distance_km": "2.5",
                "highway_distance_km": "1.2",
                "data_source": "synthetic_voronoi",
                "wkt_geometry": wkt,
                "centroid_lat": cent_lat,
                "centroid_lng": cent_lng,
                "min_lat": round(min_lat, 6),
                "min_lng": round(min_lng, 6),
                "max_lat": round(max_lat, 6),
                "max_lng": round(max_lng, 6),
                "is_pilot": is_pilot_val
            })

    fieldnames = list(rows[0].keys())
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✓ Successfully generated {len(rows)} clean non-overlapping Voronoi parcels in {CSV_PATH}")

if __name__ == "__main__":
    main()
