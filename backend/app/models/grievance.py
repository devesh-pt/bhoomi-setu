from sqlalchemy import Column, String, DateTime, Integer, Text
from datetime import datetime
from app.db.session import Base

class GrievanceTicket(Base):
    __tablename__ = "grievance_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(50), unique=True, index=True, nullable=False) # BHOOMI-GRV-XXXX
    parcel_id = Column(String(50), index=True, nullable=True)
    category = Column(String(50), nullable=False) # Record Correction, Area Mismatch, Name Spelling, Boundary Dispute
    applicant_name = Column(String(100), nullable=False)
    applicant_phone = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="Submitted") # Submitted, Under Review, Resolved, Rejected
    assigned_officer = Column(String(100), default="SDM / Tehsildar Office")
    created_at = Column(DateTime, default=datetime.utcnow)
    resolution_notes = Column(Text, nullable=True)
