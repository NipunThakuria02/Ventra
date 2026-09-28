"""
backend/database.py

SQLite connection and query services for Ventra Venture Debt Early Warning System.
Ensures current score calculations, previous_score, score_change, and portfolio metrics
strictly filter out retrospective records (is_retrospective = 0).
"""

import os
import sys
import json
import sqlite3
from typing import Dict, Any, List, Optional

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

DB_PATH = os.path.join(PROJECT_ROOT, "db", "ventra.db")

DISPLAY_NAMES = {
    "linkedin": "LinkedIn Headcount",
    "jobs": "Hiring Activity",
    "news": "News Sentiment",
    "gstin": "GSTIN Status",
    "mca": "MCA Filing Status",
    "appstore": "App Store Health"
}

SIGNAL_WEIGHTS = {
    "linkedin": 0.25,
    "news": 0.20,
    "mca": 0.15,
    "gstin": 0.15,
    "jobs": 0.15,
    "appstore": 0.10
}


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_latest_non_retrospective_scores(conn: sqlite3.Connection, company_id: int) -> List[sqlite3.Row]:
    """Returns non-retrospective score_history rows for a company, ordered by id DESC."""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT score, status, calculated_at
        FROM score_history
        WHERE company_id = ? AND is_retrospective = 0
        ORDER BY id DESC
        LIMIT 2
        """,
        (company_id,)
    )
    return cursor.fetchall()


def get_portfolio_list() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, category FROM companies ORDER BY id ASC")
    companies = cursor.fetchall()

    portfolio = []
    for comp in companies:
        c_id = comp["id"]
        c_name = comp["name"]
        category = comp["category"]

        # Fetch latest non-retrospective score records
        score_rows = get_latest_non_retrospective_scores(conn, c_id)
        current_score = score_rows[0]["score"] if score_rows else None
        current_status = score_rows[0]["status"] if score_rows else "unknown"
        last_updated = score_rows[0]["calculated_at"] if score_rows else None

        previous_score = None
        score_change = None
        if len(score_rows) >= 2:
            previous_score = score_rows[1]["score"]
            score_change = round(current_score - previous_score, 2)

        # Count signals and find top signal
        cursor.execute(
            """
            SELECT signal_type, normalized_score, source, data_mode
            FROM raw_signals
            WHERE company_id = ? AND is_retrospective = 0 AND id IN (
                SELECT MAX(id) FROM raw_signals WHERE company_id = ? AND is_retrospective = 0 GROUP BY signal_type
            )
            """,
            (c_id, c_id)
        )

        sig_rows = cursor.fetchall()
        signal_count = len(sig_rows)

        # Identify top contributing signal (highest normalized score * weight)
        top_signal_name = None
        max_contrib = -1.0
        coverage_summary = {"live": 0, "manual": 0, "estimated": 0}

        for s in sig_rows:
            stype = s["signal_type"]
            nscore = s["normalized_score"] if s["normalized_score"] is not None else 0.0
            weight = SIGNAL_WEIGHTS.get(stype, 0.1)
            contrib = nscore * weight
            if contrib > max_contrib:
                max_contrib = contrib
                top_signal_name = DISPLAY_NAMES.get(stype, stype)

            mode = s["data_mode"]
            if mode in coverage_summary:
                coverage_summary[mode] += 1

        portfolio.append({
            "id": c_id,
            "name": c_name,
            "category": category,
            "score": current_score,
            "status": current_status,
            "previous_score": previous_score,
            "score_change": score_change,
            "signal_count": signal_count,
            "top_signal": top_signal_name,
            "data_coverage": coverage_summary,
            "last_updated": last_updated
        })

    conn.close()
    return portfolio


def get_portfolio_summary() -> Dict[str, Any]:
    portfolio = get_portfolio_list()

    total_companies = len(portfolio)
    green_count = sum(1 for c in portfolio if c["status"] == "green")
    amber_count = sum(1 for c in portfolio if c["status"] == "amber")
    red_count = sum(1 for c in portfolio if c["status"] == "red")
    critical_count = sum(1 for c in portfolio if c["status"] == "critical")
    requires_attention = amber_count + red_count + critical_count

    valid_scores = [c["score"] for c in portfolio if c["score"] is not None]
    avg_score = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 0.0

    return {
        "total_companies": total_companies,
        "green_count": green_count,
        "amber_count": amber_count,
        "red_count": red_count,
        "critical_count": critical_count,
        "requires_attention_count": requires_attention,
        "average_distress_score": avg_score
    }


def get_company_detail(company_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, category FROM companies WHERE id = ?", (company_id,))
    comp = cursor.fetchone()
    if not comp:
        conn.close()
        return None

    c_id = comp["id"]
    c_name = comp["name"]
    category = comp["category"]

    score_rows = get_latest_non_retrospective_scores(conn, c_id)
    current_score = score_rows[0]["score"] if score_rows else None
    current_status = score_rows[0]["status"] if score_rows else "unknown"
    last_updated = score_rows[0]["calculated_at"] if score_rows else None

    previous_score = None
    score_change = None
    if len(score_rows) >= 2:
        previous_score = score_rows[1]["score"]
        score_change = round(current_score - previous_score, 2)

    # Coverage summary
    cursor.execute(
        """
        SELECT signal_type, data_mode, source
        FROM raw_signals
        WHERE company_id = ? AND is_retrospective = 0 AND id IN (
            SELECT MAX(id) FROM raw_signals WHERE company_id = ? AND is_retrospective = 0 GROUP BY signal_type
        )

        """,
        (c_id, c_id)
    )
    sig_rows = cursor.fetchall()
    coverage_summary = {"live": 0, "manual": 0, "estimated": 0, "total": len(sig_rows)}
    signals_coverage = []
    for s in sig_rows:
        stype = s["signal_type"]
        mode = s["data_mode"]
        source = s["source"]
        if mode in coverage_summary:
            coverage_summary[mode] += 1
        signals_coverage.append({
            "signal_type": stype,
            "display_name": DISPLAY_NAMES.get(stype, stype),
            "data_mode": mode,
            "source": source
        })

    conn.close()
    return {
        "id": c_id,
        "name": c_name,
        "category": category,
        "score": current_score,
        "status": current_status,
        "previous_score": previous_score,
        "score_change": score_change,
        "last_updated": last_updated,
        "coverage_summary": coverage_summary,
        "data_coverage": signals_coverage
    }


def get_company_signals(company_id: int) -> List[Dict[str, Any]]:
    from backend.services.model_adapter import get_risk_status
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT signal_type, raw_value, raw_json, normalized_score, source, data_mode, collected_at
        FROM raw_signals
        WHERE company_id = ? AND is_retrospective = 0 AND id IN (
            SELECT MAX(id) FROM raw_signals WHERE company_id = ? AND is_retrospective = 0 GROUP BY signal_type
        )
        ORDER BY signal_type ASC

        """,
        (company_id, company_id)
    )
    rows = cursor.fetchall()
    conn.close()

    signals = []
    for r in rows:
        stype = r["signal_type"]
        norm_score = r["normalized_score"]
        raw_json_str = r["raw_json"]
        parsed_json = {}
        if raw_json_str:
            try:
                parsed_json = json.loads(raw_json_str)
            except Exception:
                parsed_json = {}

        sig_status = get_risk_status(norm_score)
        weight = SIGNAL_WEIGHTS.get(stype, 0.10)

        signals.append({
            "signal_type": stype,
            "display_name": DISPLAY_NAMES.get(stype, stype),
            "raw_value": r["raw_value"],
            "normalized_score": norm_score,
            "weight": weight,
            "risk_status": sig_status,
            "source": r["source"],
            "data_mode": r["data_mode"],
            "collected_at": r["collected_at"],
            "evidence": parsed_json
        })

    return signals


