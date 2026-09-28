export type RiskStatus = 'green' | 'amber' | 'red' | 'critical' | 'unknown';
export type DataMode = 'live' | 'manual' | 'estimated';

export interface DataCoverageSummary {
  live: number;
  manual: number;
  estimated: number;
  total?: number;
}

export interface PortfolioCompany {
  id: number;
  name: string;
  category: string;
  score: number | null;
  status: RiskStatus;
  previous_score: number | null;
  score_change: number | null;
  signal_count: number;
  top_signal: string | null;
  data_coverage: DataCoverageSummary;
  last_updated: string | null;
}

export interface PortfolioSummary {
  total_companies: number;
  green_count: number;
  amber_count: number;
  red_count: number;
  critical_count: number;
  requires_attention_count: number;
  average_distress_score: number;
}

export interface CompanyCoverageItem {
  signal_type: string;
  display_name: string;
  data_mode: DataMode;
  source: string;
}

export interface CompanyDetailData {
  id: number;
  name: string;
  category: string;
  score: number | null;
  status: RiskStatus;
  previous_score: number | null;
  score_change: number | null;
  last_updated: string | null;
  coverage_summary: DataCoverageSummary;
  data_coverage: CompanyCoverageItem[];
}

export interface SignalDetail {
  signal_type: string;
  display_name: string;
  raw_value: number | null;
  normalized_score: number | null;
  weight: number;
  risk_status: RiskStatus;
  source: string;
  data_mode: DataMode;
  collected_at: string;
  evidence: Record<string, any>;
}

export interface ScoreHistoryPoint {
  score: number;
  status: RiskStatus;
  is_retrospective: boolean;
  calculated_at: string;
}

export interface AlertTopSignal {
  signal_type: string;
  display_name: string;
  normalized_score: number | null;
  risk_status: RiskStatus;
  data_mode: DataMode;
}

export interface AlertItem {
  id: number;
  name: string;
  category: string;
  score: number | null;
  status: RiskStatus;
  score_change: number | null;
  top_signals: AlertTopSignal[];
  reason: string;
  last_updated: string | null;
}

export interface RefreshResponse {
  status: string;
  timestamp: string;
  companies_updated: number;
  errors: string[];
  logs: string[];
}

export interface HealthResponse {
  status: string;
  database: boolean;
  model: boolean;
}
