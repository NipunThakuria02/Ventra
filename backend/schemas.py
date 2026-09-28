"""
backend/schemas.py

Pydantic schemas for Ventra REST API endpoints.
Strictly types external outputs, including 'jobs' signal internal key and 'Hiring Activity' display label.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class HealthResponse(BaseModel):
    status: str
    database: bool
    model: bool


class DataCoverageSummary(BaseModel):
    live: int
    manual: int
    estimated: int
    total: Optional[int] = None


class PortfolioCompany(BaseModel):
    id: int
    name: str
    category: str
    score: Optional[float]
    status: str
    previous_score: Optional[float] = None
    score_change: Optional[float] = None
    signal_count: int
    top_signal: Optional[str] = None
    data_coverage: DataCoverageSummary
    last_updated: Optional[str] = None


class PortfolioSummary(BaseModel):
    total_companies: int
    green_count: int
    amber_count: int
    red_count: int
    critical_count: int
    requires_attention_count: int
    average_distress_score: float


class CompanyCoverageItem(BaseModel):
    signal_type: str
    display_name: str
    data_mode: str
    source: str


class CompanyDetail(BaseModel):
    id: int
    name: str
    category: str
    score: Optional[float]
    status: str
    previous_score: Optional[float] = None
    score_change: Optional[float] = None
    last_updated: Optional[str] = None
    coverage_summary: DataCoverageSummary
    data_coverage: List[CompanyCoverageItem]


class SignalDetail(BaseModel):
    signal_type: str
    display_name: str
    raw_value: Optional[float] = None
    normalized_score: Optional[float] = None
    weight: float
    risk_status: str
    source: str
    data_mode: str
    collected_at: str
    evidence: Dict[str, Any] = Field(default_factory=dict)


class ScoreHistoryPoint(BaseModel):
    score: float
    status: str
    is_retrospective: bool
    calculated_at: str


class AlertTopSignal(BaseModel):
    signal_type: str
    display_name: str
    normalized_score: Optional[float]
    risk_status: str
    data_mode: str


class Alert(BaseModel):
    id: int
    name: str
    category: str
    score: Optional[float]
    status: str
    score_change: Optional[float] = None
    top_signals: List[AlertTopSignal]
    reason: str
    last_updated: Optional[str] = None


class RefreshResponse(BaseModel):
    status: str
    timestamp: str
    companies_updated: int
    errors: List[str]
    logs: List[str]
