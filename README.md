# 🏛️ BHOOMI SETU (भूमि सेतु)
### National Digital Platform for Evidence-Based Land Governance, Policy Innovation, and Geospatial Research

> **Smart India Hackathon 2026** — Problem Statement **SIH26019**

---

## 🌟 Executive Summary

**BHOOMI SETU** is a government-grade, production-ready national digital platform designed to streamline land governance, geospatial intelligence, research discovery, and evidence-based policymaking across India. It connects land parcel datasets, infrastructure corridors, legal dispute histories, and AI-driven predictive risk assessment into a single unified platform.

---

## ✨ Key Features & Capabilities

### 1. 🗺️ GIS Land Intelligence & Google Maps Engine
* **Google Maps Multi-Engine Support**: Seamlessly switch between **Google Hybrid (Satellite + Road Labels)**, **Google HD Satellite**, **Google Roadmap**, and **Google Terrain** elevation layers.
* **Direct Google Maps Navigation**: One-click deep link (`lat, lng`) to open land parcel coordinates directly in the Google Maps mobile app or web platform for turn-by-turn navigation and Street View.
* **Cadastral Overlay**: Polygon boundaries, land usability status (🟢 Usable, 🟡 Under Review, 🟠 Restricted, 🔴 Not Usable, 🔵 Under Acquisition), and risk corridor overlays.

### 2. 🔐 Role-Based Authentication & User Access Control
* **Public User Role**: Land parcel search, public land record inspection, GIS map exploration, research paper discovery, and AI assistant interaction.
* **Admin / Authorized Officer Role**: Full administrative control to create new land records, edit cadastral attributes, update usability status, manage legal dispute flags, verify owner identity, and inspect real-time audit logs.
* **Phone Number Signup**: Phone number & OTP authentication layer.

### 3. 🛡️ Official Admin Portal & Immutable Audit Trail
* **Land Parcel Management**: Interface for government officials to update khasra details, survey numbers, acquisition stages, and legal status.
* **Real-time Database Audit Panel**: Tracks every modification, field update, timestamp, and official user identity with IndexedDB persistence.

### 4. 🤖 BHOOMI AI — Intelligent RAG Decision Support
* AI assistant trained on land governance frameworks, LARA (Land Acquisition, Rehabilitation and Resettlement Act), legal precedents, and policy guidelines to assist researchers and officials.

### 5. 📈 Predictive Analytics Engine
* Machine learning risk scoring engine calculating delay probability percentages, financial dispute risks, environmental sensitivities, and compensation bottleneck alerts.

### 6. ⚖️ Policy Lab & Simulation Sandbox
* Interactive policy testing workbench allowing policymakers to model financial impacts, compensation multiples, and legal timelines prior to legislative implementation.

### 7. 📚 Research Hub & Cadastral Search Engine
* Search engine supporting State, District, Tehsil, Village, Khasra Number (e.g., `402/1-A`), Survey Number, or Parcel ID lookup.

---

## 🛠️ Technology Stack

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 with TypeScript |
| **Styling & UI** | Tailwind CSS & Lucide React Icons |
| **GIS & Geospatial** | Leaflet, React-Leaflet, Google Maps Engine Tiles, Esri World Imagery |
| **Data Visualization** | Recharts |
| **Database & Persistence** | Local IndexedDB & LocalStorage Service Layer |
| **Bundler & Tooling** | Vite & PostCSS |

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/devesh-pt/bhoomi-setu.git
   cd bhoomi-setu
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Production Build & Local Preview**:
   ```bash
   npm run build
   npx vite preview --port 3000 --host 0.0.0.0
   ```

---

## 🔑 Demo Credentials Reference

| Role | Phone Number | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Public User** | `+91 98765 43210` | `user123` | Search, View Land Records, GIS Map, Research, AI Assistant |
| **Admin / Authorized Officer** | `+91 99999 00000` | `admin123` | All User Permissions + Add/Edit Land Records, Verify Parcels, Audit Logs |

---

## 📄 License

This repository is developed for **Smart India Hackathon 2026 (SIH26019)**. All rights reserved.
