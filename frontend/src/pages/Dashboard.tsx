import React from 'react';
import type { PortfolioCompany, PortfolioSummary } from '../types';
import { PortfolioTable } from '../components/PortfolioTable';
import { Building2, AlertOctagon, ShieldAlert, BarChart3, TrendingUp } from 'lucide-react';

interface DashboardProps {
  summary: PortfolioSummary | null;
  companies: PortfolioCompany[];
  onSelectCompany: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  companies,
  onSelectCompany
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#292721] tracking-tight">
          Portfolio Overview
        </h2>
        <p className="text-xs text-[#746E63] mt-1">
          Real-time alternative data intelligence monitoring Indian venture debt exposures
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monitored */}
        <div className="bg-[#FFFDF8] border border-[#DED6C8] p-5 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#746E63] uppercase tracking-wider block">
              Monitored Companies
            </span>
            <span className="text-3xl font-black text-[#292721] mt-1 block">
              {summary ? summary.total_companies : companies.length}
            </span>
            <span className="text-[11px] text-[#8A6A43] font-semibold mt-0.5 block">
              Active Venture Debt Loans
            </span>
          </div>
          <div className="p-3 bg-[#F1EBDD] rounded-md border border-[#DED6C8]">
            <Building2 className="w-6 h-6 text-[#8A6A43]" />
          </div>
        </div>

        {/* Card 2: Requires Attention */}
        <div className="bg-[#FFFDF8] border border-[#DED6C8] p-5 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#746E63] uppercase tracking-wider block">
              Requires Attention
            </span>
            <span className="text-3xl font-black text-[#B07A32] mt-1 block">
              {summary ? summary.requires_attention_count : 0}
            </span>
            <span className="text-[11px] text-[#746E63] font-medium mt-0.5 block">
              Amber + Red + Critical
            </span>
          </div>
          <div className="p-3 bg-[#FBF3E6] rounded-md border border-[#F0D4AC]">
            <AlertOctagon className="w-6 h-6 text-[#B07A32]" />
          </div>
        </div>

        {/* Card 3: Critical Risks */}
        <div className="bg-[#FFFDF8] border border-[#DED6C8] p-5 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#746E63] uppercase tracking-wider block">
              Critical Exposure
            </span>
            <span className="text-3xl font-black text-[#7F302B] mt-1 block">
              {summary ? summary.critical_count : 0}
            </span>
            <span className="text-[11px] text-[#A95145] font-semibold mt-0.5 block">
              Score ≥ 75 / Immediate Action
            </span>
          </div>
          <div className="p-3 bg-[#F7E7E5] rounded-md border border-[#DB9D99]">
            <ShieldAlert className="w-6 h-6 text-[#7F302B]" />
          </div>
        </div>

        {/* Card 4: Avg Distress Score */}
        <div className="bg-[#FFFDF8] border border-[#DED6C8] p-5 rounded-lg shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#746E63] uppercase tracking-wider block">
              Avg Distress Score
            </span>
            <span className="text-3xl font-black text-[#292721] mt-1 block">
              {summary ? summary.average_distress_score : 0}
              <span className="text-xs font-normal text-[#9A9387]">/100</span>
            </span>
            <span className="text-[11px] text-[#557A61] font-semibold mt-0.5 block">
              Model Composite Average
            </span>
          </div>
          <div className="p-3 bg-[#F1EBDD] rounded-md border border-[#DED6C8]">
            <BarChart3 className="w-6 h-6 text-[#4C3B2A]" />
          </div>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      {summary && (
        <div className="bg-[#FFFDF8] border border-[#DED6C8] p-5 rounded-lg shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#292721] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#8A6A43]" />
              Portfolio Risk Category Distribution
            </h3>
            <span className="text-xs text-[#746E63]">
              Authoritative Risk Taxonomy (Scorer.py)
            </span>
          </div>

          <div className="w-full bg-[#F7F3EA] h-4 rounded-full overflow-hidden flex border border-[#DED6C8]">
            <div
              style={{ width: `${(summary.green_count / summary.total_companies) * 100}%` }}
              className="bg-[#557A61] h-full transition-all"
              title={`Green: ${summary.green_count}`}
            />
            <div
              style={{ width: `${(summary.amber_count / summary.total_companies) * 100}%` }}
              className="bg-[#B07A32] h-full transition-all"
              title={`Amber: ${summary.amber_count}`}
            />
            <div
              style={{ width: `${(summary.red_count / summary.total_companies) * 100}%` }}
              className="bg-[#A95145] h-full transition-all"
              title={`Red: ${summary.red_count}`}
            />
            <div
              style={{ width: `${(summary.critical_count / summary.total_companies) * 100}%` }}
              className="bg-[#7F302B] h-full transition-all"
              title={`Critical: ${summary.critical_count}`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#557A61]" />
              <span className="text-[#746E63]">Green (Low Risk 0–34):</span>
              <span className="font-bold text-[#292721]">{summary.green_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#B07A32]" />
              <span className="text-[#746E63]">Amber (Elevated 35–54):</span>
              <span className="font-bold text-[#292721]">{summary.amber_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#A95145]" />
              <span className="text-[#746E63]">Red (High Risk 55–74):</span>
              <span className="font-bold text-[#292721]">{summary.red_count}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#7F302B]" />
              <span className="text-[#746E63]">Critical (≥ 75):</span>
              <span className="font-bold text-[#292721]">{summary.critical_count}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Portfolio Table */}
      <PortfolioTable companies={companies} onSelectCompany={onSelectCompany} />
    </div>
  );
};
