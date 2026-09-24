from sqlalchemy import Column, Integer, String, Float, Text, JSON, Boolean
from app.db.session import Base

class ForestArea(Base):
    __tablename__ = "forest_areas"

    id = Column(Integer, primary_key=True, index=True)
    forest_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    name_hi = Column(String(150), nullable=True)
    type = Column(String(50), nullable=False) # National Park, Tiger Reserve, Wildlife Sanctuary, Reserved Forest, Protected Forest
    district = Column(String(100), index=True, nullable=False)
    area_km2 = Column(Float, nullable=False)
    canopy_density = Column(String(50), default="Moderately Dense")
    main_species = Column(Text, nullable=True)
    wildlife = Column(Text, nullable=True)
    elephant_corridor = Column(Boolean, default=False)
    eco_sensitive_buffer_km = Column(Float, default=1.0)
    forest_clearance_required = Column(Boolean, default=True)
    fra_claims_count = Column(Integer, default=0)
    estimated_tree_count = Column(Integer, default=0)
    carbon_stock_estimate_tons = Column(Float, default=0.0)
    loss_time_series = Column(JSON, nullable=False)
    geojson_geometry = Column(JSON, nullable=False)
    wkt_geometry = Column(Text, nullable=True)
    min_lat = Column(Float, index=True, nullable=False)
    min_lng = Column(Float, index=True, nullable=False)
    max_lat = Column(Float, index=True, nullable=False)
    max_lng = Column(Float, index=True, nullable=False)
    data_source = Column(String(50), default="Demo data")
    approximate = Column(Boolean, default=True)
