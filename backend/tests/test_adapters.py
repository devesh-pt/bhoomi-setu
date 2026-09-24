import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_cascading_search():
    response = client.get("/api/v1/land/search-cascading?district=Raipur")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data

def test_b1_khatauni_extract():
    response = client.get("/api/v1/land/b1/KH-104")
    assert response.status_code == 200
    data = response.json()
    assert "khata_no" in data
    assert "recorded_owners" in data

def test_pii_khasra_details():
    response = client.get("/api/v1/land/pii/CG-RAI-0001")
    assert response.status_code == 200
    data = response.json()
    assert "khasra_no" in data
    assert "soil_type" in data

def test_girdawari_seasonal_crops():
    response = client.get("/api/v1/land/girdawari/CG-RAI-0001")
    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    assert "crop_distribution_chart" in data

def test_mutation_lifecycle():
    # Submit application
    payload = {
        "parcel_id": "CG-RAI-0001",
        "khasra_no": "101/A",
        "applicant_name": "Ramesh Sahu",
        "applicant_phone": "9876543210",
        "mutation_type": "Inheritance",
        "transferor_name": "Late Ramkumar Sahu",
        "transferee_name": "Ramesh Sahu"
    }
    apply_res = client.post("/api/v1/mutations/apply", json=payload)
    assert apply_res.status_code == 200
    app_id = apply_res.json()["application_id"]
    
    # Check status
    status_res = client.get(f"/api/v1/mutations/{app_id}")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "applied"
    
    # Officer update status
    update_res = client.put(f"/api/v1/mutations/{app_id}/status", json={"status": "notice_issued", "stage_index": 2})
    assert update_res.status_code == 200

def test_grievance_submission():
    payload = {
        "parcel_id": "CG-RAI-0001",
        "category": "Record Correction",
        "applicant_name": "Anita Sahu",
        "applicant_phone": "9876543210",
        "description": "Correct father's name spelling in Bhuiyan record."
    }
    res = client.post("/api/v1/grievances/create", json=payload)
    assert res.status_code == 200
    ticket_id = res.json()["ticket_id"]
    
    track_res = client.get(f"/api/v1/grievances/track/{ticket_id}")
    assert track_res.status_code == 200
    assert track_res.json()["category"] == "Record Correction"

def test_signed_certificate_generator_and_verifier():
    gen_res = client.get("/api/v1/certificates/generate?parcel_id=CG-RAI-0001&cert_type=B1_KHATAUNI")
    assert gen_res.status_code == 200
    assert gen_res.headers["content-type"] == "application/pdf"
    
    # Verification with invalid hash
    verify_res = client.get("/api/v1/certificates/verify/INVALID_HASH_123")
    assert verify_res.status_code == 200
    assert verify_res.json()["verified"] == False

def test_revenue_court_cases():
    res = client.get("/api/v1/court/cases")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data

def test_ai_dispute_analyzer():
    res = client.post("/api/v1/ai/dispute-analysis", json={"parcel_id": "CG-RAI-0001"})
    assert res.status_code == 200
    data = res.json()
    assert "likelihood_party_a_pct" in data
    assert "disclaimer" in data

def test_mismatch_detector():
    res = client.get("/api/v1/mismatch/parcels?district=Raipur")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data

def test_fraud_anomaly_detector():
    res = client.get("/api/v1/fraud/anomalies?district=Raipur")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data

def test_banjar_land_finder():
    res = client.post("/api/v1/land/banjar-finder", json={"district": "Raipur", "target_area_ha": 15.0})
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data

def test_audit_chain_verification():
    res = client.get("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["is_chain_intact"] == True

