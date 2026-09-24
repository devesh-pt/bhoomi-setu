from sqlalchemy import Column, Integer, String, Float, Text, JSON, Boolean
from app.db.session import Base

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String(50), unique=True, index=True, nullable=False)
    khasra_no = Column(String(50), index=True, nullable=False)
    khata_no = Column(String(50), nullable=True)
    village = Column(String(100), nullable=False)
    village_hi = Column(String(100), nullable=True)
    tehsil = Column(String(100), nullable=False)
    tehsil_hi = Column(String(100), nullable=True)
    district = Column(String(100), index=True, nullable=False)
    district_hi = Column(String(100), nullable=True)
    state = Column(String(50), default="Chhattisgarh")
    
    owner_name = Column(String(150), index=True, nullable=False)
    owner_name_hi = Column(String(150), nullable=True)
    father_name = Column(String(150), nullable=True)
    father_name_hi = Column(String(150), nullable=True)
    
    area_hectares = Column(Float, nullable=False)
    area_acres = Column(Float, nullable=False)
    area_bigha = Column(Float, nullable=False)
    area_sqm = Column(Float, nullable=False)
    
    land_type = Column(String(50), nullable=False) # IRRIGATED, RAIN_FED, BANJAR, FOREST, RESIDENTIAL, COMMERCIAL
    soil_type = Column(String(100), default="Matasi Soil")
    irrigation_source = Column(String(100), default="Canal Network")
    
    market_value_per_ha = Column(Float, default=15.0)
    circle_rate = Column(Float, default=12.5)
    last_mutation_date = Column(String(50), default="2023-01-01")
    mutation_status = Column(String(100), default="Mutated")
    encumbrance_status = Column(String(150), default="Nil / Unencumbered")
    litigation_status = Column(String(150), default="No dispute")
    case_status = Column(String(50), default="none")
    case_details = Column(Text, nullable=True)
    
    tribal_sensitive = Column(Boolean, default=False)
    forest_distance_km = Column(Float, default=2.5)
    highway_distance_km = Column(Float, default=1.5)
    
    data_source = Column(String(50), default="synthetic_demo")
    wkt_geometry = Column(Text, nullable=True)
    geojson_geometry = Column(JSON, nullable=False)
    
    centroid_lat = Column(Float, index=True, nullable=False)
    centroid_lng = Column(Float, index=True, nullable=False)
    min_lat = Column(Float, nullable=True)
    min_lng = Column(Float, nullable=True)
    max_lat = Column(Float, nullable=True)
    max_lng = Column(Float, nullable=True)
    
    is_synthetic = Column(Boolean, default=True)
    is_pilot = Column(Boolean, default=False)

