import type {
  PortfolioCompany,
  PortfolioSummary,
  SignalDetail,
  ScoreHistoryPoint,
  AlertItem
} from '../types';

export const FALLBACK_PORTFOLIO: PortfolioCompany[] = [
  {
    id: 1,
    name: "Byju's",
    category: "distressed",
    score: 85.94,
    status: "critical",
    previous_score: null,
    score_change: null,
    signal_count: 6,
    top_signal: "LinkedIn Headcount",
    data_coverage: { live: 1, manual: 4, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 2,
    name: "GoMechanic",
    category: "distressed",
    score: 44.06,
    status: "amber",
    previous_score: null,
    score_change: null,
    signal_count: 5,
    top_signal: "LinkedIn Headcount",
    data_coverage: { live: 1, manual: 3, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 3,
    name: "Zeta",
    category: "distressed",
    score: 32.81,
    status: "green",
    previous_score: null,
    score_change: null,
    signal_count: 5,
    top_signal: "LinkedIn Headcount",
    data_coverage: { live: 1, manual: 3, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 4,
    name: "Razorpay",
    category: "healthy",
    score: 13.9,
    status: "green",
    previous_score: null,
    score_change: null,
    signal_count: 6,
    top_signal: "News Sentiment",
    data_coverage: { live: 2, manual: 3, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 5,
    name: "Zepto",
    category: "healthy",
    score: 11.57,
    status: "green",
    previous_score: null,
    score_change: null,
    signal_count: 5,
    top_signal: "Hiring Activity",
    data_coverage: { live: 1, manual: 3, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 6,
    name: "Groww",
    category: "healthy",
    score: 13.12,
    status: "green",
    previous_score: null,
    score_change: null,
    signal_count: 5,
    top_signal: "Hiring Activity",
    data_coverage: { live: 1, manual: 3, estimated: 1 },
    last_updated: "2026-08-12T16:44:00Z"
  }
];

export const FALLBACK_SUMMARY: PortfolioSummary = {
  total_companies: 6,
  green_count: 4,
  amber_count: 1,
  red_count: 0,
  critical_count: 1,
  requires_attention_count: 2,
  average_distress_score: 33.57
};

export const FALLBACK_SIGNALS: Record<number, SignalDetail[]> = {
  1: [
    {
      signal_type: "linkedin",
      display_name: "LinkedIn Headcount",
      raw_value: -0.55,
      normalized_score: 100.0,
      weight: 0.25,
      risk_status: "critical",
      source: "LinkedIn Headcount - Manual/Wayback Input",
      data_mode: "manual",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { pct_change: -0.55, distress_score: 100, note: "55% headcount contraction over 12 months" }
    },
    {
      signal_type: "news",
      display_name: "News Sentiment",
      raw_value: 82.0,
      normalized_score: 82.0,
      weight: 0.20,
      risk_status: "critical",
      source: "News Sentiment Retrospective",
      data_mode: "manual",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { distress_score: 82.0, average_sentiment: -0.64, note: "Auditor resignation & NCLT litigation headlines" }
    },
    {
      signal_type: "mca",
      display_name: "MCA Filing Status",
      raw_value: 90.0,
      normalized_score: 90.0,
      weight: 0.15,
      risk_status: "critical",
      source: "MCA Filing Status - Public Filing Input",
      data_mode: "manual",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { status: "under_liquidation", note: "NCLT insolvency proceedings publicly reported" }
    },
    {
      signal_type: "gstin",
      display_name: "GSTIN Status",
      raw_value: 85.0,
      normalized_score: 85.0,
      weight: 0.15,
      risk_status: "critical",
      source: "GST Portal - Estimated Input",
      data_mode: "manual",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { status: "suspended", note: "Regulatory non-compliance scrutiny" }
    },
    {
      signal_type: "jobs",
      display_name: "Hiring Activity",
      raw_value: 50.0,
      normalized_score: 50.0,
      weight: 0.15,
      risk_status: "amber",
      source: "Google News RSS",
      data_mode: "live",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { job_activity_score: 50.0, activity_level: "STABLE", net_signal: 0.0 }
    },
    {
      signal_type: "appstore",
      display_name: "App Store Health",
      raw_value: 100.0,
      normalized_score: 100.0,
      weight: 0.10,
      risk_status: "critical",
      source: "Google Play Store / App Store Health",
      data_mode: "estimated",
      collected_at: "2026-08-12T16:44:00Z",
      evidence: { app_delisted: true, rating: null, note: "VERIFIED: App delisted from Play Store May 2025" }
    }
  ]
};

export const FALLBACK_HISTORY: Record<number, ScoreHistoryPoint[]> = {
  1: [
    { score: 26.9, status: "green", is_retrospective: true, calculated_at: "2022-01-15T00:00:00Z" },
    { score: 65.2, status: "red", is_retrospective: true, calculated_at: "2023-06-15T00:00:00Z" },
    { score: 85.9, status: "critical", is_retrospective: true, calculated_at: "2023-10-15T00:00:00Z" },
    { score: 85.94, status: "critical", is_retrospective: false, calculated_at: "2026-08-12T16:44:00Z" }
  ]
};

export const FALLBACK_ALERTS: AlertItem[] = [
  {
    id: 1,
    name: "Byju's",
    category: "distressed",
    score: 85.94,
    status: "critical",
    score_change: null,
    top_signals: [
      { signal_type: "linkedin", display_name: "LinkedIn Headcount", normalized_score: 100.0, risk_status: "critical", data_mode: "manual" },
      { signal_type: "mca", display_name: "MCA Filing Status", normalized_score: 90.0, risk_status: "critical", data_mode: "manual" },
      { signal_type: "gstin", display_name: "GSTIN Status", normalized_score: 85.0, risk_status: "critical", data_mode: "manual" }
    ],
    reason: "LinkedIn Headcount elevated distress (100.0/100); MCA Filing Status elevated distress (90.0/100); GSTIN Status elevated distress (85.0/100)",
    last_updated: "2026-08-12T16:44:00Z"
  },
  {
    id: 2,
    name: "GoMechanic",
    category: "distressed",
    score: 44.06,
    status: "amber",
    score_change: null,
    top_signals: [
      { signal_type: "linkedin", display_name: "LinkedIn Headcount", normalized_score: 68.0, risk_status: "red", data_mode: "manual" },
      { signal_type: "mca", display_name: "MCA Filing Status", normalized_score: 45.0, risk_status: "amber", data_mode: "manual" },
      { signal_type: "jobs", display_name: "Hiring Activity", normalized_score: 50.0, risk_status: "amber", data_mode: "live" }
    ],
    reason: "LinkedIn Headcount elevated distress (68.0/100)",
    last_updated: "2026-08-12T16:44:00Z"
  }
];
