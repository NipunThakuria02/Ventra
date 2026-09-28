import requests
import feedparser
import re
import json
from datetime import datetime, timezone
from urllib.parse import quote


# ============================================================
# CONFIGURATION
# ============================================================

COMPANIES = {
    "Byju's": "Byju's",
    "GoMechanic": "GoMechanic",
    "Zeta": "Zeta",
    "Razorpay": "Razorpay",
    "Zepto": "Zepto",
    "Groww": "Groww"
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/151.0.0.0 Safari/537.36"
    )
}

HIRING_KEYWORDS = [
    "hiring", "hire", "hires", "hired", "recruit", "recruits", "recruiting",
    "recruitment", "job opening", "job openings", "jobs", "talent", "workforce",
    "expands team", "expanding team", "joins team", "new hires", "senior hires",
    "appointed", "appointment"
]

LAYOFF_KEYWORDS = [
    "layoff", "layoffs", "laid off", "job cuts", "job cut", "cuts jobs",
    "cut jobs", "workforce reduction", "workforce reductions", "downsizing",
    "downsized", "fired", "termination", "terminations", "restructuring",
    "restructure", "employees let go", "staff reduction", "staff reductions"
]

IRRELEVANT_KEYWORDS = [
    "interview", "how to", "salary guide", "resume", "cv", "career tips",
    "job interview", "job search tips", "stock", "share price", "mutual fund",
    "fund manager", "scholarship", "course", "courses", "training"
]


# ============================================================
# GOOGLE NEWS RSS
# ============================================================

def google_news_search(company):
    search_query = f'"{company}" (hiring OR hires OR recruitment OR layoffs OR "job cuts") India'
    encoded_query = quote(search_query)
    url = (
        "https://news.google.com/rss/search?"
        f"q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"
    )

    print("\n" + "=" * 70)
    print("SEARCHING FOR:", search_query)
    print("=" * 70)

    try:
        response = requests.get(url, headers=HEADERS, timeout=20)
        print("STATUS:", response.status_code)

        if response.status_code != 200:
            print("ERROR:", response.text[:500])
            return []

        feed = feedparser.parse(response.content)
        articles = []

        for entry in feed.entries:
            articles.append({
                "title": entry.get("title", "").strip(),
                "url": entry.get("link", "").strip(),
                "date": entry.get("published", "").strip(),
                "summary": entry.get("summary", "").strip()
            })

        print("RAW RESULTS:", len(articles))
        return articles

    except Exception as e:
        print("REQUEST ERROR:", str(e))
        return []


# ============================================================
# CLASSIFY ARTICLE
# ============================================================

def classify_article(title, summary, company):
    text = (title + " " + summary).lower()
    company_lower = company.lower()

    if company_lower not in text:
        return "IRRELEVANT"

    for keyword in IRRELEVANT_KEYWORDS:
        if keyword in text:
            if keyword in [
                "interview", "how to", "salary guide", "resume", "cv",
                "career tips", "job interview", "job search tips",
                "scholarship", "course", "courses", "training"
            ]:
                return "IRRELEVANT"

    layoff_matches = sum(1 for k in LAYOFF_KEYWORDS if k in text)
    if layoff_matches > 0:
        return "LAYOFF"

    hiring_matches = sum(1 for k in HIRING_KEYWORDS if k in text)
    if hiring_matches > 0:
        return "HIRING"

    return "NEUTRAL"


# ============================================================
# DATE PARSING
# ============================================================

def parse_date(date_string):
    if not date_string:
        return None
    try:
        parsed = feedparser._parse_date(date_string)
        if parsed:
            return datetime(
                parsed.tm_year, parsed.tm_mon, parsed.tm_mday,
                parsed.tm_hour, parsed.tm_min, parsed.tm_sec,
                tzinfo=timezone.utc
            )
    except Exception:
        pass
    return None


# ============================================================
# ARTICLE WEIGHT
# ============================================================

def calculate_weight(date_string):
    dt = parse_date(date_string)
    if dt is None:
        return 0.5

    now = datetime.now(timezone.utc)
    days_old = (now - dt).days

    if days_old <= 30:
        return 1.0
    elif days_old <= 90:
        return 0.8
    elif days_old <= 180:
        return 0.6
    elif days_old <= 365:
        return 0.4
    else:
        return 0.2


# ============================================================
# REMOVE DUPLICATES
# ============================================================

def remove_duplicates(articles):
    unique = []
    seen = set()
    for article in articles:
        title = re.sub(r"\s+", " ", article.get("title", "").strip().lower())
        if not title or title in seen:
            continue
        seen.add(title)
        unique.append(article)
    return unique


