import json
from datetime import datetime, timezone


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_FILE = "linkedin_results.json"


# ============================================================
# HEADCOUNT DATA
# ============================================================
#
# ENTER THE ESTIMATED/VERIFIED HEADCOUNT % CHANGE FOR EACH COMPANY
# (over the lookback window, e.g. -0.42 means headcount fell 42%).
#
# This is the narrative-anchor signal for the Byju's story — LinkedIn
# actively blocks live scraping, so this has to stay manual/Wayback-sourced
# unless a paid data provider is used. See docs/MLE2_CHECKPOINT.md.
#
# ============================================================

COMPANIES = {

    "Byju's": {
        "pct_change": -0.55   # large, publicly reported layoffs through 2023-2024
    },

    "GoMechanic": {
        "pct_change": -0.30   # 2023 layoffs after co-founder admission of inflated data
    },

    "Zeta": {
        "pct_change": -0.10
    },

    "Razorpay": {
        "pct_change": 0.08
    },

    "Zepto": {
        "pct_change": 0.15
    },

    "Groww": {
        "pct_change": 0.10
    }

}


# ============================================================
# PCT CHANGE → DISTRESS SCORE
# ============================================================

def get_distress_score(pct_change):

    pct = float(pct_change) * 100  # e.g. -55.0
    # flat headcount -> mild baseline distress of 20 (flat isn't purely "healthy")
    # -50% or worse -> maxes out near 100
    distress = 20 - (pct * 1.6)
    return round(max(0, min(100, distress)), 2)


# ============================================================
# PROCESS COMPANY
# ============================================================

def process_company(company_name, company_data):

    pct_change = company_data.get("pct_change", 0.0)
    distress_score = get_distress_score(pct_change)

    print("\n========================================")
    print("COMPANY:", company_name)
    print("HEADCOUNT % CHANGE:", f"{pct_change * 100:+.1f}%")
    print("DISTRESS SCORE:", distress_score)
    print("========================================")

    return {
        "company": company_name,
        "signal": "linkedin",
        "pct_change": pct_change,
        "distress_score": distress_score,
        "source": "LinkedIn Headcount - Manual/Wayback Input",
        "checked_at": datetime.now(timezone.utc).isoformat()
    }


# ============================================================
# RUN ALL COMPANIES
# ============================================================

if __name__ == "__main__":
    results = []

    for company_name, company_data in COMPANIES.items():
        results.append(process_company(company_name, company_data))

    print("\n\n" + "=" * 70)
    print("FINAL HEADCOUNT SUMMARY")
    print("=" * 70)
    print(f"{'COMPANY':<15}{'% CHANGE':<12}{'SCORE':<10}")
    print("-" * 70)

    for result in results:
        print(f"{result['company']:<15}{result['pct_change']*100:+.1f}%{'':<6}{result['distress_score']:<10}")

    output = {
        "signal": "linkedin",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "companies": results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=4, ensure_ascii=False)

    print()
    print("Headcount data saved to:", OUTPUT_FILE)
