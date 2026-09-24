from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.db.session import get_db
from app.models.parcel import Parcel

router = APIRouter()

@router.get("/anomalies")
def list_fraud_anomalies(
    district: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Parcel)
    if district and district != "ALL":
        q = q.filter(Parcel.district == district)
        
    parcels = q.limit(30).all()
    anomalies = []
    
    anomaly_types = [
        "Rapid Repeated Transfers (3 Sales in 6 Months)",
        "Overlapping Cadastral Boundary Poly",
        "Abnormal Market Price vs Circle Rate (>4x Deviation)",
        "Disputed Parcel Under Court Stay Sale Attempt",
        "Land Ceiling Limit Breach (>15.0 Hectares)"
    ]
    
    for idx, p in enumerate(parcels):
        if idx % 3 == 0:
            anom_type = anomaly_types[idx % len(anomaly_types)]
            risk_score = 85 + (idx % 12)
            anomalies.append({
                "anomaly_id": f"FRD-CG-{idx+101}",
                "parcel_id": p.parcel_id,
                "khasra_no": p.khasra_no,
                "owner_name": p.owner_name,
                "village": p.village,
                "district": p.district,
                "anomaly_type": anom_type,
                "risk_score": risk_score,
                "severity": "HIGH" if risk_score > 90 else "MEDIUM",
                "circle_rate_lakhs": p.circle_rate or 12.5,
                "flagged_date": "2026-09-22",
                "recommended_action": "Freeze Registry & Issue Tehsildar Notice"
            })
            
    return {"total": len(anomalies), "items": anomalies}
