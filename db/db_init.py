"""
db/db_init.py

Initializes SQLite database (db/ventra.db), loads schema, loads repository signal outputs,
invokes model_adapter to compute composite scores, and populates companies, raw_signals,
and score_history (including Byju's retrospective records with is_retrospective = 1).
"""

import os
import sys
import json
import sqlite3
from datetime import datetime, timezone

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.services.model_adapter import evaluate_company_signals, NORMALIZERS

DB_PATH = os.path.join(PROJECT_ROOT, "db", "ventra.db")
SCHEMA_PATH = os.path.join(PROJECT_ROOT, "db", "schema.sql")
SCRAPERS_DIR = os.path.join(PROJECT_ROOT, "scrapers")

COMPANY_CATEGORIES = {
    "Byju's": "distressed",
    "GoMechanic": "distressed",
    "Zeta": "distressed",
    "Razorpay": "healthy",
    "Zepto": "healthy",
    "Groww": "healthy",
}

# Signal types and metadata
SIGNAL_METADATA = {
    "linkedin": {
        "file": "linkedin_results.json",
        "data_mode": "manual",
        "default_source": "LinkedIn Headcount - Manual/Wayback Input"
    },
    "gstin": {
        "file": "gstin_results.json",
        "data_mode": "manual",
        "default_source": "GST Portal - Estimated Input"
    },
    "mca": {
        "file": "mca_results.json",
        "data_mode": "manual",
        "default_source": "MCA Filing Status - Public Filing Input"
    },
    "appstore": {
        "file": "appstore_results.json",
        "data_mode": "estimated",
        "default_source": "Google Play Store / App Store Health"
    }
}

# Real/current inputs for live scrapers from run_full_signals.py
REAL_LIVE_SIGNALS = {
    "Byju's":     {"jobs": {"job_activity_score": 50.00, "source": "Google News RSS", "data_mode": "live"}},
    "GoMechanic": {"jobs": {"job_activity_score": 50.00, "source": "Google News RSS", "data_mode": "live"}},
    "Zeta":       {"jobs": {"job_activity_score": 50.00, "source": "Google News RSS", "data_mode": "live"}},
    "Razorpay":   {
        "jobs": {"job_activity_score": 69.71, "source": "Google News RSS", "data_mode": "live"},
        "news": {"distress_score": 25.30, "source": "NewsAPI + VADER", "data_mode": "live"}
    },
    "Zepto":      {"jobs": {"job_activity_score": 53.31, "source": "Google News RSS", "data_mode": "live"}},
    "Groww":      {"jobs": {"job_activity_score": 50.00, "source": "Google News RSS", "data_mode": "live"}},
}

# Retrospective timeline for Byju's (from model/byju_retrospective.py)
BYJU_RETROSPECTIVE = {
    "2022-01-15": {
        "label": "Jan 2022",
        "signals": {
            "linkedin": {"pct_change": -0.03, "source": "LinkedIn Retrospective Estimate", "data_mode": "manual"},
            "news":     {"distress_score": 40.0, "source": "News Sentiment Retrospective", "data_mode": "manual"},
            "gstin":    {"status": "active", "distress_score": 0.0, "source": "GST Retrospective", "data_mode": "manual"},
            "mca":      {"status": "current", "distress_score": 5.0, "source": "MCA Retrospective", "data_mode": "manual"},
            "jobs":     {"job_activity_score": 42.0, "source": "Google News RSS Retrospective", "data_mode": "manual"},
            "appstore": {"rating": 3.7, "distress_score": 32.5, "source": "Play Store Retrospective", "data_mode": "estimated"},
        }
    },
    "2023-06-15": {
        "label": "Jun 2023",
        "signals": {
            "linkedin": {"pct_change": -0.30, "source": "LinkedIn Retrospective Estimate", "data_mode": "manual"},
            "news":     {"distress_score": 66.0, "source": "News Sentiment Retrospective", "data_mode": "manual"},
            "gstin":    {"status": "suspended", "distress_score": 85.0, "source": "GST Retrospective", "data_mode": "manual"},
            "mca":      {"status": "overdue", "distress_score": 45.0, "source": "MCA Retrospective", "data_mode": "manual"},
            "jobs":     {"job_activity_score": 25.0, "source": "Google News RSS Retrospective", "data_mode": "manual"},
            "appstore": {"rating": 3.3, "distress_score": 42.5, "source": "Play Store Retrospective", "data_mode": "estimated"},
        }
    },
    "2023-10-15": {
        "label": "Oct 2023",
        "signals": {
            "linkedin": {"pct_change": -0.55, "source": "LinkedIn Retrospective Estimate", "data_mode": "manual"},
            "news":     {"distress_score": 82.0, "source": "News Sentiment Retrospective", "data_mode": "manual"},
            "gstin":    {"status": "suspended", "distress_score": 85.0, "source": "GST Retrospective", "data_mode": "manual"},
            "mca":      {"status": "under_liquidation", "distress_score": 90.0, "source": "MCA Retrospective", "data_mode": "manual"},
            "jobs":     {"job_activity_score": 15.0, "source": "Google News RSS Retrospective", "data_mode": "manual"},
            "appstore": {"rating": 2.8, "distress_score": 55.0, "source": "Play Store Retrospective", "data_mode": "estimated"},
        }
    }
}


