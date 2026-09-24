from sqlalchemy import Column, String, Float, DateTime, Integer, JSON, Text
from datetime import datetime
from app.db.session import Base

class MutationApplication(Base):
    __tablename__ = "mutation_applications"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(String(50), unique=True, index=True, nullable=False)
    parcel_id = Column(String(50), index=True, nullable=False)
    khasra_no = Column(String(50), nullable=False)
    applicant_name = Column(String(100), nullable=False)
    applicant_phone = Column(String(20), nullable=False)
    mutation_type = Column(String(50), nullable=False) # Transfer, Inheritance, Partition
    transferor_name = Column(String(100), nullable=True)
    transferee_name = Column(String(100), nullable=True)
    status = Column(String(50), default="applied") # applied, notice_issued, objection_window, hearing, mutated, rejected
    stage_index = Column(Integer, default=1)
    applied_date = Column(DateTime, default=datetime.utcnow)
    remarks = Column(Text, nullable=True)
    timeline_data = Column(JSON, nullable=True)
