import os
import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.user import User
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.parcels import router as parcels_router
from app.api.highways import router as highways_router
from app.api.detect import router as detect_router
from app.api.muavja import router as muavja_router
from app.api.forest import router as forest_router
from app.api.cases import router as cases_router
from app.api.datasets import router as datasets_router
from app.api.land import router as land_router
from app.api.mutations import router as mutations_router
from app.api.grievances import router as grievances_router
from app.api.certificates import router as certificates_router
from app.api.court import router as court_router
from app.api.disputes import router as disputes_router
from app.api.mismatch import router as mismatch_router
from app.api.fraud import router as fraud_router
from app.api.banjar import router as banjar_router
from app.api.audit import router as audit_router
from app.api.districts import router as districts_router
from app.api.identify import router as identify_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bhumisetu")

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

# Mask sensitive DB info for safe startup logging
raw_db_url = settings.DATABASE_URL
if "@" in raw_db_url:
    prefix = raw_db_url.split("://")[0]
    host_db = raw_db_url.split("@")[-1]
    safe_db_url = f"{prefix}://*****:*****@{host_db}"
else:
    safe_db_url = raw_db_url

secret_status = "Custom Secret Provided" if settings.SECRET_KEY != "bhumisetu_super_secret_jwt_key_2026_sih_hackathon_demo" else "Default Demo Key"

# Startup DB Logging
db = SessionLocal()
try:
    users = db.query(User).all()
    user_list = [f"{u.username} ({u.role})" for u in users]
    logger.info("============================================================")
    logger.info("BHUMISETU Backend Started")
    logger.info(f"Database URL: {safe_db_url}")
    logger.info(f"JWT Secret Status: {secret_status}")
    logger.info(f"Allowed CORS Origins: {settings.cors_origins_list}")
    logger.info(f"Seeded Users Count: {len(users)} -> {user_list}")
    logger.info("============================================================")
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="National Digital Platform for Evidence-Based Land Governance, Infrastructure Acquisition, GIS Intelligence & Forest Impact Monitoring",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Process time header middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    return response

# Include API Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(health_router, prefix=api_v1_prefix)
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(parcels_router, prefix=api_v1_prefix)
app.include_router(parcels_router, prefix="/api")
app.include_router(identify_router, prefix=api_v1_prefix)
app.include_router(identify_router, prefix="/api")
app.include_router(districts_router, prefix=f"{api_v1_prefix}/districts", tags=["Districts"])
app.include_router(districts_router, prefix="/api/districts", tags=["Districts"])
app.include_router(highways_router, prefix=api_v1_prefix)

app.include_router(detect_router, prefix=api_v1_prefix)
app.include_router(detect_router, prefix="/api")
app.include_router(muavja_router, prefix=api_v1_prefix)
app.include_router(forest_router, prefix=api_v1_prefix)
app.include_router(forest_router, prefix="/api")
app.include_router(cases_router, prefix=api_v1_prefix)
app.include_router(datasets_router, prefix=api_v1_prefix)
app.include_router(land_router, prefix=f"{api_v1_prefix}/land", tags=["Land Records"])
app.include_router(mutations_router, prefix=f"{api_v1_prefix}/mutations", tags=["Mutations"])
app.include_router(grievances_router, prefix=f"{api_v1_prefix}/grievances", tags=["Grievances & Corrections"])
app.include_router(certificates_router, prefix=f"{api_v1_prefix}/certificates", tags=["Signed Certificates"])
app.include_router(court_router, prefix=f"{api_v1_prefix}/court", tags=["Revenue Court"])
app.include_router(disputes_router, prefix=f"{api_v1_prefix}/ai", tags=["AI Dispute Analyzer"])
app.include_router(mismatch_router, prefix=f"{api_v1_prefix}/mismatch", tags=["Record vs Reality Mismatch"])
app.include_router(fraud_router, prefix=f"{api_v1_prefix}/fraud", tags=["Fraud & Anomaly Detection"])
app.include_router(banjar_router, prefix=f"{api_v1_prefix}/land", tags=["Banjar Land Finder"])
app.include_router(audit_router, prefix=f"{api_v1_prefix}/audit", tags=["Tamper-Proof Audit Chain"])

@app.get("/health", tags=["Health"])
def root_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "docs": "/docs"
    }

# Static files & SPA Fallback setup
static_dir = os.getenv("STATIC_DIR")
if not static_dir:
    candidate = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
    if os.path.exists(candidate):
        static_dir = candidate

if static_dir and os.path.exists(static_dir):
    assets_path = os.path.join(static_dir, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(request: Request, full_path: str):
        if (
            full_path.startswith("api") or 
            full_path.startswith("docs") or 
            full_path.startswith("openapi.json") or 
            full_path.startswith("redoc") or 
            full_path.startswith("health")
        ):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        
        target_file = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"detail": "Static index.html not found"})

@app.get("/", tags=["Root"])
def root():
    if static_dir and os.path.exists(os.path.join(static_dir, "index.html")):
        return FileResponse(os.path.join(static_dir, "index.html"))
    return {
        "message": "Welcome to BHUMISETU (भूमि सेतु) API Portal",
        "version": settings.VERSION,
        "documentation": "/docs"
    }

