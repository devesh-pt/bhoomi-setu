from sqlalchemy import Column, String, DateTime, Integer, Text, Boolean
from datetime import datetime
from app.db.session import Base

class CertificateRecord(Base):
    __tablename__ = "certificate_records"

    id = Column(Integer, primary_key=True, index=True)
    certificate_hash = Column(String(64), unique=True, index=True, nullable=False) # SHA-256 hash
    certificate_type = Column(String(50), nullable=False) # B1_KHATAUNI, PII_KHASRA
    parcel_id = Column(String(50), index=True, nullable=False)
    khasra_no = Column(String(50), nullable=False)
    owner_name = Column(String(100), nullable=False)
    district = Column(String(50), nullable=False)
    issued_to = Column(String(100), nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)
    is_valid = Column(Boolean, default=True)
    digital_signature = Column(Text, nullable=False)
