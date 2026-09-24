# DATA_SOURCES.md — Bhoomi Setu Open Datasets & Adapter Architecture

## Overview
Bhoomi Setu (SIH26019) integrates open geospatial GIS layers with Chhattisgarh's land registry records framework.

---

## Bundled Open GIS Datasets

### 1. Administrative Boundaries (33 Districts & Tehsils)
- **Source**: OpenStreetMap (OSM) Administrative Level 5/6 & Survey of India / data.gov.in Open Boundaries.
- **Coverage**: All 33 districts of Chhattisgarh (Raipur, Bilaspur, Durg, Bastar, Surguja, Korba, Janjgir-Champa, Raigarh, etc.).
- **Format**: Bundled GeoJSON (`data/cg_districts.json`).

### 2. National Highways & State Corridors
- **Source**: OpenStreetMap Highway Network.
- **Key Corridors**: NH-30 (Raipur–Jagdalpur Highway), NH-53 (Raipur–Durg–Rajnandgaon Expressway), NH-130 (Bilaspur–Ambikapur Highway).
- **Format**: GeoJSON LineStrings with acquisition buffer spatial analysis (60m / 100m).

### 3. Forest Cover & Canopy Loss (2019–2024)
- **Source**: Forest Survey of India (FSI) State of Forest Report & Global Forest Watch Open Data (30m Resolution Landsat/Sentinel-2).
- **Metrics**: Canopy Density Index (NDVI), Forest Loss (hectares), Encroachment Flagging.

### 4. Satellite Land Cover & Land Use
- **Source**: European Space Agency (ESA) WorldCover 10m Sentinel-2 Product.
- **Classifications**: Crop Land, Tree Cover / Forest, Shrubland, Built-up / Settlement, Water Bodies, Barren / Banjar Land.

---

## How to Plug in Live Bhuiyan / Bhunaksha Data

Bhoomi Setu uses a modular **Records Adapter Architecture** (`backend/app/adapters/`):

1. **Active Adapter Configuration**:
   Set `RECORD_ADAPTER` in environment variables:
   ```bash
   RECORD_ADAPTER=bhuiyan
   ```

2. **Adapter Contract Implementation**:
   Modify `backend/app/adapters/bhuiyan_adapter.py` to point to NIC Bhuiyan REST/SOAP endpoints:
   ```python
   # bhuiyan_adapter.py
   class BhuiyanAdapter(BaseLandAdapter):
       def search_cascading(self, district, tehsil, village, khasra_no, ...):
           # Execute HTTP GET to https://bhuiyan.cg.nic.in/api/v1/parcels
           pass
   ```

3. **Shapefile / Bhu-Naksha Parcel Vector Tile Import**:
   Run the bundled import helper script to convert official Shapefiles into Bhoomi Setu SQLite/PostGIS database:
   ```bash
   python scripts/import_bhunaksha_shapefile.py --input data/cg_bhunaksha.shp
   ```
