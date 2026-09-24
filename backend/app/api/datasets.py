from fastapi import APIRouter

router = APIRouter(prefix="/datasets", tags=["Datasets Metadata"])

DATASETS_LIST = [
    {
        "name": "ISRO Bhuvan LULC 50K",
        "purpose": "Land Use / Land Cover classification across India",
        "source": "https://bhuvan.nrsc.gov.in",
        "license": "Open Data for Educational & Government Use",
        "resolution": "50,000 scale / 30m resolution",
        "status": "Bundled sample pre-clipped"
    },
    {
        "name": "Bhuvan Wastelands Atlas of India",
        "purpose": "Identification of Barren / Banjar land parcels",
        "source": "https://bhuvan.nrsc.gov.in",
        "license": "Open Data (NRSC)",
        "resolution": "1:50,000 scale",
        "status": "Bundled sample pre-clipped"
    },
    {
        "name": "ESA WorldCover 10 m",
        "purpose": "High-resolution global land cover base layer",
        "source": "https://esa-worldcover.org",
        "license": "CC BY 4.0",
        "resolution": "10 meter pixel",
        "status": "Bundled sample pre-clipped"
    },
    {
        "name": "Google Dynamic World",
        "purpose": "Near real-time 10m land cover monitoring",
        "source": "Google Earth Engine (GOOGLE/DYNAMICWORLD/V1)",
        "license": "CC BY 4.0",
        "resolution": "10 meter pixel",
        "status": "API integration ready"
    },
    {
        "name": "Sentinel-2 L2A",
        "purpose": "Multi-spectral optical imagery for vegetation & moisture indices (NDVI/NDWI)",
        "source": "https://dataspace.copernicus.eu",
        "license": "Open Access Data Policy",
        "resolution": "10m / 20m multi-spectral",
        "status": "Pre-clipped patches committed"
    },
    {
        "name": "Hansen Global Forest Change (UMD)",
        "purpose": "Tree canopy cover loss analysis (2000-2024)",
        "source": "University of Maryland / Google Earth Engine",
        "license": "CC BY 4.0",
        "resolution": "30 meter pixel",
        "status": "Bundled sample pre-clipped"
    },
    {
        "name": "Forest Survey of India — ISFR Reports",
        "purpose": "District forest statistics and carbon stock baseline factors",
        "source": "https://fsi.nic.in",
        "license": "Open Government Data (OGD India)",
        "resolution": "District aggregate statistics",
        "status": "Active reference"
    },
    {
        "name": "Global Forest Watch (GLAD Alerts)",
        "purpose": "Live forest disturbance & deforestation alerts",
        "source": "https://www.globalforestwatch.org",
        "license": "CC BY 4.0",
        "resolution": "30m alert grid",
        "status": "Bundled overlay data"
    },
    {
        "name": "OpenStreetMap India Highways",
        "purpose": "Road corridor geometries and right-of-way buffers",
        "source": "https://download.geofabrik.de/asia/india.html",
        "license": "Open Data Commons Open Database License (ODbL)",
        "resolution": "Vector LineStrings",
        "status": "Bundled pre-clipped GeoJSON"
    },
    {
        "name": "DataMeet India Maps",
        "purpose": "State, District, Tehsil, Village administrative boundaries",
        "source": "https://github.com/datameet/maps",
        "license": "Creative Commons Attribution 2.5 India",
        "resolution": "Vector Polygons",
        "status": "Bundled GeoJSON"
    },
    {
        "name": "SRTM / NASADEM Elevation",
        "purpose": "Slope and digital elevation model (DEM) for corridor routing",
        "source": "https://earthdata.nasa.gov",
        "license": "Public Domain (NASA)",
        "resolution": "30 meter DEM",
        "status": "Bundled raster"
    },
    {
        "name": "ISRIC SoilGrids",
        "purpose": "Soil quality and agricultural fertility mapping",
        "source": "https://soilgrids.org",
        "license": "CC-BY 4.0",
        "resolution": "250 meter grid",
        "status": "Bundled sample"
    },
    {
        "name": "Bhoomi Rashi Portal Reference",
        "purpose": "Land acquisition workflow schema & compensation notification structure",
        "source": "https://bhoomirashi.gov.in",
        "license": "Government Reference Portal",
        "resolution": "Process schema reference",
        "status": "Active reference"
    },
    {
        "name": "State Bhulekh / Bhuiyan Reference",
        "purpose": "Khasra field structure and ownership record format reference",
        "source": "https://bhuiyan.cg.nic.in",
        "license": "Public Government Record Schema",
        "resolution": "Schema only (No scraping)",
        "status": "Active schema reference"
    },
    {
        "name": "NJDG / eCourts Statistics",
        "purpose": "Aggregate land dispute litigation age & disposal rates",
        "source": "https://njdg.ecourts.gov.in",
        "license": "Public Court Statistics",
        "resolution": "Aggregate statistical tables",
        "status": "Active reference"
    },
    {
        "name": "EuroSAT & DeepGlobe Land Cover Patches",
        "purpose": "ML patch training dataset for multi-spectral land detection",
        "source": "Kaggle / GitHub Open ML Datasets",
        "license": "Open ML Research License",
        "resolution": "64x64 pixel Sentinel-2 patches",
        "status": "Bundled in /ml"
    }
]

@router.get("")
def get_datasets_metadata():
    return {
        "total_datasets": len(DATASETS_LIST),
        "district_demo_region": "Sehore & Budhni Corridor, MP",
        "datasets": DATASETS_LIST
    }
