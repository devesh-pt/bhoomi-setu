from sqlalchemy import Column, Integer, String, Float, JSON
from app.db.session import Base

class Highway(Base):
    __tablename__ = "highways"

    id = Column(Integer, primary_key=True, index=True)
    highway_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    category = Column(String, nullable=False) # National Highway, State Highway, Express Corridor
    total_length_km = Column(Float, nullable=False)
    geojson_geometry = Column(JSON, nullable=False) # LineString geometry
