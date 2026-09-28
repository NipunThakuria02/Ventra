"""
scorer.py — MLE1, Task 3.2

Composite distress score = weighted average of available normalized signal scores (0-100).
Missing signals are excluded and remaining weights are renormalized, so this runs
end-to-end even before all 6 scrapers exist (only 2/6 exist right now — see normalizer.py).
"""

from normalizer import NORMALIZERS

# Headcount is the narrative anchor for the Byju's story (tasklist section 2 priority
# note), so it carries the most weight. Tune these per task 3.3 once real data comes in.
DEFAULT_WEIGHTS = {
    "linkedin": 0.25,  # headcount
    "news":     0.20,
    "mca":      0.15,
    "gstin":    0.15,
    "jobs":     0.15,
    "appstore": 0.10,
}


def compute_composite_score(raw_signals: dict, weights: dict = None) -> dict:
    """
    raw_signals: {signal_type: raw_dict_from_scraper}. Any subset of the 6 keys is fine.
    Returns {"composite_score": float|None, "used_signals": {...}, "missing_signals": [...]}
    """
    weights = weights or DEFAULT_WEIGHTS

    normalized = {}
    for signal_type, raw in raw_signals.items():
        fn = NORMALIZERS.get(signal_type)
        if fn is None:
            continue
        score = fn(raw)
        if score is not None:
            normalized[signal_type] = score

    if not normalized:
        return {"composite_score": None, "used_signals": {}, "missing_signals": list(weights.keys())}

    available_weight = sum(weights[s] for s in normalized if s in weights)
    if available_weight == 0:
        return {"composite_score": None, "used_signals": normalized, "missing_signals": []}

    composite = sum(
        normalized[s] * (weights[s] / available_weight)
        for s in normalized if s in weights
    )
    missing = [s for s in weights if s not in normalized]

    return {
        "composite_score": round(composite, 2),
        "used_signals": normalized,
        "missing_signals": missing,
    }


def score_status(score: float | None) -> str:
    if score is None:
        return "unknown"
    if score >= 75:
        return "critical"
    if score >= 55:
        return "red"
    if score >= 35:
        return "amber"
    return "green"


if __name__ == "__main__":
    # Smoke test using the Razorpay example numbers already in Checkpoint.txt
    sample = {
        "news": {"distress_score": 25.30},
        "jobs": {"job_activity_score": 69.71},
    }
    result = compute_composite_score(sample)
    print(result, "->", score_status(result["composite_score"]))
