"""
backend/services/refresh_service.py

Data ingestion and live signal refresh service.
Directly invokes live scraper functions:
  - scrapers.scraper_news.get_news_score(...)
  - scrapers.scraper_jobs.process_company(...)

Implements Last-Known-Value Rule:
  - If live scraper succeeds: persists updated signal and recalculates composite score.
  - If live scraper fails/times out: retains last known persisted value from SQLite.
  - Does NOT overwrite manual or estimated signals.
  - Never substitutes 0, fake estimates, or arbitrary values.
"""

import os
import sys
import json
import sqlite3
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

SCRAPERS_DIR = os.path.join(PROJECT_ROOT, "scrapers")
if SCRAPERS_DIR not in sys.path:
    sys.path.insert(0, SCRAPERS_DIR)

from backend.services.model_adapter import evaluate_company_signals

DB_PATH = os.path.join(PROJECT_ROOT, "db", "ventra.db")

COMPANIES_SEARCH = {
    "Byju's": "Byju's",
    "GoMechanic": "GoMechanic",
    "Zeta": "Zeta India",
    "Razorpay": "Razorpay",
    "Zepto": "Zepto",
    "Groww": "Groww"
}

logger = logging.getLogger("refresh_service")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def fetch_latest_raw_signals(company_id: int) -> Dict[str, Dict[str, Any]]:
    """Retrieves the latest persisted non-retrospective raw signals for a company from SQLite."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT signal_type, raw_value, raw_json, source, data_mode, collected_at
        FROM raw_signals
        WHERE company_id = ? AND is_retrospective = 0
        ORDER BY id ASC
        """,
        (company_id,)
    )
    rows = cursor.fetchall()
    conn.close()


    latest_signals = {}
    for r in rows:
        sig_type = r["signal_type"]
        raw_json_str = r["raw_json"]
        parsed_json = {}
        if raw_json_str:
            try:
                parsed_json = json.loads(raw_json_str)
            except Exception:
                parsed_json = {}
        
        parsed_json["_meta_source"] = r["source"]
        parsed_json["_meta_data_mode"] = r["data_mode"]
        parsed_json["_meta_raw_value"] = r["raw_value"]
        latest_signals[sig_type] = parsed_json

    return latest_signals


def run_live_refresh() -> Dict[str, Any]:
    """
    Executes live refresh flow:
      1. Calls live News and Hiring Activity scrapers for each company.
      2. If scraper succeeds -> updates raw_signals input.
      3. If scraper fails -> retains last known value in SQLite.
      4. Preserves manual and estimated signals.
      5. Runs model_adapter.evaluate_company_signals() to calculate updated composite score.
      6. Persists updated composite score into score_history (is_retrospective = 0).
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name FROM companies")
    companies = cursor.fetchall()
    conn.close()

    refresh_logs = []
    updated_count = 0
    errors = []

    # Import scrapers safely
    try:
        from scraper_news import get_news_score, API_KEY as NEWS_API_KEY
    except (ImportError, RuntimeError) as e:
        get_news_score = None
        NEWS_API_KEY = None
        logger.info(f"News scraper notice: {e}")


    try:
        from scraper_jobs import process_company as process_jobs_company
    except ImportError:
        process_jobs_company = None

    now_iso = datetime.now(timezone.utc).isoformat()

    for comp in companies:
        company_id = comp["id"]
        company_name = comp["name"]
        search_term = COMPANIES_SEARCH.get(company_name, company_name)

        # 1. Fetch existing stored signals (last known values)
        current_signals = fetch_latest_raw_signals(company_id)
        
        # 2. Try running News Scraper
        if get_news_score and NEWS_API_KEY:
            try:
                news_res = get_news_score(company_name, search_term)
                if news_res and news_res.get("distress_score") is not None:
                    news_res["_meta_source"] = "NewsAPI + VADER"
                    news_res["_meta_data_mode"] = "live"
                    news_res["_meta_raw_value"] = news_res.get("distress_score")
                    current_signals["news"] = news_res
                    refresh_logs.append(f"Successfully refreshed News sentiment for {company_name}")
                else:
                    refresh_logs.append(f"News sentiment scraper returned no results for {company_name}; retaining last known value.")
            except Exception as e:
                err_msg = f"News scraper error for {company_name}: {str(e)}"
                logger.warning(err_msg)
                errors.append(err_msg)
                refresh_logs.append(f"News scraper failed for {company_name}; retaining last known value.")
        else:
            refresh_logs.append(f"NewsAPI key not available; retaining last known News signal for {company_name}.")

        # 3. Try running Jobs (Hiring Activity) Scraper
        if process_jobs_company:
            try:
                jobs_res = process_jobs_company(company_name)
                if jobs_res and jobs_res.get("job_activity_score") is not None:
                    jobs_res["_meta_source"] = "Google News RSS"
                    jobs_res["_meta_data_mode"] = "live"
                    jobs_res["_meta_raw_value"] = jobs_res.get("job_activity_score")
                    current_signals["jobs"] = jobs_res
                    refresh_logs.append(f"Successfully refreshed Hiring Activity for {company_name}")
                else:
                    refresh_logs.append(f"Hiring Activity scraper returned no data for {company_name}; retaining last known value.")
            except Exception as e:
                err_msg = f"Hiring Activity scraper error for {company_name}: {str(e)}"
                logger.warning(err_msg)
                errors.append(err_msg)
                refresh_logs.append(f"Hiring Activity scraper failed for {company_name}; retaining last known value.")

        # 4. Pass updated signals to model_adapter
        eval_result = evaluate_company_signals(current_signals)
        composite_score = eval_result["composite_score"]
        status = eval_result["status"]
        used_signals = eval_result["used_signals"]

        # 5. Persist updated signals & score_history to SQLite
        db_conn = get_db_connection()
        db_cursor = db_conn.cursor()

        for sig_type, sig_data in current_signals.items():
            norm_score = used_signals.get(sig_type)
            source_str = sig_data.get("_meta_source") or sig_data.get("source") or ("Google News RSS" if sig_type == "jobs" else "NewsAPI + VADER")
            data_mode = sig_data.get("_meta_data_mode") or sig_data.get("data_mode") or ("live" if sig_type in ["news", "jobs"] else "manual")
            raw_val = sig_data.get("_meta_raw_value") or sig_data.get("job_activity_score") or sig_data.get("distress_score") or sig_data.get("pct_change")

            db_cursor.execute(
                """
                INSERT INTO raw_signals (company_id, signal_type, raw_value, raw_json, normalized_score, source, data_mode, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    company_id,
                    sig_type,
                    raw_val,
                    json.dumps(sig_data),
                    norm_score,
                    source_str,
                    data_mode,
                    now_iso
                )
            )

        db_cursor.execute(
            """
            INSERT INTO score_history (company_id, score, status, is_retrospective, calculated_at)
            VALUES (?, ?, ?, 0, ?)
            """,
            (company_id, composite_score, status, now_iso)
        )
        db_conn.commit()
        db_conn.close()
        updated_count += 1

    return {
        "status": "success",
        "timestamp": now_iso,
        "companies_updated": updated_count,
        "errors": errors,
        "logs": refresh_logs
    }
