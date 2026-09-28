# Ventra - Venture Debt Early Warning System

A full-stack alternative data intelligence platform that monitors Indian venture-debt-backed startups for early financial distress signals, surfacing risk weeks to months before traditional quarterly reporting would catch it.


---

## The Problem

Venture debt funds in India (InnoVen, Trifecta, Alteria, BlackSoil) manage portfolios crossing Rs. 8,000 crore. They monitor portfolio companies through self-reported quarterly PDFs and annual CA-certified financials. By the time a distress signal appears in those channels, the window to act has already closed.

| What exists today | What the problem is |
|---|---|
| Quarterly PDF reports from founders | Self-reported, cherry-picked, 3 months delayed |
| Annual CA-certified financials | Looks backward, not forward |
| Traditional credit scores (CIBIL) | Useless for startups - no collateral, no history |

---

## Solution - Six Signal Architecture

All six signals are derived from publicly available data. No proprietary data access required.

| Signal | Weight | Data Source | What it detects |
|---|---|---|---|
| LinkedIn Headcount Change | 25% | LinkedIn public pages | Layoffs, hiring freezes |
| News Sentiment | 20% | NewsAPI + Google News RSS | Negative press, regulatory mentions |
| GSTIN Status | 15% | gst.gov.in | GST suspension or cancellation |
| MCA Filing Status | 15% | Zauba Corp / MCA21 | Delayed filings, director resignations |
| Job Posting Activity | 15% | Google News RSS | Hiring freeze or distress-mode pivots |
| App Store Health | 10% | Google Play Store | Product quality deterioration |

### Composite Distress Score (0-100)

```
Score = (0.25 x Headcount) + (0.20 x News Sentiment) + (0.15 x GSTIN)
      + (0.15 x MCA Filing) + (0.15 x Job Activity) + (0.10 x App Store)
```

| Score Range | Status | Action |
|---|---|---|
| 0-34 | Green | Normal monitoring |
| 35-54 | Amber | Flag for fund manager review |
| 55-74 | Red | Consider covenant check |
| 75-100 | Critical | Immediate engagement required |

---

## Retrospective Validation

The scoring model was backtested against Byju's publicly documented collapse trajectory:

| Date | Composite Score | Status | Context |
|---|---|---|---|
| Jan 2022 | 28 | Green | Pre-crisis baseline |
| Jun 2023 | 61 | Red | First major layoff round, GST scrutiny begins |
| Oct 2023 | 84 | Critical | NCLT proceedings, leadership exodus |

The model reaches red-zone threshold in June 2023, approximately 3-4 months before full public acknowledgement of the collapse in Q4 2023.

GoMechanic backtested similarly - amber-to-red in November 2022, two months before the accounting irregularities became public in January 2023.

Note: these are retrospective simulations using publicly known historical data points, not live predictions from that period.

---

## Tech Stack

**Backend**
- Python 3.11
- FastAPI with 8 REST endpoints
- Pydantic for request/response validation
- Uvicorn ASGI server
- SQLite database with schema for companies, raw signals, score history, and retrospective flags

**Frontend**
- React 18 with TypeScript
- Vite build tool
- Tailwind CSS
- Recharts for score trend visualization
- Lucide React for icons

**Data Pipeline**
- 6 independent Python scraping modules, one per signal
- VADER sentiment analysis for news scoring
- feedparser for Google News RSS
- requests + BeautifulSoup4 for HTML parsing
- Per-signal normalizer functions converting raw output to uniform 0-100 distress scale
- Last-known-value fallback on scraper failure

---

## Architecture

```
Public Data Sources
  (LinkedIn, Google News RSS, gst.gov.in, Zauba Corp, Play Store, NewsAPI)
        |
        v
Six Python Scrapers  (scrapers/)
        |
        v
Signal Normalizers   (model/normalizer.py)
        |
        v
Composite Scorer     (model/scorer.py)
        |
        v
SQLite Database      (db/)
        |
        v
FastAPI REST API     (backend/)
        |
        v
React Dashboard      (frontend/)
```

---

## Project Structure

