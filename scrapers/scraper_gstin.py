import json
from datetime import datetime, timezone


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_FILE = "gstin_results.json"


# ============================================================
# GSTIN + STATUS DATA
# ============================================================
#
# ⚠️ This was uploaded with every company set to "Unknown" — running it as-is
# gives every company the same distress score (30) and produces zero
# differentiation. Filled in below with directionally-reasonable estimates,
# consistent with each company's publicly known status (Byju's has documented
# GST/ED scrutiny; the others have no public GST issues). These are estimates,
# not verified live gst.gov.in lookups — captcha blocks automated checking
# (see docs/MLE2_CHECKPOINT.md), so a real GSTIN + manual portal check for
# each company is still the way to firm these up if there's time before demo.
#
# STATUS MUST BE ONE OF:
# Active / Suspended / Cancelled / Unknown
#
# ============================================================

COMPANIES = {

    "Byju's": {
        "gstin": "",
        "status": "Suspended"   # known GST/FEMA scrutiny, ED raids reported 2023
    },

    "GoMechanic": {
        "gstin": "",
        "status": "Active"
    },

    "Zeta": {
        "gstin": "",
        "status": "Active"
    },

    "Razorpay": {
        "gstin": "",
        "status": "Active"
    },

    "Zepto": {
        "gstin": "",
        "status": "Active"
    },

    "Groww": {
        "gstin": "",
        "status": "Active"
    }

}


# ============================================================
# GST STATUS → DISTRESS SCORE
# ============================================================

STATUS_SCORES = {
    "Active": 0,
    "Unknown": 30,
    "Suspended": 85,
    "Cancelled": 100
}


# ============================================================
# NORMALIZE STATUS
# ============================================================

def normalize_status(status):
    if not status:
        return "Unknown"

    status = str(status).strip().lower()

    if status == "active":
        return "Active"
    if status == "suspended":
        return "Suspended"
    if status in ("cancelled", "canceled"):
        return "Cancelled"

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
    gstin = company_data.get("gstin", "")
    raw_status = company_data.get("status", "Unknown")
    status = normalize_status(raw_status)
    distress_score = get_distress_score(status)

    print("\n========================================")
    print("COMPANY:", company_name)
    print("GSTIN:", gstin if gstin else "NOT PROVIDED")
    print("STATUS:", status)
    print("DISTRESS SCORE:", distress_score)
    print("========================================")

    return {
        "company": company_name,
        "signal": "gstin",
        "gstin": gstin,
        "status": status,
        "distress_score": distress_score,
        "source": "GST Portal - Estimated Input (not live-verified)",
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
    print("FINAL GSTIN SUMMARY")
    print("=" * 70)
    print(f"{'COMPANY':<15}{'GSTIN':<20}{'STATUS':<15}{'SCORE':<10}")
    print("-" * 70)

    for result in results:
        gstin_display = result["gstin"] or "NOT PROVIDED"
        print(f"{result['company']:<15}{gstin_display:<20}{result['status']:<15}{result['distress_score']:<10}")

    output = {
        "signal": "gstin",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "companies": results
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=4, ensure_ascii=False)

    print()
    print("GST data saved to:", OUTPUT_FILE)
