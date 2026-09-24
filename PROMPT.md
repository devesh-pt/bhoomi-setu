BHUMISETU — Master Prompt for Google Antigravity
0. ROLE AND WORKING RULES
You are a senior full-stack + GIS + ML engineer and a hackathon mentor. Build a complete, demo-ready, working project called BHUMISETU for the Smart India Hackathon (SIH).
Non-negotiable working rules
Plan first. Before writing code, produce an Implementation Plan artifact and a Task List artifact. Wait for my approval on the plan only if something is ambiguous; otherwise proceed.
Build in phases (Section 8). After each phase: install, run, lint, run tests, build, and fix every error before moving on. Never move to the next phase with a failing build.
Pin every dependency version (requirements.txt with exact versions, package.json with exact versions + lockfile). Use Python 3.11 and Node 20 LTS.
No placeholders, no TODOs, no "lorem ipsum", no fake buttons. Every button and menu item must work.
Offline-safe demo. The app must run fully with docker compose up (or make dev) using bundled sample data, even without internet. Live downloads of public datasets are optional and go through a script (scripts/download_datasets.py) with graceful fallback to sample data.
Be honest about data. Real land-record/owner data is not openly available. Use clearly labelled synthetic parcels/owners/cases layered over real public geography (roads, forest, land cover). Show a visible "Demo data" badge in the UI wherever synthetic data appears. Never present synthetic output as real people's records.
Verify with the browser agent. After the UI is built, use the browser to click through every flow in Section 4 and record a walkthrough. Fix anything that breaks.
Write clean, typed, commented code. Handle loading, empty, and error states in every screen.

1. PRODUCT VISION
BHUMISETU ("bridge for land") is a land-intelligence and decision-support platform for highway/infrastructure land acquisition. It connects land records + satellite intelligence + compensation + forest protection in one map-based dashboard so that officers and citizens can:
See every parcel: owner, area, khasra number, land type, and litigation status.
Choose highway alignments that use barren (banjar) land instead of fertile farmland.
Get an AI-estimated compensation (muavja) and a ready map of affected parcels.
Detect forest/tree cover loss in a chosen area and see the environmental cost of a proposed project.
Users: (a) Government/Land Acquisition Officer, (b) Citizen/Landowner, (c) Admin.
Language: English + Hindi toggle (i18n from day one). Use Khasra, Banjar, Muavja as native terms with English subtitles.

2. TECH STACK (fixed — do not substitute)
Frontend: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui, react-i18next, React Query
Maps: MapLibre GL JS (or Leaflet) with OpenStreetMap tiles; GeoJSON layers; draw tool (maplibre-gl-draw / leaflet-draw)
Backend: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic
Database: PostgreSQL 16 + PostGIS via Docker; automatic fallback to SQLite + GeoJSON files if Postgres is unavailable
Geo/ML: geopandas, shapely, pyproj, rasterio, numpy, scikit-learn, LightGBM, joblib
Auth: JWT (access + refresh), bcrypt password hashing, role-based access control, rate limiting
Testing: pytest + httpx (backend), Vitest + React Testing Library (frontend), Playwright (end-to-end)
DevOps: Docker Compose, .env.example, Makefile, GitHub Actions CI (lint + test + build)
