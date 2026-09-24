from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.adapters.base import BaseLandAdapter
from app.models.parcel import Parcel

class DemoAdapter(BaseLandAdapter):
    """
    Demo Adapter querying the local SQLite database populated with Chhattisgarh sample data.
    """

    def __init__(self, db: Session):
        self.db = db

    def search_cascading(
        self,
        district: Optional[str] = None,
        tehsil: Optional[str] = None,
        ri_circle: Optional[str] = None,
        village: Optional[str] = None,
        khasra_no: Optional[str] = None,
        owner_name: Optional[str] = None,
        khata_no: Optional[str] = None,
        query: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        q = self.db.query(Parcel)
        if district and district != "ALL":
            q = q.filter(Parcel.district.ilike(f"%{district}%"))
        if tehsil and tehsil != "ALL":
            q = q.filter(Parcel.tehsil.ilike(f"%{tehsil}%"))
        if village and village != "ALL":
            q = q.filter(Parcel.village.ilike(f"%{village}%"))
        if khasra_no:
            q = q.filter(Parcel.khasra_no.ilike(f"%{khasra_no}%"))
        if owner_name:
            q = q.filter(Parcel.owner_name.ilike(f"%{owner_name}%"))
        if khata_no:
            q = q.filter(Parcel.khata_no.ilike(f"%{khata_no}%"))
        if query:
            pat = f"%{query}%"
            q = q.filter(
                (Parcel.khasra_no.ilike(pat)) |
                (Parcel.owner_name.ilike(pat)) |
                (Parcel.village.ilike(pat)) |
                (Parcel.tehsil.ilike(pat)) |
                (Parcel.district.ilike(pat)) |
                (Parcel.khata_no.ilike(pat))
            )
        
        results = q.limit(100).all()
        return [
            {
                "parcel_id": p.parcel_id,
                "khasra_no": p.khasra_no,
                "khata_no": p.khata_no or "KH-104",
                "owner_name": p.owner_name,
                "father_name": p.father_name or "N/A",
                "village": p.village,
                "tehsil": p.tehsil or p.district,
                "district": p.district,
                "area_hectares": p.area_hectares,
                "area_sqm": p.area_sqm or int(p.area_hectares * 10000),
                "land_type": p.land_type,
                "case_status": p.case_status,
                "geojson_geometry": p.geojson_geometry
            }
            for p in results
        ]

    def get_b1_khatauni(self, khata_no: str, district: Optional[str] = None) -> Dict[str, Any]:
        q = self.db.query(Parcel).filter(Parcel.khata_no == khata_no)
        if district:
            q = q.filter(Parcel.district == district)
        parcels = q.all()
        if not parcels:
            # Fallback to general query if khata not found directly
            parcels = self.db.query(Parcel).limit(3).all()

        first = parcels[0]
        total_ha = sum(p.area_hectares for p in parcels)
        land_revenue = round(total_ha * 45.50, 2)

        return {
            "khata_no": khata_no,
            "state": "Chhattisgarh",
            "district": first.district,
            "tehsil": first.tehsil or first.district,
            "village": first.village,
            "recorded_owners": [
                {
                    "name": p.owner_name,
                    "father_husband_name": p.father_name or "Ramanathan S.",
                    "share_percentage": 100 if len(parcels) == 1 else round(100 / len(parcels), 1),
                    "caste_category": "General / OBC"
                }
                for p in parcels
            ],
            "total_plots": len(parcels),
            "total_area_hectares": round(total_ha, 3),
            "annual_land_revenue_inr": land_revenue,
            "rights_and_encumbrances": first.encumbrance_status or "Unencumbered / Nil Mortgages",
            "plots": [
                {
                    "parcel_id": p.parcel_id,
                    "khasra_no": p.khasra_no,
                    "area_hectares": p.area_hectares,
                    "land_type": p.land_type,
                    "soil_type": p.soil_type or "Matasi / Kanhar",
                    "circle_rate": p.circle_rate or 12.5
                }
                for p in parcels
            ]
        }

    def get_pii_khasra(self, parcel_id: str) -> Dict[str, Any]:
        p = self.db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
        if not p:
            p = self.db.query(Parcel).first()

        return {
            "parcel_id": p.parcel_id,
            "khasra_no": p.khasra_no,
            "khata_no": p.khata_no or "KH-104",
            "village": p.village,
            "tehsil": p.tehsil or p.district,
            "district": p.district,
            "area_hectares": p.area_hectares,
            "area_sqm": p.area_sqm or int(p.area_hectares * 10000),
            "land_type": p.land_type,
            "possession_type": "Self Cultivated (Nij-Jot)",
            "soil_type": p.soil_type or "Matasi Soil",
            "irrigation_source": p.irrigation_source or "Canal / Tube well",
            "double_cropped_area_ha": round(p.area_hectares * 0.75, 2),
            "trees_on_land": ["Mahua (3)", "Teak (2)", "Mango (1)"],
            "well_or_tubewell": "1 Active Solar Pump",
            "last_mutation_date": p.last_mutation_date or "14-Mar-2023",
            "encumbrance_status": p.encumbrance_status or "Nil"
        }

    def get_girdawari(self, parcel_id: str) -> Dict[str, Any]:
        p = self.db.query(Parcel).filter(Parcel.parcel_id == parcel_id).first()
        khasra = p.khasra_no if p else "101/A"
        area = p.area_hectares if p else 1.25

        return {
            "parcel_id": parcel_id,
            "khasra_no": khasra,
            "current_year": "2024-2025",
            "entries": [
                {
                    "season": "Kharif 2024",
                    "crop_name": "Paddy (Paddy - Swarna)",
                    "sown_area_ha": round(area * 0.85, 2),
                    "irrigation_type": "Canal Irrigated",
                    "possession_person": p.owner_name if p else "Ramesh Sahu",
                    "inspector_patwari": "P.K. Verma (Patwari Circle 04)",
                    "inspection_date": "15-Sep-2024"
                },
                {
                    "season": "Rabi 2023-24",
                    "crop_name": "Gram / Mustard (Chana)",
                    "sown_area_ha": round(area * 0.65, 2),
                    "irrigation_type": "Tube well",
                    "possession_person": p.owner_name if p else "Ramesh Sahu",
                    "inspector_patwari": "P.K. Verma (Patwari Circle 04)",
                    "inspection_date": "20-Feb-2024"
                },
                {
                    "season": "Kharif 2023",
                    "crop_name": "Paddy (Paddy - Swarna)",
                    "sown_area_ha": round(area * 0.82, 2),
                    "irrigation_type": "Rain-fed",
                    "possession_person": p.owner_name if p else "Ramesh Sahu",
                    "inspector_patwari": "P.K. Verma (Patwari Circle 04)",
                    "inspection_date": "10-Sep-2023"
                }
            ],
            "crop_distribution_chart": [
                {"crop": "Paddy (Swarna)", "coverage_percent": 65},
                {"crop": "Gram (Chana)", "coverage_percent": 25},
                {"crop": "Fallow / Fodder", "coverage_percent": 10}
            ]
        }

    def submit_mutation(self, mutation_data: Dict[str, Any]) -> Dict[str, Any]:
        app_id = f"CG-MUT-{int(self.db.query(Parcel).count()) + 1001}"
        return {
            "application_id": app_id,
            "status": "applied",
            "stage_index": 1,
            "applied_date": "2026-09-23",
            "message": "Mutation application successfully submitted to Tehsildar Portal.",
            "timeline": [
                {"stage": "Applied", "completed": True, "date": "2026-09-23"},
                {"stage": "Public Notice Published", "completed": False, "date": "Pending"},
                {"stage": "Objection Window (15 Days)", "completed": False, "date": "Pending"},
                {"stage": "Tehsildar Hearing & Order", "completed": False, "date": "Pending"},
                {"stage": "Record Mutated in Bhuiyan", "completed": False, "date": "Pending"}
            ]
        }

    def get_mutation_status(self, application_id: str) -> Dict[str, Any]:
        return {
            "application_id": application_id,
            "khasra_no": "142/1",
            "transferor": "Ramkumar Sahu",
            "transferee": "Suresh Sahu",
            "mutation_type": "Inheritance (Fauti Naamantaran)",
            "current_stage": "Objection Window (15 Days)",
            "stage_index": 3,
            "days_remaining": 6,
            "patwari_report_status": "Verified & Recommended",
            "timeline": [
                {"stage": "Applied", "completed": True, "date": "10-Sep-2024"},
                {"stage": "Public Notice Published", "completed": True, "date": "12-Sep-2024"},
                {"stage": "Objection Window (15 Days)", "completed": True, "date": "12-Sep-2024 to 27-Sep-2024"},
                {"stage": "Tehsildar Hearing & Order", "completed": False, "date": "30-Sep-2024"},
                {"stage": "Record Mutated in Bhuiyan", "completed": False, "date": "Pending"}
            ]
        }

    def submit_grievance(self, grievance_data: Dict[str, Any]) -> Dict[str, Any]:
        ticket_id = f"BHOOMI-GRV-{int(self.db.query(Parcel).count()) + 500}"
        return {
            "ticket_id": ticket_id,
            "status": "Submitted",
            "created_at": "2026-09-23T23:00:00Z",
            "assigned_officer": "Sub-Divisional Magistrate (SDM), Raipur",
            "expected_resolution_days": 7
        }

    def get_revenue_court_cases(self, parcel_id: Optional[str] = None, district: Optional[str] = None) -> List[Dict[str, Any]]:
        from datetime import datetime, timedelta

        t_now = datetime.now()
        date_12d = (t_now + timedelta(days=12)).strftime("%d-%b-%Y")
        date_28d = (t_now + timedelta(days=28)).strftime("%d-%b-%Y")
        date_45d = (t_now + timedelta(days=45)).strftime("%d-%b-%Y")
        date_past = (t_now - timedelta(days=14)).strftime("%d-%b-%Y")

        all_cases = [
            {
                "case_number": "REV-2026-CG-882",
                "court_name": "Tehsildar Court, Abhanpur, Raipur",
                "district": "Raipur",
                "parcel_id": parcel_id or "CG-RAI-0012",
                "khasra_no": "108/2",
                "parties": "Shiv Kumar (Demo Party) vs. State of Chhattisgarh",
                "case_type": "Boundary Dispute & Survey Verification",
                "status": "Pending Hearing",
                "next_hearing_date": date_12d,
                "order_sheet_summary": "Patwari instructed to submit joint boundary measurement report.",
                "is_demo": True,
                "demo_badge": "DEMO DATA"
            },
            {
                "case_number": "REV-2026-CG-419",
                "court_name": "SDM Court, Durg",
                "district": "Durg",
                "parcel_id": parcel_id or "CG-DRG-0045",
                "khasra_no": "45/1",
                "parties": "Anita Devi (Demo Party) vs. Mahendra Sahu (Demo Party)",
                "case_type": "Inheritance Partition Dispute",
                "status": "Disposed / Order Passed",
                "next_hearing_date": f"Disposed ({date_past})",
                "order_sheet_summary": "Order passed in favor of applicant for equal 1/3rd share partition.",
                "is_demo": True,
                "demo_badge": "DEMO DATA"
            },
            {
                "case_number": "REV-2026-CG-620",
                "court_name": "District Collector Court, Bilaspur",
                "district": "Bilaspur",
                "parcel_id": parcel_id or "CG-BIL-0104",
                "khasra_no": "220/1",
                "parties": "Rameshwar Kurmi (Demo Party) vs. Forest Department",
                "case_type": "Revenue Border Demarcation Appeal",
                "status": "Notice Issued",
                "next_hearing_date": date_28d,
                "order_sheet_summary": "Notice issued to Divisional Forest Officer (DFO) for boundary verification.",
                "is_demo": True,
                "demo_badge": "DEMO DATA"
            },
            {
                "case_number": "REV-2026-CG-911",
                "court_name": "SDM Court, Jagdalpur, Bastar",
                "district": "Bastar",
                "parcel_id": parcel_id or "CG-BAS-0088",
                "khasra_no": "14/3",
                "parties": "Mangal Ram Mandavi (Demo Party) vs. Revenue Authority",
                "case_type": "5th Schedule Tribal Land Section 170-B Inquiry",
                "status": "Under Investigation",
                "next_hearing_date": date_45d,
                "order_sheet_summary": "Collector approval required under Sec 170-B CG Land Revenue Code.",
                "is_demo": True,
                "demo_badge": "DEMO DATA"
            }
        ]

        if district and district.upper() != 'ALL':
            filtered = [c for c in all_cases if c["district"].lower() == district.lower()]
            return filtered
        return all_cases
