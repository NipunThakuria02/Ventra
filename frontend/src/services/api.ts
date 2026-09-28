import type {
  PortfolioCompany,
  PortfolioSummary,
  CompanyDetailData,
  SignalDetail,
  ScoreHistoryPoint,
  AlertItem,
  RefreshResponse,
  HealthResponse
} from '../types';
import {
  FALLBACK_PORTFOLIO,
  FALLBACK_SUMMARY,
  FALLBACK_SIGNALS,
  FALLBACK_HISTORY,
  FALLBACK_ALERTS
} from './fallbackData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function checkHealth(): Promise<HealthResponse> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/health`, {}, 2000);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // API unavailable
  }
  return { status: 'offline', database: false, model: false };
}

export async function getPortfolio(): Promise<{ data: PortfolioCompany[]; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/portfolio`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  return { data: FALLBACK_PORTFOLIO, isFallback: true };
}

export async function getPortfolioSummary(): Promise<{ data: PortfolioSummary; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/portfolio/summary`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  return { data: FALLBACK_SUMMARY, isFallback: true };
}

export async function getCompanyDetail(id: number): Promise<{ data: CompanyDetailData | null; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/company/${id}`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  const fallbackItem = FALLBACK_PORTFOLIO.find(c => c.id === id);
  if (fallbackItem) {
    const detail: CompanyDetailData = {
      id: fallbackItem.id,
      name: fallbackItem.name,
      category: fallbackItem.category,
      score: fallbackItem.score,
      status: fallbackItem.status,
      previous_score: fallbackItem.previous_score,
      score_change: fallbackItem.score_change,
      last_updated: fallbackItem.last_updated,
      coverage_summary: fallbackItem.data_coverage,
      data_coverage: [
        { signal_type: "linkedin", display_name: "LinkedIn Headcount", data_mode: "manual", source: "LinkedIn Headcount - Manual/Wayback Input" },
        { signal_type: "news", display_name: "News Sentiment", data_mode: "live", source: "NewsAPI + VADER" },
        { signal_type: "mca", display_name: "MCA Filing Status", data_mode: "manual", source: "MCA Filing Status - Public Filing Input" },
        { signal_type: "gstin", display_name: "GSTIN Status", data_mode: "manual", source: "GST Portal - Estimated Input" },
        { signal_type: "jobs", display_name: "Hiring Activity", data_mode: "live", source: "Google News RSS" },
        { signal_type: "appstore", display_name: "App Store Health", data_mode: "estimated", source: "Google Play Store / App Store Health" }
      ]
    };
    return { data: detail, isFallback: true };
  }
  return { data: null, isFallback: true };
}

export async function getCompanySignals(id: number): Promise<{ data: SignalDetail[]; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/company/${id}/signals`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  const fallback = FALLBACK_SIGNALS[id] || FALLBACK_SIGNALS[1];
  return { data: fallback, isFallback: true };
}

export async function getCompanyHistory(id: number): Promise<{ data: ScoreHistoryPoint[]; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/company/${id}/history`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  const fallback = FALLBACK_HISTORY[id] || [
    { score: 85.94, status: "critical", is_retrospective: false, calculated_at: "2026-08-12T16:44:00Z" }
  ];
  return { data: fallback, isFallback: true };
}

export async function getAlerts(): Promise<{ data: AlertItem[]; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/alerts`);
    if (res.ok) {
      const data = await res.json();
      return { data, isFallback: false };
    }
  } catch (e) {
    // API error -> fallback
  }
  return { data: FALLBACK_ALERTS, isFallback: true };
}

export async function triggerRefresh(): Promise<RefreshResponse> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/refresh`, { method: 'POST' }, 15000);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Failed refresh
  }
  return {
    status: 'partial_fallback',
    timestamp: new Date().toISOString(),
    companies_updated: 6,
    errors: ['Backend offline — retained last known demo state'],
    logs: ['Using static model output fallback']
  };
}
