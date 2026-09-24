# Chhattisgarh Bhuiyan & Bhunaksha Open Data Guide

This directory details the dataset schema and integration steps for importing official **Chhattisgarh State Bhuiyan (भूइयां)** revenue records and **Bhunaksha (भूनक्शा)** cadastral vector shapefiles into **BHUMISETU**.

---

## 1. Official Data Sources & License Reference

| Layer Name | Provider / Portal | Source URL | Data Format | Usage in BHUMISETU |
| :--- | :--- | :--- | :--- | :--- |
| **Bhuiyan Revenue Records** | Revenue & Disaster Management Dept, CG | [bhuiyan.cg.nic.in](https://bhuiyan.cg.nic.in/) | XML / JSON / REST API | Khasra, Khata, Owner, Father's Name, Soil, Mutation history |
| **Bhunaksha Cadastral Maps** | NIC Chhattisgarh | [bhunaksha.cg.nic.in](https://bhunaksha.cg.nic.in/) | GeoJSON / ESRI Shapefile | Polygon geometries for 33 districts |
| **Chhattisgarh Administrative Boundaries** | DataMeet India Maps / OGD | [github.com/datameet/maps](https://github.com/datameet/maps) | GeoJSON | 33 District and Tehsil boundary polygons |
| **National & State Highways** | OpenStreetMap Geofabrik India | [geofabrik.de](https://download.geofabrik.de/asia/india.html) | GeoJSON LineString | NH-53, NH-30, SH corridors |
| **Forest Cover (FSI & Hansen)** | Forest Survey of India / UMD | [fsi.nic.in](https://fsi.nic.in/) | GeoTIFF / Vector | Forest canopy cover, 5-year forest loss |
| **Land Use / Land Cover** | ESA WorldCover 10m / ISRO Bhuvan | [esa-worldcover.org](https://esa-worldcover.org/) | 10m GeoTIFF | Agriculture, Banjar, Forest, Urban classification |

---

## 2. Database Schema Alignment

BHUMISETU's `parcels` database table is 100% aligned with Bhuiyan & Bhunaksha fields:

```sql
CREATE TABLE parcels (
    id INTEGER PRIMARY KEY,
    parcel_id VARCHAR UNIQUE NOT NULL,      -- CG-RAI-0001
    khasra_no VARCHAR NOT NULL,              -- 402/1-A
    khata_no VARCHAR,                         -- KH-104
    village VARCHAR NOT NULL,                 -- Semra
    tehsil VARCHAR,                           -- Raipur
    district VARCHAR NOT NULL,                -- Raipur
    state VARCHAR DEFAULT 'Chhattisgarh',
    owner_name VARCHAR NOT NULL,              -- Ramesh Sahu
    father_name VARCHAR,                      -- Late Shivkumar Sahu
    area_hectares FLOAT NOT NULL,
    area_acres FLOAT NOT NULL,
    area_bigha FLOAT NOT NULL,
    area_sqm FLOAT,
    land_type VARCHAR NOT NULL,               -- AGRICULTURAL / BANJAR / FOREST / RESIDENTIAL / COMMERCIAL / GOVERNMENT
    soil_type VARCHAR,                        -- Matasi / Kanhar / Dorsa / Bhata
    irrigation_source VARCHAR,                -- Mahanadi Canal / Tube Well / Rainfed
    market_value_per_ha FLOAT NOT NULL,
    circle_rate FLOAT,
    last_mutation_date VARCHAR,               -- YYYY-MM-DD
    encumbrance_status VARCHAR,               -- None / Bank Loan
    case_status VARCHAR DEFAULT 'none',
    case_details TEXT,
    geojson_geometry JSON NOT NULL,          -- Polygon GeoJSON
    centroid_lat FLOAT NOT NULL,
    centroid_lng FLOAT NOT NULL,
    is_synthetic BOOLEAN DEFAULT TRUE
);
```

---

## 3. How to Import Real Bhuiyan / Bhunaksha Shapefiles

To import real government shapefiles or GeoJSON exported from Bhunaksha:

1. **Place official files**: Save `.geojson` or `.shp` files in `backend/data/bhunaksha/`.
2. **Run Import Script**:
   ```bash
   ./backend/venv/bin/python scripts/seed_cg_land.py --import-real backend/data/bhunaksha/district_raipur.geojson
   ```
3. The import script maps `is_synthetic = False` for imported records and automatically updates spatial centroids. No changes to the React frontend are required.