# ============================================================
# CALCULATE JOB ACTIVITY SCORE
# ============================================================

def calculate_job_score(hiring_articles, layoff_articles, neutral_articles):
    hiring_signal = sum(a.get("weight", 1.0) for a in hiring_articles)
    layoff_signal = sum(a.get("weight", 1.0) for a in layoff_articles)
    net_signal = hiring_signal - layoff_signal

    score = 50 + (net_signal * 3)
    score = max(0, min(100, score))

    if score >= 75:
        level = "STRONG HIRING"
    elif score >= 60:
        level = "MODERATE HIRING"
    elif score > 40:
        level = "STABLE"
    elif score > 25:
        level = "MODERATE LAYOFF"
    else:
        level = "STRONG LAYOFF"

    return hiring_signal, layoff_signal, net_signal, score, level


# ============================================================
# PROCESS COMPANY
# ============================================================

def process_company(company):
    raw_articles = google_news_search(company)

    if not raw_articles:
        print("\nNO RESULTS FOUND.")
        return {
            "company": company, "signal": "job_activity", "raw_results": 0,
            "relevant_articles": 0, "hiring_count": 0, "layoff_count": 0,
            "neutral_count": 0, "hiring_signal": 0.0, "layoff_signal": 0.0,
            "net_signal": 0.0, "job_activity_score": 50.0,
            "activity_level": "NO DATA", "articles": []
        }

    raw_articles = remove_duplicates(raw_articles)

    hiring_articles, layoff_articles, neutral_articles, all_relevant = [], [], [], []

    for article in raw_articles:
        title = article.get("title", "")
        summary = article.get("summary", "")
        classification = classify_article(title, summary, company)

        if classification == "IRRELEVANT":
            continue

        weight = calculate_weight(article.get("date", ""))
        article_data = {
            "title": title, "date": article.get("date", ""),
            "url": article.get("url", ""), "summary": summary,
            "classification": classification, "weight": weight
        }
        all_relevant.append(article_data)

        if classification == "HIRING":
            hiring_articles.append(article_data)
        elif classification == "LAYOFF":
            layoff_articles.append(article_data)
        else:
            neutral_articles.append(article_data)

    hiring_signal, layoff_signal, net_signal, score, level = calculate_job_score(
        hiring_articles, layoff_articles, neutral_articles
    )

    print("\n## FILTERED RESULTS")
    print("RELEVANT ARTICLES:", len(all_relevant))
    print("HIRING ARTICLES:", len(hiring_articles))
    print("LAYOFF ARTICLES:", len(layoff_articles))
    print("NEUTRAL ARTICLES:", len(neutral_articles))
    print("\nHIRING SIGNAL:", round(hiring_signal, 2))
    print("LAYOFF SIGNAL:", round(layoff_signal, 2))
    print("NET SIGNAL:", round(net_signal, 2))
    print("JOB ACTIVITY SCORE:", round(score, 2))
    print("ACTIVITY LEVEL:", level)

    print("\n## IMPORTANT ARTICLES")
    for article in all_relevant[:10]:
        print("\n[{}] {}".format(article["classification"], article["date"]))
        print(article["title"])
        print("Weight:", round(article["weight"], 2))

    return {
        "company": company, "signal": "job_activity",
        "raw_results": len(raw_articles), "relevant_articles": len(all_relevant),
        "hiring_count": len(hiring_articles), "layoff_count": len(layoff_articles),
        "neutral_count": len(neutral_articles),
        "hiring_signal": round(hiring_signal, 2),
        "layoff_signal": round(layoff_signal, 2),
        "net_signal": round(net_signal, 2),
        "job_activity_score": round(score, 2),
        "activity_level": level, "articles": all_relevant
    }


# ============================================================
# MAIN
# ============================================================

def main():
    results = []
    for company in COMPANIES:
        results.append(process_company(company))

    print("\n\n" + "=" * 70)
    print("FINAL JOB ACTIVITY SUMMARY")
    print("=" * 70)
    print("{:<15} {:<10} {:<10} {:<10} {:<10} {}".format(
        "COMPANY", "HIRING", "LAYOFF", "NET", "SCORE", "LEVEL"
    ))
    print("-" * 70)

    for result in results:
        print("{:<15} {:<10} {:<10} {:<10.2f} {:<10.2f} {}".format(
            result["company"], result["hiring_count"], result["layoff_count"],
            result["net_signal"], result["job_activity_score"], result["activity_level"]
        ))

    output_file = "jobs_results.json"
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
        print("\nJobs data saved to:", output_file)
    except Exception as e:
        print("\nJSON SAVE ERROR:", str(e))


if __name__ == "__main__":
    main()
