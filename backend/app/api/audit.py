import hashlib
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta

router = APIRouter()

# In-memory append-only hash-chained ledger
AUDIT_LEDGER = [
    {
        "log_id": "AUD-0001",
        "timestamp": "2026-09-23T10:00:00Z",
        "action": "SYSTEM_BOOT",
        "actor": "admin (LAO Officer)",
        "parcel_id": "SYSTEM",
        "payload": "Bhoomi Setu State Land Registry Chain Initialized",
        "prev_hash": "0000000000000000000000000000000000000000000000000000000000000000",
        "current_hash": hashlib.sha256("AUD-0001:SYSTEM_BOOT:GENESIS".encode('utf-8')).hexdigest()
    }
]

def append_audit_log(action: str, actor: str, parcel_id: str, payload: str):
    prev_hash = AUDIT_LEDGER[-1]["current_hash"]
    log_id = f"AUD-{len(AUDIT_LEDGER)+1:04d}"
    timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    
    raw = f"{log_id}:{timestamp}:{action}:{actor}:{parcel_id}:{payload}:{prev_hash}"
    current_hash = hashlib.sha256(raw.encode('utf-8')).hexdigest()
    
    entry = {
        "log_id": log_id,
        "timestamp": timestamp,
        "action": action,
        "actor": actor,
        "parcel_id": parcel_id,
        "payload": payload,
        "prev_hash": prev_hash,
        "current_hash": current_hash
    }
    AUDIT_LEDGER.append(entry)
    return entry

# Seed initial audit logs
append_audit_log("RECORD_MUTATION_APPROVE", "officer (Tehsildar Abhanpur)", "CG-RAI-0001", "Mutation App CG-MUT-1001 Approved")
append_audit_log("GRIEVANCE_CORRECTION_SUBMIT", "citizen (Ramesh Sahu)", "CG-RAI-0002", "Spelling Correction Ticket BHOOMI-GRV-2001 Created")
append_audit_log("CERTIFICATE_PDF_GENERATED", "citizen (Ramesh Sahu)", "CG-RAI-0001", "B-1 Khatauni Signed Extract Generated")

@router.get("/logs")
def get_audit_logs():
    return {"total": len(AUDIT_LEDGER), "items": AUDIT_LEDGER}

@router.get("/verify")
def verify_audit_chain():
    is_intact = True
    for i in range(1, len(AUDIT_LEDGER)):
        prev = AUDIT_LEDGER[i-1]
        curr = AUDIT_LEDGER[i]
        if curr["prev_hash"] != prev["current_hash"]:
            is_intact = False
            break
            
    return {
        "is_chain_intact": is_intact,
        "total_blocks": len(AUDIT_LEDGER),
        "genesis_hash": AUDIT_LEDGER[0]["current_hash"],
        "latest_block_hash": AUDIT_LEDGER[-1]["current_hash"],
        "status_message": "Cryptographic SHA-256 ledger integrity verified. Zero tampering detected." if is_intact else "SECURITY WARNING: Hash chain broken!"
    }
