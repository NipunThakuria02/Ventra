"""
run_current_signals.py — MLE1, Task 3.3

Runs the composite scorer on all 6 demo companies using the ONLY real numbers that
exist right now (pulled straight from Checkpoint.txt, since I don't have DB access
or working API keys in this environment to re-run scraper_news.py / scraper_jobs.py
live). Razorpay has both news + jobs data; the other 5 only have jobs data so far.

⚠️ Do not read too much into these results yet. With only 1-2 of 6 signals live,
"distressed vs healthy" separation (tasklist Day 2 checkpoint) genuinely cannot be
validated until MLE2 ships GSTIN, MCA, headcount, and app-store scrapers. Re-run this
same script against the real database once that data lands — nothing else changes.
"""

from scorer import compute_composite_score, score_status

# Straight from Checkpoint.txt section 11 (Google News hiring/layoff table)
# + section 3 (Razorpay news example)
CURRENT_RAW_SIGNALS = {
    "Byju's":     {"jobs": {"job_activity_score": 50.00}},
    "GoMechanic": {"jobs": {"job_activity_score": 50.00}},
    "Zeta":       {"jobs": {"job_activity_score": 50.00}},
    "Razorpay":   {"jobs": {"job_activity_score": 69.71}, "news": {"distress_score": 25.30}},
    "Zepto":      {"jobs": {"job_activity_score": 53.31}},
    "Groww":      {"jobs": {"job_activity_score": 50.00}},
}

if __name__ == "__main__":
    print(f"{'Company':<14}{'Composite':<12}{'Status':<10}{'Signals used':<20}{'Missing'}")
    print("-" * 90)
    for company, raw_signals in CURRENT_RAW_SIGNALS.items():
        result = compute_composite_score(raw_signals)
        score = result["composite_score"]
        status = score_status(score)
        used = ",".join(result["used_signals"].keys())
        missing = ",".join(result["missing_signals"])
        print(f"{company:<14}{str(score):<12}{status:<10}{used:<20}{missing}")
