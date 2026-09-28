"""
backend/services/model_adapter.py

Integration layer connecting the FastAPI backend to the existing Python ML pipeline.
Isolates sys.path manipulation to load untouched model files (`model/scorer.py` and `model/normalizer.py`).
Does NOT modify or duplicate any scoring formulas, normalization, weights, or status thresholds.
Does NOT execute scrapers (scraper execution lives in refresh_service.py).
"""

import sys
import os
from typing import Dict, Any, Optional

# Isolate sys.path manipulation inside model_adapter.py
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "model"))
if MODEL_DIR not in sys.path:
    sys.path.insert(0, MODEL_DIR)

try:
    from normalizer import NORMALIZERS, normalize_news, normalize_jobs, normalize_gstin, normalize_appstore, normalize_headcount, normalize_mca
    from scorer import compute_composite_score, score_status, DEFAULT_WEIGHTS
except ImportError as e:
    raise ImportError(f"Failed to import core model components from '{MODEL_DIR}': {e}")


def get_risk_status(score: Optional[float]) -> str:
    """Returns official risk status string ('green', 'amber', 'red', 'critical', 'unknown') from scorer.py."""
    return score_status(score)


def evaluate_company_signals(raw_signals: Dict[str, Any]) -> Dict[str, Any]:
    """
    Passes raw_signals to untouched core model functions.
    raw_signals shape: {
       "news": {...},
       "jobs": {...},
       "gstin": {...},
       "appstore": {...},
       "linkedin": {...},
       "mca": {...}
    }
    Returns dictionary with:
      - composite_score (float | None)
      - status (str)
      - used_signals (dict of normalized scores)
      - missing_signals (list of signal names)
      - weights (dict)
    """
    result = compute_composite_score(raw_signals)
    score = result.get("composite_score")
    result["status"] = get_risk_status(score)
    result["weights"] = DEFAULT_WEIGHTS
    return result


def is_model_healthy() -> bool:
    """Sanity check verifying that scorer and normalizers can be called cleanly without error."""
    try:
        sample = {
            "news": {"distress_score": 25.0},
            "jobs": {"job_activity_score": 60.0}
        }
        res = compute_composite_score(sample)
        status = score_status(res["composite_score"])
        return res["composite_score"] is not None and status in ["green", "amber", "red", "critical"]
    except Exception:
        return False
