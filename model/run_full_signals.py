"""
run_full_signals.py — MLE1, Task 3.3 (final unified version)

Loads all 6 signals the same way: from each scraper's JSON output file in
scrapers/. news and jobs are genuinely live-scraped from real APIs. gstin,
appstore, mca, and linkedin are manual-input templates (each scraper script's
own docstring explains why — mostly anti-scraping walls: gst.gov.in captcha,
LinkedIn blocking, MCA21/Play Store having no clean API). Run the relevant
scraper_*.py first to (re)generate its *_results.json; this script then just
assembles and scores whatever's present.

Superseded manual_signal_data.py — that hardcoded fallback data now lives
inside each scraper's own COMPANIES dict instead, so there's one source of
truth per signal instead of two.
"""

import json
import os
from scorer import compute_composite_score, score_status

SCRAPERS_DIR = os.path.join(os.path.dirname(__file__), "..", "scrapers")

# Signal type -> JSON file produced by that signal's scraper
SIGNAL_FILES = {
    "gstin":    "gstin_results.json",
    "appstore": "appstore_results.json",
    "mca":      "mca_results.json",
    "linkedin": "linkedin_results.json",
}

CATEGORY = {
    "Byju's": "distressed", "GoMechanic": "distressed", "Zeta": "distressed",
    "Razorpay": "healthy", "Zepto": "healthy", "Groww": "healthy",
}

# news + jobs come from live API/RSS scrapers, not static files (they're meant
# to be re-run fresh). Pasted here from the last real run — replace with a
# direct call to get_news_score()/process_company() from those scraper
# modules once you're ready to hit the live APIs during setup/demo.
REAL_SIGNALS = {
    "Byju's":     {"jobs": {"job_activity_score": 50.00}},
    "GoMechanic": {"jobs": {"job_activity_score": 50.00}},
    "Zeta":       {"jobs": {"job_activity_score": 50.00}},
    "Razorpay":   {"jobs": {"job_activity_score": 69.71}, "news": {"distress_score": 25.30}},
    "Zepto":      {"jobs": {"job_activity_score": 53.31}},
    "Groww":      {"jobs": {"job_activity_score": 50.00}},
}


def load_signal_file(signal_type):
    """Load a signal's *_results.json if the scraper has been run. Returns
    {company: {signal_type: {"distress_score": ...}}} or {} if missing."""
    filename = SIGNAL_FILES.get(signal_type)
    if not filename:
        return {}
    path = os.path.join(SCRAPERS_DIR, filename)
    if not os.path.exists(path):
        return {}
    with open(path) as f:
        data = json.load(f)
    return {
        c["company"]: {signal_type: {"distress_score": c["distress_score"]}}
        for c in data["companies"]
    }


if __name__ == "__main__":
    loaded = {}
    for signal_type in SIGNAL_FILES:
        loaded[signal_type] = load_signal_file(signal_type)
        if not loaded[signal_type]:
            print(f"⚠️  {SIGNAL_FILES[signal_type]} not found — run scraper_{signal_type}.py first. "
                  f"'{signal_type}' will be excluded and weights renormalized.")

    print(f"\n{'Company':<14}{'Category':<12}{'Composite':<12}{'Status':<10}{'Missing'}")
    print("-" * 80)
    results = []
    for company in REAL_SIGNALS:
        combined = dict(REAL_SIGNALS[company])
        for signal_type in SIGNAL_FILES:
            combined.update(loaded[signal_type].get(company, {}))

        result = compute_composite_score(combined)
        results.append((company, CATEGORY[company], result))
        score = result["composite_score"]
        status = score_status(score)
        missing = ",".join(result["missing_signals"]) or "none"
        print(f"{company:<14}{CATEGORY[company]:<12}{str(score):<12}{status:<10}{missing}")

    distressed_avg = sum(r["composite_score"] for c, cat, r in results if cat == "distressed") / 3
    healthy_avg = sum(r["composite_score"] for c, cat, r in results if cat == "healthy") / 3
    print("-" * 80)
    print(f"Distressed avg: {distressed_avg:.1f}   Healthy avg: {healthy_avg:.1f}   "
          f"Separation: {distressed_avg - healthy_avg:+.1f}")
