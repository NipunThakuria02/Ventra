-- schema.sql
-- Venture Debt Early Warning System
-- PROPOSED by MLE1 — MLE2 has not shared a locked schema yet (see Checkpoint.txt,
-- section 18: "Database" is still under "Later"). Task 1.1 belongs to MLE2; send this
-- to them to confirm/lock column names TODAY per the tasklist's Day 1 checkpoint.
-- Mirrors the fallback Google Sheet columns: Company | Signal | Raw Value | Normalized Score | Date

CREATE TABLE IF NOT EXISTS companies (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('distressed', 'healthy'))
);

CREATE TABLE IF NOT EXISTS raw_signals (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id        INTEGER NOT NULL REFERENCES companies(id),
    signal_type       TEXT NOT NULL CHECK (
                            signal_type IN ('news', 'jobs', 'gstin', 'appstore', 'linkedin', 'mca')
                        ),
    raw_value         REAL,               -- single headline number if there is one (e.g. rating, pct_change)
    raw_json          TEXT,               -- full raw scraper output, JSON-encoded
    normalized_score  REAL,               -- 0-100 distress score, filled in by normalizer.py
    source            TEXT,               -- descriptive provenance string (e.g. "NewsAPI + VADER")
    data_mode         TEXT NOT NULL CHECK (data_mode IN ('live', 'manual', 'estimated')),
    is_retrospective  INTEGER DEFAULT 0 CHECK (is_retrospective IN (0, 1)),
    collected_at      TEXT NOT NULL,      -- ISO date (YYYY-MM-DD) or timestamp
    created_at        TEXT DEFAULT (datetime('now'))
);


CREATE TABLE IF NOT EXISTS score_history (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id       INTEGER NOT NULL REFERENCES companies(id),
    score            REAL NOT NULL,
    status           TEXT NOT NULL,
    is_retrospective INTEGER DEFAULT 0 CHECK (is_retrospective IN (0, 1)),
    calculated_at    TEXT NOT NULL,
    created_at       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_raw_signals_company ON raw_signals(company_id);
CREATE INDEX IF NOT EXISTS idx_raw_signals_type_date ON raw_signals(signal_type, collected_at);
CREATE INDEX IF NOT EXISTS idx_score_history_company ON score_history(company_id);

-- Seed data for the 6 locked demo companies
INSERT OR IGNORE INTO companies (name, category) VALUES
    ('Byju''s',     'distressed'),
    ('GoMechanic',  'distressed'),
    ('Zeta',        'distressed'),
    ('Razorpay',    'healthy'),
    ('Zepto',       'healthy'),
    ('Groww',       'healthy');