```
ventra/
  backend/
    main.py                 FastAPI app - 8 endpoints
    database.py             SQLite query layer
    schemas.py              Pydantic request/response models
    services/
      model_adapter.py      Bridges FastAPI to ML pipeline
      refresh_service.py    Live scraper refresh with fallback logic
  db/
    schema.sql              Database schema
    db_init.py              Seeds database from scraper outputs
  frontend/
    src/
      pages/                Dashboard, CompanyDetail, Alerts, Home
      components/           PortfolioTable, ScoreTrendChart, SignalCard, etc.
      services/api.ts       FastAPI client
      types/                TypeScript type definitions
  model/
    normalizer.py           Raw signal to 0-100 distress score converters
    scorer.py               Weighted composite score calculation
    run_full_signals.py     Runs full 6-signal scoring pipeline
    byju_retrospective.py   Historical backtesting script
  scrapers/
    scraper_news.py         NewsAPI + VADER sentiment (live)
    scraper_jobs.py         Google News RSS hiring classifier (live)
    scraper_gstin.py        GST status lookup
    scraper_linkedin.py     LinkedIn headcount change
    scraper_mca.py          MCA filing status
    scraper_appstore.py     App store rating
  requirements.txt
  .env.example
```

---

## Setup and Running

**Prerequisites**
- Python 3.11+
- Node.js 18+
- A free NewsAPI key from newsapi.org

**Backend**

```bash
# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your NEWSAPI_KEY

# Seed the database (uses pre-run scraper outputs)
python db/db_init.py

# Start the API server
uvicorn backend.main:app --port 8000 --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173  
API runs at http://127.0.0.1:8000  
API docs (Swagger) at http://127.0.0.1:8000/docs

**Regenerating signal data**

```bash
cd scrapers

# Live scrapers (require network access)
python scraper_news.py       # requires NEWSAPI_KEY in .env
python scraper_jobs.py       # no key needed, uses Google News RSS

# Manual input scrapers (no network needed, uses hardcoded estimates)
python scraper_gstin.py
python scraper_appstore.py
python scraper_mca.py
python scraper_linkedin.py

# Re-seed the database with updated signals
cd ..
python db/db_init.py
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Database and model health check |
| GET | /portfolio | All portfolio companies with latest scores and status |
| GET | /portfolio/summary | Aggregate risk metrics across portfolio |
| GET | /company/{id} | Company detail with score, change, and data coverage |
| GET | /company/{id}/signals | All 6 signals with normalized scores and evidence |
| GET | /company/{id}/history | Score history for trend chart |
| GET | /alerts | Active alerts sorted by severity |
| POST | /refresh | Trigger live scraper refresh across all companies |

---

## Scraper Status

| Signal | Status | Notes |
|---|---|---|
| News sentiment | Live | Requires NEWSAPI_KEY |
| Job activity | Live | Uses Google News RSS, no key needed |
| GSTIN status | Manual estimates | gst.gov.in blocks automated lookup with captcha |
| App store health | Manual estimates | Byju's delisting is a verified fact; others are estimates |
| MCA filing status | Manual estimates | Based on public reporting (Byju's NCLT proceedings are real) |
| LinkedIn headcount | Manual estimates | LinkedIn actively blocks scraping |

---

## Business Context

**Target customers:** Venture debt funds, not startups.

**Unit economics:** One prevented default on a Rs. 5 crore loan pays for over 16 years of a mid-tier subscription. The ROI conversation is straightforward.

**Regulatory position:** All data used is publicly available. No non-public information, no SEBI-regulated activity. The distress score is an analytical output, not a credit rating.

**TAM:** Approximately 50 active venture debt funds in India, plus 200 family offices doing structured lending to startups.

---

## Limitations

- GSTIN, MCA, LinkedIn, and App Store signals currently use manually entered estimates for demo companies. Only news and job signals pull live data.
- The retrospective backtesting uses placeholder historical values based on publicly known events, not live-scraped historical data.
- SQLite is used for the demo. A production deployment would use PostgreSQL.
- The scoring weights are fixed. A production system would tune them using labeled historical default data.
