from sqlalchemy import Column, Integer, String, Float
from app.db.session import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, index=True)
    district = Column(String(100), unique=True, index=True, nullable=False)
    district_hi = Column(String(100), nullable=True)
    division = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    note = Column(String(255), nullable=True)
