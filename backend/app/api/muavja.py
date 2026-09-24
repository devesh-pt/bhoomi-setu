from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import io
import pandas as pd
from app.db.session import get_db
from app.models.parcel import Parcel
from app.schemas.compensation import (
    CompensationEstimateRequest,
    CompensationEstimateResponse,
    ParcelCompensationDetail
)
from app.config import settings

router = APIRouter(tags=["Muavja & Ready-Map"])

@router.post("/muavja/estimate", response_model=CompensationEstimateResponse)
def estimate_muavja_compensation(req: CompensationEstimateRequest, db: Session = Depends(get_db)):
    rates_cfg = settings.load_rates_config()
    base_rates = rates_cfg.get("default_rates_per_ha", {
        "IRRIGATED": 25.0, "RAIN_FED": 16.0, "BANJAR": 6.0,
        "FOREST": 10.0, "RESIDENTIAL": 55.0, "COMMERCIAL": 85.0
    })
    village_rates = rates_cfg.get("village_rates_per_ha", {})
    village_multipliers = rates_cfg.get("village_multipliers", {})
    asset_allowances = rates_cfg.get("asset_allowances_per_ha", {
        "IRRIGATED": 2.5, "RAIN_FED": 1.2, "BANJAR": 0.2,
        "FOREST": 3.0, "RESIDENTIAL": 15.0, "COMMERCIAL": 30.0
    })

    solatium_pct = 100.0 if req.include_solatium else 0.0

    parcels = db.query(Parcel).filter(Parcel.parcel_id.in_(req.parcel_ids)).all()
    if not parcels:
        parcels = db.query(Parcel).limit(10).all()

    details = []
    total_area = 0.0
    total_base_lakhs = 0.0
    total_solatium_lakhs = 0.0
    total_assets_lakhs = 0.0
    grand_total_lakhs = 0.0

    for p in parcels:
        # Determine village-specific rate if available, else default
        v_rates = village_rates.get(p.village, base_rates)
        rate = v_rates.get(p.land_type, base_rates.get(p.land_type, 15.0))
        
        # Determine village-specific multiplier or fallback to request/config
        multiplier = village_multipliers.get(p.village, req.rural_multiplier or 1.5)

        area = p.area_hectares
        base_val = rate * area
        mult_val = base_val * multiplier
        solatium_val = (mult_val * solatium_pct) / 100.0
        asset_rate = asset_allowances.get(p.land_type, 1.0)
        asset_val = asset_rate * area

        total_muavja_lakhs = mult_val + solatium_val + asset_val
        total_muavja_inr = total_muavja_lakhs * 100000.0

        total_area += area
        total_base_lakhs += base_val
        total_solatium_lakhs += solatium_val
        total_assets_lakhs += asset_val
        grand_total_lakhs += total_muavja_lakhs

        details.append(ParcelCompensationDetail(
            parcel_id=p.parcel_id,
            khasra_no=p.khasra_no,
            owner_name=p.owner_name,
            land_type=p.land_type,
            area_ha=round(area, 3),
            base_market_rate_per_ha_lakhs=rate,
            base_market_value_lakhs=round(base_val, 2),
            location_multiplier=multiplier,
            multiplied_market_value_lakhs=round(mult_val, 2),
            solatium_amount_lakhs=round(solatium_val, 2),
            asset_crop_allowance_lakhs=round(asset_val, 2),
            total_muavja_lakhs=round(total_muavja_lakhs, 2),
            total_muavja_inr=round(total_muavja_inr, 2),
            is_synthetic=p.is_synthetic
        ))

    return CompensationEstimateResponse(
        total_parcels=len(details),
        total_affected_area_ha=round(total_area, 2),
        total_base_value_lakhs=round(total_base_lakhs, 2),
        total_solatium_lakhs=round(total_solatium_lakhs, 2),
        total_asset_allowance_lakhs=round(total_assets_lakhs, 2),
        grand_total_muavja_lakhs=round(grand_total_lakhs, 2),
        grand_total_muavja_inr=round(grand_total_lakhs * 100000.0, 2),
        act_reference=rates_cfg.get("act_reference", "RFCTLARR Act 2013"),
        parcels_breakdown=details
    )