def load_file_signals():
    """Reads *_results.json from scrapers/ for gstin, appstore, mca, linkedin."""
    loaded = {}
    for sig_type, meta in SIGNAL_METADATA.items():
        filepath = os.path.join(SCRAPERS_DIR, meta["file"])
        if os.path.exists(filepath):
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data.get("companies", []):
                    c_name = item.get("company")
                    if not c_name:
                        continue
                    if c_name not in loaded:
                        loaded[c_name] = {}
                    
                    # Extract raw value if available
                    raw_val = item.get("distress_score")
                    if sig_type == "linkedin" and "pct_change" in item:
                        raw_val = item["pct_change"]
                    elif sig_type == "appstore" and "rating" in item and item["rating"] is not None:
                        raw_val = item["rating"]
                    
                    source = item.get("source", meta["default_source"])
                    item_copy = dict(item)
                    item_copy["_meta_source"] = source
                    item_copy["_meta_data_mode"] = meta["data_mode"]
                    item_copy["_meta_raw_value"] = raw_val
                    loaded[c_name][sig_type] = item_copy
    return loaded


def init_db():
    print(f"Initializing database at: {DB_PATH}")
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    # Remove existing DB file to ensure clean initialization
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("Removed existing database file for clean seed.")
        except Exception as e:
            print(f"Notice: Could not remove old DB file: {e}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    cursor.executescript(schema_sql)
    conn.commit()

    # Get company IDs
    cursor.execute("SELECT id, name FROM companies")
    company_map = {row[1]: row[0] for row in cursor.fetchall()}

    file_signals = load_file_signals()
    now_iso = datetime.now(timezone.utc).isoformat()

    print("\n--- Seeding Live/Current Company Signals & Composite Scores ---")
    for company_name, category in COMPANY_CATEGORIES.items():
        company_id = company_map[company_name]
        combined_raw = {}

        # 1. Combine file signals
        comp_file_sigs = file_signals.get(company_name, {})
        for sig_type, sig_dict in comp_file_sigs.items():
            combined_raw[sig_type] = sig_dict

        # 2. Combine live signals
        comp_live_sigs = REAL_LIVE_SIGNALS.get(company_name, {})
        for sig_type, sig_dict in comp_live_sigs.items():
            combined_raw[sig_type] = sig_dict

        # 3. Pass raw signals through model adapter
        eval_result = evaluate_company_signals(combined_raw)
        composite_score = eval_result["composite_score"]
        status = eval_result["status"]
        used_signals = eval_result["used_signals"]

        # Insert raw signals into DB
        for sig_type, raw_data in combined_raw.items():
            norm_score = used_signals.get(sig_type)
            source_str = raw_data.get("_meta_source") or raw_data.get("source") or ("Google News RSS" if sig_type == "jobs" else "NewsAPI + VADER")
            data_mode = raw_data.get("_meta_data_mode") or raw_data.get("data_mode") or "live"
            raw_val = raw_data.get("_meta_raw_value") or raw_data.get("job_activity_score") or raw_data.get("distress_score")

            cursor.execute(
                """
                INSERT INTO raw_signals (company_id, signal_type, raw_value, raw_json, normalized_score, source, data_mode, is_retrospective, collected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
                """,
                (
                    company_id,
                    sig_type,
                    raw_val,
                    json.dumps(raw_data),
                    norm_score,
                    source_str,
                    data_mode,
                    now_iso
                )
            )

        # Insert score_history into DB (is_retrospective = 0)
        cursor.execute(
            """
            INSERT INTO score_history (company_id, score, status, is_retrospective, calculated_at)
            VALUES (?, ?, ?, 0, ?)
            """,
            (company_id, composite_score, status, now_iso)
        )
        print(f" seeded {company_name:<12} -> Composite Score: {composite_score} ({status})")

    # 4. Seed Byju's Retrospective Observations (is_retrospective = 1)
    if "Byju's" in company_map:
        byju_id = company_map["Byju's"]
        print("\n--- Seeding Byju's Retrospective Observations ---")
        for obs_date, obs_data in BYJU_RETROSPECTIVE.items():
            retro_signals = obs_data["signals"]
            eval_retro = evaluate_company_signals(retro_signals)
            retro_score = eval_retro["composite_score"]
            retro_status = eval_retro["status"]

            for sig_type, r_data in retro_signals.items():
                r_norm = eval_retro["used_signals"].get(sig_type)
                cursor.execute(
                    """
                    INSERT INTO raw_signals (company_id, signal_type, raw_value, raw_json, normalized_score, source, data_mode, is_retrospective, collected_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                    """,
                    (
                        byju_id,
                        sig_type,
                        r_data.get("pct_change") or r_data.get("rating") or r_data.get("distress_score") or r_data.get("job_activity_score"),
                        json.dumps(r_data),
                        r_norm,
                        r_data["source"],
                        r_data["data_mode"],
                        obs_date
                    )
                )

            
            cursor.execute(
                """
                INSERT INTO score_history (company_id, score, status, is_retrospective, calculated_at)
                VALUES (?, ?, ?, 1, ?)
                """,
                (byju_id, retro_score, retro_status, obs_date)
            )
            print(f" Retrospective {obs_data['label']} -> Score: {retro_score} ({retro_status})")

    conn.commit()
    conn.close()
    print("\nDatabase initialization complete!\n")


if __name__ == "__main__":
    init_db()
