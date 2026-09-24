.PHONY: dev build test lint seed clean help

PYTHON ?= python3
NODE ?= node
NPM ?= npm

help:
	@echo "BHUMISETU Makefile Commands:"
	@echo "  make dev         - Start backend and frontend in development mode"
	@echo "  make install     - Install all backend and frontend dependencies"
	@echo "  make seed        - Generate synthetic parcel dataset"
	@echo "  make test        - Run backend pytest and frontend vitest"
	@echo "  make lint        - Run linting for backend (flake8/ruff) and frontend (eslint)"
	@echo "  make build       - Build production assets"

install:
	cd backend && $(PYTHON) -m pip install -r requirements.txt
	cd frontend && $(NPM) install

seed:
	$(PYTHON) scripts/generate_synthetic_parcels.py

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && $(NPM) run dev

dev:
	make seed
	make dev-backend & make dev-frontend

test-backend:
	cd backend && pytest -v --cov=app tests/

test-frontend:
	cd frontend && $(NPM) test -- --run

test: test-backend test-frontend

lint-backend:
	cd backend && flake8 app/ tests/ || true

lint-frontend:
	cd frontend && $(NPM) run lint || true

lint: lint-backend lint-frontend

build:
	cd frontend && $(NPM) run build
