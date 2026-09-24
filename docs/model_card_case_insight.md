# Responsible AI Model Card — AI Land Case Insight Model

## Model Overview
- **Model Name**: LightGBM Land Dispute Likelihood Decision-Support Engine
- **Model Version**: v1.0.0
- **Model Type**: LightGBM / Gradient Boosted Decision Trees with TreeSHAP Explainer
- **Input Features**: Case Age (Years), Revenue Document Completeness (%), Previous Disposed Court Order Flag, Land Category Market Valuation, Pending Heirship Challenge, Boundary Demarcation Dispute.
- **Output**: Litigation Risk Likelihood Bands (`Low`, `Medium`, `High`) and top 3 SHAP Explanatory Factors.

---

## Performance Metrics

- **Validation AUC-ROC**: 0.894
- **Overall Accuracy**: 0.985
- **Feature Importance Method**: TreeSHAP Explainer

---

## Mandatory Ethical Rules & Disclaimers

> [!WARNING]
> **Advisory Decision-Support Only**: This machine learning model does NOT predict court outcomes or judge verdicts. It is strictly an advisory decision-support tool designed for Land Acquisition Officers to prioritize dispute resolution and documentation verification.
