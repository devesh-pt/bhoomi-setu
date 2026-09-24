import uuid
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.db.session import get_db
from app.adapters import get_land_adapter
from app.models.mutation import MutationApplication

router = APIRouter()

from datetime import datetime

def build_mutation_timeline(stage_index: int, applied_date_str: str) -> List[Dict[str, Any]]:
    stages = [
        "Applied",
        "Public Notice Published",
        "Objection Window (15 Days)",
        "Tehsildar Hearing & Order",
        "Record Mutated in Bhuiyan"
    ]
    timeline = []
    for i, s_name in enumerate(stages, 1):
        is_completed = i <= stage_index
        timeline.append({
            "stage": s_name,
            "completed": is_completed,
            "date": applied_date_str if i == 1 else ("Completed" if is_completed else "Pending")
        })
    return timeline

@router.post("/apply")
def apply_mutation(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    app_id = f"CG-MUT-{uuid.uuid4().hex[:6].upper()}"
    today_str = datetime.utcnow().strftime("%d-%b-%Y")
    timeline = build_mutation_timeline(1, today_str)
    
    app_record = MutationApplication(
        application_id=app_id,
        parcel_id=payload.get("parcel_id", "CG-RAI-0001"),
        khasra_no=payload.get("khasra_no", "101/A"),
        applicant_name=payload.get("applicant_name", "Citizen"),
        applicant_phone=payload.get("applicant_phone", "9876543210"),
        mutation_type=payload.get("mutation_type", "Inheritance"),
        transferor_name=payload.get("transferor_name", "N/A"),
        transferee_name=payload.get("transferee_name", "N/A"),
        status="applied",
        stage_index=1,
        remarks=payload.get("remarks", "Application submitted"),
        timeline_data=timeline
    )
    db.add(app_record)
    db.commit()
    db.refresh(app_record)
    
    return {
        "application_id": app_id,
        "status": "applied",
        "stage_index": 1,
        "applied_date": today_str,
        "message": "Mutation application successfully submitted to Tehsildar Portal.",
        "timeline": timeline
    }

@router.get("/list")
def list_mutations(db: Session = Depends(get_db)):
    items = db.query(MutationApplication).order_by(MutationApplication.applied_date.desc()).all()
    return items

@router.get("/{application_id}")
def get_mutation_status(
    application_id: str,
    db: Session = Depends(get_db)
):
    app_record = db.query(MutationApplication).filter(MutationApplication.application_id == application_id).first()
    if app_record:
        applied_str = app_record.applied_date.strftime("%d-%b-%Y") if app_record.applied_date else "23-Sep-2026"
        timeline = build_mutation_timeline(app_record.stage_index, applied_str)
        return {
            "application_id": app_record.application_id,
            "parcel_id": app_record.parcel_id,
            "khasra_no": app_record.khasra_no,
            "applicant_name": app_record.applicant_name,
            "mutation_type": app_record.mutation_type,
            "status": app_record.status,
            "stage_index": app_record.stage_index,
            "applied_date": applied_str,
            "remarks": app_record.remarks,
            "timeline": timeline
        }
    
    adapter = get_land_adapter(db)
    return adapter.get_mutation_status(application_id)

@router.put("/{application_id}/status")
def update_mutation_status(
    application_id: str,
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    app_record = db.query(MutationApplication).filter(MutationApplication.application_id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Mutation application not found")
    
    new_status = payload.get("status", app_record.status)
    stage_idx = payload.get("stage_index", app_record.stage_index)
    
    app_record.status = new_status
    app_record.stage_index = stage_idx
    if "remarks" in payload:
        app_record.remarks = payload["remarks"]
        
    applied_str = app_record.applied_date.strftime("%d-%b-%Y") if app_record.applied_date else "23-Sep-2026"
    timeline = build_mutation_timeline(stage_idx, applied_str)
    app_record.timeline_data = timeline

    if stage_idx >= 5 or new_status.lower() in ["mutated", "approved"]:
        from app.models.parcel import Parcel
        parcel = db.query(Parcel).filter(
            (Parcel.parcel_id == app_record.parcel_id) | (Parcel.khasra_no == app_record.khasra_no)
        ).first()
        if parcel:
            parcel.mutation_status = "Mutated"
            if app_record.transferee_name and app_record.transferee_name != "N/A":
                parcel.owner_name = app_record.transferee_name

    db.commit()
    db.refresh(app_record)
    return {
        "message": "Mutation status updated successfully",
        "application_id": application_id,
        "status": new_status,
        "stage_index": stage_idx,
        "timeline": timeline
    }