@router.post("/readymap/export")
def export_readymap_file(
    export_format: str = "excel", # excel, geojson, pdf
    parcel_ids: List[str] = [],
    db: Session = Depends(get_db)
):
    if not parcel_ids:
        parcels = db.query(Parcel).limit(20).all()
        parcel_ids = [p.parcel_id for p in parcels]

    comp_req = CompensationEstimateRequest(parcel_ids=parcel_ids)
    comp_data = estimate_muavja_compensation(comp_req, db)

    if export_format == "excel":
        rows = []
        for p in comp_data.parcels_breakdown:
            rows.append({
                "Parcel ID": p.parcel_id,
                "Khasra No": p.khasra_no,
                "Owner Name (Demo Data)": p.owner_name,
                "Land Type": p.land_type,
                "Area (Hectares)": p.area_ha,
                "Base Market Rate (Lakhs/ha)": p.base_market_rate_per_ha_lakhs,
                "Base Market Value (Lakhs)": p.base_market_value_lakhs,
                "Location Multiplier (illustrative - verify with state rules)": p.location_multiplier,
                "Multiplied Market Value (Lakhs)": p.multiplied_market_value_lakhs,
                "Solatium 100% (Lakhs)": p.solatium_amount_lakhs,
                "Asset & Crop Allowance (Lakhs)": p.asset_crop_allowance_lakhs,
                "Total Compensation (Muavja Lakhs)": p.total_muavja_lakhs,
                "Total Compensation (INR)": p.total_muavja_inr,
                "Data Source": "Synthetic Demo Record" if p.is_synthetic else "Verified Record"
            })
        df = pd.DataFrame(rows)
        output = io.BytesIO()
        try:
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                df.to_excel(writer, index=False, sheet_name="Muavja Compensation")
            output.seek(0)
            return Response(
                content=output.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=BhoomiSetu_Compensation_Sheet.xlsx"}
            )
        except Exception:
            csv_str = df.to_csv(index=False)
            return Response(
                content=csv_str.encode('utf-8'),
                media_type="text/csv",
                headers={"Content-Disposition": "attachment; filename=BhoomiSetu_Compensation_Sheet.csv"}
            )

    elif export_format == "geojson":
        parcels = db.query(Parcel).filter(Parcel.parcel_id.in_(parcel_ids)).all()
        features = []
        for p in parcels:
            features.append({
                "type": "Feature",
                "geometry": p.geojson_geometry,
                "properties": {
                    "parcel_id": p.parcel_id,
                    "khasra_no": p.khasra_no,
                    "owner_name": p.owner_name,
                    "land_type": p.land_type,
                    "area_ha": p.area_hectares,
                    "is_synthetic": p.is_synthetic
                }
            })
        return {
            "type": "FeatureCollection",
            "features": features
        }

    elif export_format == "pdf":
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=20, leftMargin=20, topMargin=20, bottomMargin=20)
        story = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'MuavjaTitle', parent=styles['Heading1'], fontSize=16, textColor=colors.HexColor('#065f46'), spaceAfter=4
        )
        sub_style = ParagraphStyle(
            'MuavjaSubTitle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#475569'), spaceAfter=10
        )

        story.append(Paragraph("BHUMISETU — Land Acquisition Compensation (Muavja) Audit Sheet", title_style))
        story.append(Paragraph(
            "Calculated under RFCTLARR Act 2013 | Location Multipliers are illustrative (verify with state rules)",
            sub_style
        ))

        table_data = [
            ["Khasra", "Owner", "Category", "Area (ha)", "Base Rate (L/ha)", "Base Val (L)", "Multiplier", "Mult Val (L)", "Solatium 100%", "Assets (L)", "Total (Lakhs)"]
        ]

        for p in comp_data.parcels_breakdown:
            table_data.append([
                p.khasra_no,
                p.owner_name[:18],
                p.land_type,
                str(p.area_ha),
                str(p.base_market_rate_per_ha_lakhs),
                str(p.base_market_value_lakhs),
                f"{p.location_multiplier}x*",
                str(p.multiplied_market_value_lakhs),
                str(p.solatium_amount_lakhs),
                str(p.asset_crop_allowance_lakhs),
                str(p.total_muavja_lakhs)
            ])

        t_style = TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#065f46')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc'))
        ])

        m_table = Table(table_data, colWidths=[55, 110, 65, 50, 65, 60, 55, 65, 65, 55, 75])
        m_table.setStyle(t_style)
        story.append(m_table)
        story.append(Spacer(1, 10))
        story.append(Paragraph(
            "<b>Note:</b> *Multiplier values (1.0x to 2.0x) are illustrative default parameters based on RFCTLARR 2013 Section 26(2). Official notification required.",
            styles['Italic']
        ))

        doc.build(story)
        buffer.seek(0)

        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=BhoomiSetu_Muavja_Compensation_Report.pdf"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")
