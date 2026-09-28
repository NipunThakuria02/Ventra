import os
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from datetime import datetime, timedelta, timezone


# ==========================================
# CONFIGURATION
# ==========================================
# API key was previously hardcoded here — rotate it in the NewsAPI dashboard
# (it was exposed in a shared file) and load it from the environment instead.
# Copy .env.example to .env and fill in NEWSAPI_KEY.

API_KEY = os.environ.get("NEWSAPI_KEY")

if not API_KEY:
    raise RuntimeError(
        "NEWSAPI_KEY not set. Copy .env.example to .env, add your key, and "
        "load it before running (e.g. `export $(cat .env | xargs)` or python-dotenv)."
    )

analyzer = SentimentIntensityAnalyzer()


# ==========================================
# COMPANY SEARCH TERMS
# ==========================================

COMPANIES = {
    "Byju's": "Byju's",
    "GoMechanic": "GoMechanic",
    "Zeta": "Zeta India",
    "Razorpay": "Razorpay",
    "Zepto": "Zepto",
    "Groww": "Groww"
}


# ==========================================
# BLOCKED DOMAINS
# ==========================================

BLOCKED_DOMAINS = [
    "pypi.org",
    "prnewswire.com"
]


# ==========================================
# REMOVE DUPLICATE ARTICLES
# ==========================================

def remove_duplicates(articles):
    unique_articles = []
    seen_titles = set()
    for article in articles:
        title = article["title"].strip().lower()
        if title in seen_titles:
            continue
        seen_titles.add(title)
        unique_articles.append(article)
    return unique_articles


# ==========================================
# NEWS SCRAPER
# ==========================================

def get_news_score(company_name, search_term):
    url = "https://newsapi.org/v2/everything"

    today = datetime.now(timezone.utc)
    thirty_days_ago = today - timedelta(days=30)
    from_date = thirty_days_ago.strftime("%Y-%m-%d")
    to_date = today.strftime("%Y-%m-%d")

    params = {
        "q": f'"{search_term}"',
        "language": "en",
        "pageSize": 20,
        "searchIn": "title,description",
        "from": from_date,
        "to": to_date,
        "sortBy": "publishedAt",
        "apiKey": API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print("NewsAPI Error:", response.status_code)
        print(response.text)
        return None

    data = response.json()
    articles = data.get("articles", [])

    print("\n========================================")
    print("COMPANY:", company_name)
    print("SEARCH TERM:", search_term)
    print("DATE RANGE:", from_date, "TO", to_date)
    print("========================================")

    if len(articles) == 0:
        print("No articles found.")
        return None

    articles_data = []

    for article in articles:
        title = article.get("title", "")
        description = article.get("description", "")
        article_url = article.get("url", "")

        if description is None:
            description = ""

        if search_term.lower() not in title.lower():
            continue

        blocked = False
        for domain in BLOCKED_DOMAINS:
            if domain in article_url.lower():
                blocked = True
                break
        if blocked:
            continue

        text = title + " " + description
        sentiment = analyzer.polarity_scores(text)
        compound_score = sentiment["compound"]

        articles_data.append({
            "title": title,
            "description": description,
            "date": article.get("publishedAt"),
            "url": article_url,
            "sentiment": compound_score
        })

    if len(articles_data) == 0:
        print("\nNo relevant articles found.")
        return None

    articles_data = remove_duplicates(articles_data)

    print("\nAFTER DUPLICATE REMOVAL:")
    print("UNIQUE ARTICLES:", len(articles_data))

    for article in articles_data:
        print("\nTITLE:", article["title"])
        print("COMPOUND:", article["sentiment"])
        print("DATE:", article["date"])
        print("URL:", article["url"])

    scores = [article["sentiment"] for article in articles_data]
    average_sentiment = sum(scores) / len(scores)
    distress_score = (1 - average_sentiment) * 50
    distress_score = max(0, min(100, distress_score))

    print("\n========================================")
    print("RELEVANT ARTICLES:", len(articles_data))
    print("AVERAGE SENTIMENT:", round(average_sentiment, 4))
    print("NEWS DISTRESS SCORE:", round(distress_score, 2))
    print("========================================")

    return {
        "company": company_name,
        "signal": "news",
        "average_sentiment": round(average_sentiment, 4),
        "distress_score": round(distress_score, 2),
        "article_count": len(articles_data),
        "articles": articles_data
    }


# ==========================================
# RUN ALL COMPANIES
# ==========================================

if __name__ == "__main__":
    for company_name, search_term in COMPANIES.items():
        result = get_news_score(company_name, search_term)
        print("\nRESULT:")
        print(result)
