import React from 'react';
import type { CompanyDetailData, SignalDetail, ScoreHistoryPoint } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ScoreTrendChart } from '../components/ScoreTrendChart';
import { SignalBreakdown } from '../components/SignalBreakdown';
import { DataCoverage } from '../components/DataCoverage';
import { ArrowLeft, AlertTriangle, Calendar, Layers } from 'lucide-react';

interface CompanyDetailProps {
  company: CompanyDetailData;
  signals: SignalDetail[];
  history: ScoreHistoryPoint[];
  onBack: () => void;
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  signals,
  history,
  onBack
}) => {
  // Sort signals by contribution (score * weight)
  const topFlaggedSignals = [...signals]
    .sort((a, b) => ((b.normalized_score || 0) * b.weight) - ((a.normalized_score || 0) * a.weight))
    .slice(0, 3);

  const isByju = company.name.toLowerCase().includes("byju");

  return (
    <div className="space-y-6">
      {/* Navigation Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-bold text-[#8A6A43] hover:text-[#4C3B2A] transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Portfolio Overview
      </button>

      {/* Main Company Header Card */}
      <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-[#292721] tracking-tight">
                {company.name}
              </h2>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded uppercase tracking-wider ${
                company.category === 'distressed'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {company.category}
              </span>
            </div>

            <p className="text-xs text-[#746E63] mt-1 flex items-center gap-2">
              <span>Venture Debt Monitored Exposure</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8A6A43]" />
                Last updated: {company.last_updated ? new Date(company.last_updated).toLocaleString() : 'Just now'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-5 p-3.5 bg-[#F7F3EA] rounded-md border border-[#DED6C8]">
            <div className="text-right">
              <span className="text-[10px] text-[#746E63] font-bold uppercase tracking-wider block">
                Composite Distress Score
              </span>
              <div className="flex items-baseline gap-1 text-3xl font-black text-[#292721]">
                {company.score !== null ? company.score : 'N/A'}
                <span className="text-xs font-normal text-[#9A9387]">/ 100</span>
              </div>
              {company.score_change !== null && (
                <span className={`text-[11px] font-bold block ${
                  company.score_change > 0 ? 'text-[#A95145]' : 'text-[#557A61]'
                }`}>
                  {company.score_change > 0 ? `+${company.score_change}` : company.score_change} from prior observation
                </span>
              )}
            </div>

            <div className="pl-4 border-l border-[#DED6C8]">
              <StatusBadge status={company.status} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* WHY THIS COMPANY IS FLAGGED Section */}
      <div className="bg-[#FFFDF8] border-2 border-[#8A6A43]/40 rounded-lg p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DED6C8]">
          <AlertTriangle className="w-5 h-5 text-[#B07A32]" />
          <h3 className="text-base font-extrabold text-[#292721]">
            Why This Company Is Flagged
          </h3>
          <span className="text-xs text-[#746E63] ml-auto">
            Highest-contributing risk factors from Authoritative Python Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topFlaggedSignals.map((sig) => (
            <div
              key={sig.signal_type}
              className="bg-[#F7F3EA] border border-[#DED6C8] p-4 rounded-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#292721] text-sm">
                    {sig.display_name}
                  </span>
                  <StatusBadge status={sig.risk_status} size="sm" showLabel={false} />
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-black text-[#A95145]">
                    {sig.normalized_score !== null ? sig.normalized_score : 'N/A'}
                  </span>
                  <span className="text-xs text-[#746E63]">
                    (Weight: {Math.round(sig.weight * 100)}%)
                  </span>
                </div>

                <p className="text-xs text-[#746E63] leading-relaxed">
                  Source: <span className="font-semibold text-[#4C3B2A]">{sig.source}</span>
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#DED6C8] text-[11px] font-medium text-[#4C3B2A]">
                Mode: <span className="uppercase font-bold">{sig.data_mode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score Trend Chart Section */}
      <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#DED6C8] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#292721] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8A6A43]" />
              Historical Distress Score Progression
            </h3>
            <p className="text-xs text-[#746E63]">
              {isByju
                ? "Includes Byju's retrospective validation timeline (Jan 2022 – Oct 2023)"
                : "Chronological model distress score trajectory"}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#8A6A43] bg-[#F1EBDD] px-2.5 py-1 rounded border border-[#DED6C8]">
            {history.length} Observations
          </span>
        </div>

        <ScoreTrendChart history={history} height={280} showRetrospectiveNote={isByju} />
      </div>

      {/* Six Signal Breakdown Grid */}
      <SignalBreakdown signals={signals} />

      {/* Signal Provenance & Data Coverage Section */}
      <DataCoverage coverageItems={company.data_coverage} />
    </div>
  );
};
