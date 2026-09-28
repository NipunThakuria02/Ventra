"""
byju_retrospective.py — MLE1, Task 3.4

Target composite scores (from MASTER_TASKLIST.md 3.4): ~28 (Jan 2022), ~61 (Jun 2023), ~84 (Oct 2023)

⚠️ IMPORTANT: The headcount, GSTIN, and MCA scrapers do not exist yet (Checkpoint.txt
section 18 lists all three as "Later"). The HISTORICAL_RAW_SIGNALS below are PLACEHOLDER
estimates based on Byju's publicly-known distress timeline (mass 2023 layoffs, auditor
resignation, MCA/GST scrutiny, falling app ratings) — NOT live-scraped data. This exists
so the scoring pipeline and chart (WD's ScoreTrendChart.tsx) can be built and demoed
today. The moment MLE2/PR have real historical values (from Wayback snapshots, news
archives, or manual lookup per the tasklist's fallback plan), swap them in here —
nothing else in the pipeline needs to change.
"""

from scorer import compute_composite_score, score_status

HISTORICAL_RAW_SIGNALS = {
    "Jan 2022": {
        "linkedin": {"pct_change": -0.03},   # slight softening starting, pre-crisis
        "news":     {"distress_score": 40},
        "gstin":    {"status": "active"},
        "mca":      {"status": "current"},
        "jobs":     {"job_activity_score": 42},
        "appstore": {"rating": 3.7},
    },
    "Jun 2023": {
        "linkedin": {"pct_change": -0.30},   # first big layoff round public
        "news":     {"distress_score": 66},
        "gstin":    {"status": "suspended"},
        "mca":      {"status": "overdue"},
        "jobs":     {"job_activity_score": 25},
        "appstore": {"rating": 3.3},
    },
    "Oct 2023": {
        "linkedin": {"pct_change": -0.55},   # deep cuts, leadership exodus
        "news":     {"distress_score": 82},
        "gstin":    {"status": "suspended"},
        "mca":      {"status": "under_liquidation"},
        "jobs":     {"job_activity_score": 15},
        "appstore": {"rating": 2.8},
    },
}

TARGETS = {"Jan 2022": 28, "Jun 2023": 61, "Oct 2023": 84}


def run():
    print(f"{'Date':<12}{'Composite':<12}{'Status':<10}{'Target':<8}{'Delta'}")
    print("-" * 55)
    for date, raw_signals in HISTORICAL_RAW_SIGNALS.items():
        result = compute_composite_score(raw_signals)
        score = result["composite_score"]
        status = score_status(score)
        target = TARGETS[date]
        delta = round(score - target, 1)
        print(f"{date:<12}{score:<12}{status:<10}{target:<8}{delta:+}")


if __name__ == "__main__":
    run()
