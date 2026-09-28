import json
from datetime import datetime, timezone


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_FILE = "appstore_results.json"


# ============================================================
# APP STORE DATA
# ============================================================
#
# ENTER THE VERIFIED PLAY STORE / APP STORE RATING FOR EACH COMPANY.
#
# rating: float 1.0-5.0, or None if the app has been delisted entirely.
# app_delisted: True if the app was pulled from the store — this is a
#   stronger distress signal than any live rating, and overrides "rating".
#
# ============================================================

COMPANIES = {

    "Byju's": {
        # VERIFIED: delisted from Google Play Store, May 2025, over unpaid AWS bills
        "rating": None,
        "app_delisted": True
    },

    "GoMechanic": {
        "rating": 3.4,
        "app_delisted": False
    },

    "Zeta": {
        "rating": 3.8,
        "app_delisted": False
    },

    "Razorpay": {
        "rating": 4.3,
        "app_delisted": False
    },

    "Zepto": {
        "rating": 4.4,
        "app_delisted": False
    },

    "Groww": {
        "rating": 4.5,
        "app_delisted": False
    }

}


# ============================================================
# RATING → DISTRESS SCORE
# ============================================================

def get_distress_score(rating, app_delisted):

    if app_delisted:
        return 100.0

    if rating is None:
        return 30.0  # unknown -> neutral-ish, matches gstin's "Unknown" convention

    rating = float(rating)
    score = (5 - rating) / 4 * 100  # 5.0 -> 0, 1.0 -> 100
    return round(max(0, min(100, score)), 2)


# ============================================================
# PROCESS COMPANY
# ============================================================

def process_company(company_name, company_data):

    rating = company_data.get("rating")
    app_delisted = company_data.get("app_delisted", False)
    distress_score = get_distress_score(rating, app_delisted)

    print("\n========================================")
    print("COMPANY:", company_name)
    print("RATING:", rating if rating is not None else "N/A (delisted)" if app_delisted else "NOT PROVIDED")
    print("APP DELISTED:", app_delisted)
    print("DISTRESS SCORE:", distress_score)
    print("========================================")

    return {
        "company": company_name,
        "signal": "appstore",
        "rating": rating,
        "app_delisted": app_delisted,
        "distress_score": distress_score,
        "source": "Play Store / App Store - Manual Input",
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
    print("FINAL APP STORE SUMMARY")
    print("=" * 70)
    print(f"{'COMPANY':<15}{'RATING':<12}{'DELISTED':<12}{'SCORE':<10}")
    print("-" * 70)

    for result in results:
        rating_display = result["rating"] if result["rating"] is not None else "N/A"
        print(f"{result['company']:<15}{str(rating_display):<12}{str(result['app_delisted']):<12}{result['distress_score']:<10}")

    output = {
        "signal": "appstore",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "companies": results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=4, ensure_ascii=False)

    print()
    print("App store data saved to:", OUTPUT_FILE)
