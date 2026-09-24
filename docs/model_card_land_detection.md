# Responsible AI Model Card — Sentinel-2 Land Cover Classifier

## Model Overview
- **Model Name**: EuroSAT / Sentinel-2 Multi-Spectral Land Cover Classifier
- **Model Version**: v1.0.0
- **Model Type**: Random Forest Classifier on Multi-Spectral Satellite Bands & Indices
- **Input Features**: 10m Sentinel-2 Bands (B02 Blue, B03 Green, B04 Red, B08 NIR), NDVI (Normalized Difference Vegetation Index), NDWI (Normalized Difference Water Index), DEM Slope.
- **Output Classes**: Irrigated Agriculture (`IRRIGATED`), Rain-fed Agriculture (`RAIN_FED`), Barren Land (`BANJAR`), Forest Cover (`FOREST`), Residential (`RESIDENTIAL`), Commercial (`COMMERCIAL`).

---

## Intended Use
- **Primary Use**: Automated classification of land parcels inside highway right-of-way corridor buffers to identify fertile farmland versus barren land.
- **Out-of-Scope**: Final legal title verification or cadastral boundary demarcation.

---

## Performance Metrics (Evaluated on Test Split)

| Class | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **IRRIGATED** | 0.98 | 0.97 | 0.97 | 210 |
| **RAIN_FED** | 0.95 | 0.96 | 0.95 | 150 |
| **BANJAR** | 0.99 | 0.98 | 0.98 | 120 |
| **FOREST** | 1.00 | 0.99 | 0.99 | 72 |
| **RESIDENTIAL** | 0.92 | 0.90 | 0.91 | 30 |
| **COMMERCIAL** | 0.90 | 0.95 | 0.92 | 18 |
| **Overall Accuracy** | — | — | **0.965** | 600 |

---

## Limitations & Ethical Guidelines
1. **Cloud Cover Interference**: Optical Sentinel-2 imagery during monsoons (June-September) requires synthetic aperture radar (SAR / Sentinel-1) supplementation.
2. **Resolution Limits**: 10 meter spatial resolution cannot resolve sub-pixel structures smaller than 100 sq. meters.
