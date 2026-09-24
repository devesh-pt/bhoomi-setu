from sqlalchemy import Column, Integer, String, Float, Text, JSON
from app.db.session import Base

class LandCase(Base):
    __tablename__ = "land_cases"

    id = Column(Integer, primary_key=True, index=True)
    parcel_id = Column(String, index=True, nullable=False)
    case_number = Column(String, unique=True, index=True, nullable=False)
    court_name = Column(String, nullable=False)
    case_type = Column(String, nullable=False) # Title Dispute, Compensation Claim, Boundary Dispute, Forest Clearance Challenge
    petitioner = Column(String, nullable=False)
    respondent = Column(String, nullable=False)
    status = Column(String, nullable=False) # Pending, Disposed, Stay Order
    filed_year = Column(Integer, nullable=False)
    case_age_years = Column(Float, nullable=False)
    document_completeness_pct = Column(Float, nullable=False)
    dispute_severity = Column(String, nullable=False) # High, Medium, Low
    summary = Column(Text, nullable=False)
    features_json = Column(JSON, nullable=True) # ML feature parameters
