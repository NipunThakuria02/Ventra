import json
from datetime import datetime, timezone


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_FILE = "mca_results.json"


# ============================================================
# MCA FILING STATUS DATA
# ============================================================
#
# ENTER THE VERIFIED MCA21 / ZAUBA CORP FILING STATUS FOR EACH COMPANY.
#
# STATUS MUST BE ONE OF:
# Current / Overdue / Under Liquidation / Struck Off / Unknown
#
# ============================================================

COMPANIES = {

    "Byju's": {
        # NCLT insolvency proceedings against Byju's/Think & Learn publicly reported
        "status": "Under Liquidation"
    },

    "GoMechanic": {
        "status": "Overdue"
    },

    "Zeta": {
        "status": "Overdue"
    },

    "Razorpay": {
        "status": "Current"
    },

    "Zepto": {
        "status": "Current"
    },

    "Groww": {
        "status": "Current"
    }

}


# ============================================================
# STATUS → DISTRESS SCORE
# ============================================================

STATUS_SCORES = {
    "Current": 5,
    "Unknown": 30,
    "Overdue": 45,
    "Under Liquidation": 90,
    "Struck Off": 100
}


# ============================================================
# NORMALIZE STATUS
# ============================================================

def normalize_status(status):

    if not status:
        return "Unknown"

    status = str(status).strip().lower()

    if status == "current":
        return "Current"
    if status == "overdue":
        return "Overdue"
    if status in ("under liquidation", "under_liquidation", "liquidation"):
        return "Under Liquidation"
    if status in ("struck off", "struck_off"):
        return "Struck Off"

    return "Unknown"


# ============================================================
# GET DISTRESS SCORE
# ============================================================

def get_distress_score(status):
    return STATUS_SCORES.get(status, STATUS_SCORES["Unknown"])


# ============================================================
# PROCESS COMPANY
# ============================================================

def process_company(company_name, company_data):

    raw_status = company_data.get("status", "Unknown")
    status = normalize_status(raw_status)
    distress_score = get_distress_score(status)

    print("\n========================================")
    print("COMPANY:", company_name)
    print("STATUS:", status)
    print("DISTRESS SCORE:", distress_score)
    print("========================================")

    return {
        "company": company_name,
        "signal": "mca",
        "status": status,
        "distress_score": distress_score,
        "source": "MCA21 / Zauba Corp - Manual Input",
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
    print("FINAL MCA SUMMARY")
    print("=" * 70)
    print(f"{'COMPANY':<15}{'STATUS':<20}{'SCORE':<10}")
    print("-" * 70)

    for result in results:
        print(f"{result['company']:<15}{result['status']:<20}{result['distress_score']:<10}")

    output = {
        "signal": "mca",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "companies": results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=4, ensure_ascii=False)

    print()
    print("MCA data saved to:", OUTPUT_FILE)