def get_company_history(company_id: int) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT score, status, is_retrospective, calculated_at
        FROM score_history
        WHERE company_id = ?
        ORDER BY calculated_at ASC, id ASC
        """,
        (company_id,)
    )
    rows = cursor.fetchall()
    conn.close()

    history = []
    for r in rows:
        history.append({
            "score": r["score"],
            "status": r["status"],
            "is_retrospective": bool(r["is_retrospective"]),
            "calculated_at": r["calculated_at"]
        })

    return history


def get_alerts_list() -> List[Dict[str, Any]]:
    portfolio = get_portfolio_list()
    # Filter companies requiring attention (critical, red, amber)
    attention_companies = [c for c in portfolio if c["status"] in ["critical", "red", "amber"]]
    
    # Sort by severity: critical > red > amber, then by score descending
    severity_order = {"critical": 0, "red": 1, "amber": 2}
    attention_companies.sort(key=lambda x: (severity_order.get(x["status"], 3), - (x["score"] or 0)))

    alerts = []
    for comp in attention_companies:
        c_signals = get_company_signals(comp["id"])
        # Top 3 contributing signals
        top_contrib_signals = sorted(c_signals, key=lambda s: (s["normalized_score"] or 0) * s["weight"], reverse=True)[:3]
        
        top_signals_info = []
        reasons = []
        for ts in top_contrib_signals:
            top_signals_info.append({
                "signal_type": ts["signal_type"],
                "display_name": ts["display_name"],
                "normalized_score": ts["normalized_score"],
                "risk_status": ts["risk_status"],
                "data_mode": ts["data_mode"]
            })
            if (ts["normalized_score"] or 0) >= 55:
                reasons.append(f"{ts['display_name']} elevated distress ({ts['normalized_score']}/100)")

        if not reasons:
            reasons.append(f"Composite distress score at {comp['score']}/100 ({comp['status'].upper()})")

        alerts.append({
            "id": comp["id"],
            "name": comp["name"],
            "category": comp["category"],
            "score": comp["score"],
            "status": comp["status"],
            "score_change": comp["score_change"],
            "top_signals": top_signals_info,
            "reason": "; ".join(reasons),
            "last_updated": comp["last_updated"]
        })

    return alerts
