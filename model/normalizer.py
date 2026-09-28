"""
normalizer.py — MLE1, Task 3.1

Converts each signal's raw scraper output into a 0-100 DISTRESS score.
0 = healthy / no distress, 100 = maximum distress.

STATUS CHECK (as of this build, from Checkpoint.txt):
  news      -> REAL scraper exists (scraper_news.py)      -> wired below
  jobs      -> REAL scraper exists (scraper_jobs.py)       -> wired below, note it measures
               *hiring/layoff news volume*, not actual job posting counts (Checkpoint.txt
               section 12) — treat as a secondary signal until MLE2 finds a real source.
  gstin, appstore, linkedin (headcount), mca -> NOT scraped yet. Stubbed below with the
               exact raw shape MLE2's scraper should return, so scorer.py runs end-to-end
               today and nothing needs to change here when the real scraper lands —
               only the raw dict passed in changes.
"""

# ---------- signals with working scrapers ----------

def normalize_news(raw: dict) -> float | None:
    """scraper_news.py already outputs a 0-100 distress_score. Pass through."""
    if not raw or raw.get("distress_score") is None:
        return None
    return round(float(raw["distress_score"]), 2)


def normalize_jobs(raw: dict) -> float | None:
    """
    scraper_jobs.py outputs a 0-100 job_activity_score where HIGH = hiring (healthy)
    and LOW = decline/layoffs (distressed). Invert it to a distress score.
    """
    if not raw or raw.get("job_activity_score") is None:
        return None
    activity = float(raw["job_activity_score"])
    return round(100 - activity, 2)


# ---------- signals MLE2 hasn't scraped yet — STUBS ----------

def normalize_gstin(raw: dict) -> float | None:
    """
    scraper_gstin.py now exists and outputs distress_score directly (0/30/85/100
    based on Active/Unknown/Suspended/Cancelled). Pass through if present; fall
    back to a status-text mapping (same scale) for other manual entries that
    only provide a status string (e.g. a stale manual entry not routed through
    scraper_gstin.py's own scoring).
    """
    if not raw:
        return None
    if raw.get("distress_score") is not None:
        return round(float(raw["distress_score"]), 2)
    if "status" not in raw:
        return None
    status = raw["status"].strip().lower()
    mapping = {"active": 0, "unknown": 30, "suspended": 85, "cancelled": 100}
    return float(mapping.get(status, 30))


def normalize_appstore(raw: dict) -> float | None:
    """
    scraper_appstore.py outputs distress_score directly. Pass through if
    present; otherwise fall back to computing from a raw rating/delisted flag
    for any caller that only provides those.
    Expected fallback raw: {"rating": float 1-5, "app_delisted": bool}
    """
    if not raw:
        return None
    if raw.get("distress_score") is not None:
        return round(float(raw["distress_score"]), 2)
    if raw.get("app_delisted"):
        return 100.0
    if raw.get("rating") is None:
        return None
    rating = float(raw["rating"])
    base = (5 - rating) / 4 * 100  # 5.0 -> 0, 1.0 -> 100
    trend = raw.get("review_count_trend")
    if trend is not None:
        base += max(-15, min(15, -float(trend) / 2))
    return round(max(0, min(100, base)), 2)


def normalize_headcount(raw: dict) -> float | None:
    """
    scraper_linkedin.py outputs distress_score directly. Pass through if
    present; otherwise fall back to computing from pct_change.
    Expected fallback raw: {"pct_change": float}  e.g. -0.42 = headcount fell 42%.
    This is the Byju's narrative-anchor signal — do not leave unweighted (tasklist 2.4/13.6).
    """
    if not raw:
        return None
    if raw.get("distress_score") is not None:
        return round(float(raw["distress_score"]), 2)
    if raw.get("pct_change") is None:
        return None
    pct = float(raw["pct_change"]) * 100
    distress = 20 - (pct * 1.6)  # flat headcount -> mild baseline 20; -50% -> ~100
    return round(max(0, min(100, distress)), 2)


def normalize_mca(raw: dict) -> float | None:
    """
    scraper_mca.py outputs distress_score directly. Pass through if present;
    otherwise fall back to a status-text mapping.
    Expected fallback raw: {"status": "current" | "overdue" | "under_liquidation" | "struck_off"}
    """
    if not raw:
        return None
    if raw.get("distress_score") is not None:
        return round(float(raw["distress_score"]), 2)
    if "status" not in raw:
        return None
    status = raw["status"].strip().lower()
    mapping = {"current": 5, "overdue": 45, "under_liquidation": 90, "struck_off": 100}
    return float(mapping.get(status, 50))


NORMALIZERS = {
    "news": normalize_news,
    "jobs": normalize_jobs,
    "gstin": normalize_gstin,
    "appstore": normalize_appstore,
    "linkedin": normalize_headcount,  # headcount signal, keyed to match schema.sql signal_type
    "mca": normalize_mca,
}
