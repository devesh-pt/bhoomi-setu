# API.md — Bhoomi Setu REST API Documentation

## Base URL
`http://localhost:8000/api/v1`

---

## Endpoints Summary

### 1. Land Records & Search
- `GET /api/v1/land/search-cascading`: Cascading search by district, tehsil, RI circle, village, khasra, owner, or khata.
- `GET /api/v1/land/b1/{khata_no}`: Fetch B-1 Khatauni extract.
- `GET /api/v1/land/pii/{parcel_id}`: Fetch P-II Khasra survey plot details.
- `GET /api/v1/land/girdawari/{parcel_id}`: Fetch Girdawari seasonal crop entries.
- `POST /api/v1/land/banjar-finder`: Recommend alternative barren/government land for resettlement.

### 2. Mutations & Grievances
- `POST /api/v1/mutations/apply`: Apply for land mutation (inheritance, sale, partition).
- `GET /api/v1/mutations/{application_id}`: Track 5-stage mutation progress.
- `GET /api/v1/mutations/list`: Officer queue of pending mutations.
- `PUT /api/v1/mutations/{application_id}/status`: Officer update mutation status.
- `POST /api/v1/grievances/create`: Submit record correction request.
- `GET /api/v1/grievances/track/{ticket_id}`: Track grievance ticket status.

### 3. Signed Certificates & QR Verification
- `GET /api/v1/certificates/generate`: Generate digitally signed B-1 or P-II extract PDF with embedded QR code & SHA-256 hash.
- `GET /api/v1/certificates/verify/{hash}`: Public QR verification endpoint checking certificate hash authenticity.

### 4. AI & Geospatial Intelligence
- `POST /api/v1/ai/dispute-analysis`: AI Land Dispute Analyzer returning party probabilities, SHAP weights, & timeline.
- `POST /api/v1/highways/impact`: Calculate 60m/100m corridor buffer acquisition impact.
- `POST /api/v1/muavja/estimate`: Estimate RFCTLARR 2013 compensation (Market Value + 100% Solatium + Multiplier).
- `GET /api/v1/mismatch/parcels`: Detect record vs satellite reality discrepancies.
- `GET /api/v1/fraud/anomalies`: Detect duplicate registrations, rapid transfers, & price anomalies.
- `GET /api/v1/audit/verify`: Verify SHA-256 tamper-proof audit chain integrity.
