import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.db.session import get_db
from app.adapters import get_land_adapter
from app.models.grievance import GrievanceTicket

router = APIRouter()

@router.post("/create")
def create_grievance(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    ticket_id = f"BHOOMI-GRV-{uuid.uuid4().hex[:6].upper()}"
    
    ticket = GrievanceTicket(
        ticket_id=ticket_id,
        parcel_id=payload.get("parcel_id"),
        category=payload.get("category", "Record Correction"),
        applicant_name=payload.get("applicant_name", "Citizen"),
        applicant_phone=payload.get("applicant_phone", "9876543210"),
        description=payload.get("description", "Land detail correction request."),
        status="Submitted",
        assigned_officer="SDM / Tehsildar Office"
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    return {"ticket_id": ticket_id, "status": "Submitted", "assigned_officer": ticket.assigned_officer}

@router.get("/track/{ticket_id}")
def track_grievance(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = db.query(GrievanceTicket).filter(GrievanceTicket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Grievance ticket not found")
    
    return {
        "ticket_id": ticket.ticket_id,
        "parcel_id": ticket.parcel_id,
        "category": ticket.category,
        "applicant_name": ticket.applicant_name,
        "status": ticket.status,
        "assigned_officer": ticket.assigned_officer,
        "description": ticket.description,
        "created_at": ticket.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "resolution_notes": ticket.resolution_notes or "Review under progress at SDM Office."
    }
