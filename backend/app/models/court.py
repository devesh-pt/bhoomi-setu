from sqlalchemy import Column, String, DateTime, Integer, Text
from datetime import datetime
from app.db.session import Base

class RevenueCourtCase(Base):
    __tablename__ = "revenue_court_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), index=True, nullable=False)
    khasra_no = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    court_name = Column(String(100), nullable=False)
    parties = Column(String(200), nullable=False)
    case_type = Column(String(100), nullable=False)
    status = Column(String(50), default="Pending Hearing") # Pending Hearing, Disposed, Stay Order
    next_hearing_date = Column(String(50), nullable=True)
    order_sheet_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
