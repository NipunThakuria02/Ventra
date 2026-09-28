"""
backend/main.py

FastAPI Application for #VENTRA: Venture Debt Early Warning System.
Exposes clean REST API over SQLite persistence and untouched Python ML scoring pipeline.
"""

import os
import sys
import sqlite3
from typing import List
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.schemas import (
    HealthResponse,
    PortfolioCompany,
    PortfolioSummary,
    CompanyDetail,
    SignalDetail,
    ScoreHistoryPoint,
    Alert,
    RefreshResponse
)
from backend.services.model_adapter import is_model_healthy
from backend.services.refresh_service import run_live_refresh
from backend import database

app = FastAPI(
    title="VENTRA — Venture Debt Early Warning System API",
    description="REST API delivering early distress warnings for Indian venture-debt backed startups using alternative public data signals.",
    version="1.0.0"
)

# Allow origins from env var (set ALLOWED_ORIGINS on Render to your Vercel URL)
# Falls back to "*" for local dev / demo if unset.
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
ALLOWED_ORIGINS = [o.strip() for o in _allowed_origins_env.split(",")] if _allowed_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check():
    """Returns status of database and model integration without running heavy scrapers."""
    db_ok = False
    try:
        conn = database.get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM companies")
        row = cursor.fetchone()
        db_ok = row is not None and row[0] > 0
        conn.close()
    except Exception:
        db_ok = False

    model_ok = is_model_healthy()
    overall = "ok" if (db_ok and model_ok) else "degraded"

    return HealthResponse(
        status=overall,
        database=db_ok,
        model=model_ok
    )


@app.get("/portfolio", response_model=List[PortfolioCompany])
def get_portfolio():
    """Returns all monitored portfolio companies with latest scores, status, trends, and top signals."""
    try:
        return database.get_portfolio_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio: {str(e)}")


@app.get("/portfolio/summary", response_model=PortfolioSummary)
def get_portfolio_summary():
    """Returns aggregate portfolio risk metrics computed from non-retrospective SQLite records."""
    try:
        return database.get_portfolio_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio summary: {str(e)}")


@app.get("/company/{company_id}", response_model=CompanyDetail)
def get_company(company_id: int):
    """Returns metadata, latest score, risk status, score change, and data coverage for a company."""
    comp = database.get_company_detail(company_id)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")
    return comp


@app.get("/company/{company_id}/signals", response_model=List[SignalDetail])
def get_company_signals(company_id: int):
    """Returns all 6 signals for a company with raw values, normalized scores, weights, sources, data_modes, and evidence."""
    comp = database.get_company_detail(company_id)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")
    return database.get_company_signals(company_id)


@app.get("/company/{company_id}/history", response_model=List[ScoreHistoryPoint])
def get_company_history(company_id: int):
    """Returns historical score observations for ScoreTrendChart, including is_retrospective flags."""
    comp = database.get_company_detail(company_id)
    if not comp:
        raise HTTPException(status_code=404, detail=f"Company with ID {company_id} not found")
    return database.get_company_history(company_id)


@app.get("/alerts", response_model=List[Alert])
def get_alerts():
    """Returns active alerts for companies requiring attention (critical, red, amber), sorted by risk severity."""
    try:
        return database.get_alerts_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch alerts: {str(e)}")


@app.post("/refresh", response_model=RefreshResponse)
def refresh_pipeline():
    """
    Triggers live signal refresh flow:
    - Runs available live scrapers
    - Retains last known values on scraper errors
    - Passes updated signals to model_adapter
    - Updates SQLite and score_history
    - Returns updated portfolio status summary
    """
    try:
        res = run_live_refresh()
        return RefreshResponse(
            status=res["status"],
            timestamp=res["timestamp"],
            companies_updated=res["companies_updated"],
            errors=res["errors"],
            logs=res["logs"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline refresh failed: {str(e)}")
