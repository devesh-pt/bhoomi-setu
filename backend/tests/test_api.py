from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_auth_login():
    response = client.post("/api/v1/auth/login", json={"username": "officer", "password": "officer123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "officer"

def test_auth_login_failed_lockout():
    temp_user = "test_lockout_user"
    for i in range(5):
        resp = client.post("/api/v1/auth/login", json={"username": temp_user, "password": "wrong_password"})
        assert resp.status_code in [401, 429]
    locked_resp = client.post("/api/v1/auth/login", json={"username": temp_user, "password": "wrong_password"})
    assert locked_resp.status_code in [401, 429]

def test_identify_location_everywhere():
    # Test 1: Raipur location
    resp1 = client.get("/api/identify?lat=21.25&lng=81.63&zoom=15")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["status"] == "success"
    assert data1["data_source"] == "Demo data"
    assert "parcel" in data1
    assert "district" in data1
    assert data1["district"]["district"] == "Raipur"
    assert data1["parcel"]["area_hectares"] >= 0.2

    # Test 2: Determinism on repeat call
    resp2 = client.get("/api/identify?lat=21.25&lng=81.63&zoom=15")
    assert resp2.json()["parcel"]["parcel_id"] == data1["parcel"]["parcel_id"]

    # Test 3: Bastar / Jagdalpur location
    resp3 = client.get("/api/identify?lat=19.07&lng=82.02&zoom=15")
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["district"]["district"] == "Bastar"

def test_parcels_pagination_and_search():
    response = client.get("/api/v1/parcels?page=1&size=10")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2000
    assert len(data["items"]) == 10

    search_resp = client.get("/api/v1/parcels/search?q=Raipur")
    assert search_resp.status_code == 200
    assert isinstance(search_resp.json(), list)

def test_highways_and_impact():
    hw_resp = client.get("/api/v1/highways")
    assert hw_resp.status_code == 200
    highways = hw_resp.json()
    assert len(highways) >= 1

    impact_resp = client.post("/api/v1/highways/impact", json={"highway_id": "NH-53", "buffer_meters": 60.0})
    assert impact_resp.status_code == 200
    impact_data = impact_resp.json()
    assert impact_data["highway_id"] == "NH-53"
    assert "fertile_land_ha" in impact_data
    assert "banjar_land_ha" in impact_data

def test_route_suggestion():
    req = {
        "start_lat": 21.10, "start_lng": 80.81,
        "end_lat": 21.25, "end_lng": 81.62
    }
    resp = client.post("/api/v1/highways/suggest-route", json=req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["fertile_land_saved_ha"] > 0
    assert "suggested_route_geojson" in data

def test_ml_land_detection():
    poly_req = {
        "geojson_polygon": {
            "type": "Polygon",
            "coordinates": [[[81.50, 21.15], [81.65, 21.15], [81.65, 21.25], [81.50, 21.25], [81.50, 21.15]]]
        }
    }
    resp = client.post("/api/v1/detect/land", json=poly_req)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_area_ha"] > 0
    assert len(data["class_breakdown"]) >= 5

def test_muavja_compensation_estimate():
    p_resp = client.get("/api/v1/parcels?page=1&size=5")
    p_ids = [p["parcel_id"] for p in p_resp.json()["items"]]
    
    comp_resp = client.post("/api/v1/muavja/estimate", json={"parcel_ids": p_ids, "rural_multiplier": 2.0})
    assert comp_resp.status_code == 200
    c_data = comp_resp.json()
    assert c_data["total_parcels"] == len(p_ids)
    assert c_data["grand_total_muavja_lakhs"] > 0

def test_forest_impact_analytics():
    poly_req = {
        "geojson_polygon": {
            "type": "Polygon",
            "coordinates": [[[81.50, 19.50], [82.00, 19.50], [82.00, 20.00], [81.50, 20.00], [81.50, 19.50]]]
        }
    }
    resp = client.post("/api/v1/forest/impact", json=poly_req)
    assert resp.status_code == 200
    f_data = resp.json()
    assert f_data["current_forest_cover_ha"] > 0
    assert len(f_data["historical_loss_series"]) == 6

def test_case_insight():
    p_resp = client.get("/api/v1/parcels?case_status=pending&size=1")
    items = p_resp.json()["items"]
    assert len(items) > 0
    p_id = items[0]["parcel_id"]
    
    resp = client.get(f"/api/v1/cases/{p_id}/insight")
    assert resp.status_code == 200
    insight = resp.json()
    assert insight["likelihood_band"] in ["Low", "Medium", "High"]
    assert len(insight["top_explanatory_factors"]) == 3
    assert "disclaimer" in insight

def test_datasets_endpoint():
    resp = client.get("/api/v1/datasets")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_datasets"] >= 15

def test_forest_areas_api_and_identify():
    # Test GET /api/forests
    resp = client.get("/api/forests")
    assert resp.status_code == 200
    fc = resp.json()
    assert fc["type"] == "FeatureCollection"
    assert len(fc["features"]) >= 10

    # Test tapping inside Indravati National Park (18.85, 80.85)
    resp_indravati = client.get("/api/identify?lat=18.85&lng=80.85&zoom=15")
    assert resp_indravati.status_code == 200
    d_indravati = resp_indravati.json()
    assert d_indravati["forest"] is not None
    assert d_indravati["forest"]["name"] == "Indravati National Park"
    assert d_indravati["parcel"]["land_type"] == "FOREST"
    assert d_indravati["parcel"]["forest_clearance_required"] is True

    # Test tapping inside Kanger Ghati National Park (18.88, 81.95)
    resp_kanger = client.get("/api/identify?lat=18.88&lng=81.95&zoom=15")
    assert resp_kanger.status_code == 200
    d_kanger = resp_kanger.json()
    assert d_kanger["forest"] is not None
    assert d_kanger["forest"]["name"] == "Kanger Ghati National Park"

    # Test tapping inside Barnawapara (21.40, 82.40)
    resp_barna = client.get("/api/identify?lat=21.40&lng=82.40&zoom=15")
    assert resp_barna.status_code == 200
    d_barna = resp_barna.json()
    assert d_barna["forest"] is not None
    assert d_barna["forest"]["name"] == "Barnawapara Wildlife Sanctuary"

