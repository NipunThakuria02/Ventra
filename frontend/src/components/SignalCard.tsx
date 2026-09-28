import React from 'react';
import type { SignalDetail, DataMode } from '../types';
import { StatusBadge } from './StatusBadge';
import { Activity, Newspaper, Building2, FileCheck, Smartphone, Users } from 'lucide-react';

interface SignalCardProps {
  signal: SignalDetail;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal }) => {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'linkedin':
        return <Users className="w-5 h-5 text-[#8A6A43]" />;
      case 'jobs':
        return <Activity className="w-5 h-5 text-[#8A6A43]" />;
      case 'news':
        return <Newspaper className="w-5 h-5 text-[#8A6A43]" />;
      case 'gstin':
        return <Building2 className="w-5 h-5 text-[#8A6A43]" />;
      case 'mca':
        return <FileCheck className="w-5 h-5 text-[#8A6A43]" />;
      case 'appstore':
        return <Smartphone className="w-5 h-5 text-[#8A6A43]" />;
      default:
        return <Activity className="w-5 h-5 text-[#8A6A43]" />;
    }
  };

  const getDataModeBadge = (mode: DataMode) => {
    switch (mode) {
      case 'live':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
            Live
          </span>
        );
      case 'manual':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
            Manual
          </span>
        );
      case 'estimated':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-900 border border-sky-300 uppercase tracking-wider">
            Estimated
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-700 uppercase tracking-wider">
            Unavailable
          </span>
        );
    }
  };

  const getInterpretation = (sig: SignalDetail) => {
    const score = sig.normalized_score ?? 0;
    const ev = sig.evidence || {};

    if (sig.signal_type === 'linkedin') {
      if (score >= 75) return 'Severe headcount contraction visible on public channels; high distress indicator.';
      if (score >= 55) return 'Notable reduction in headcount over recent observation periods.';
      if (score >= 35) return 'Mild headcount softening or hiring freeze.';
      return 'Headcount growth or stable workforce trajectory.';
    }
    if (sig.signal_type === 'jobs') {
      if (score >= 75) return 'Layoff-focused media coverage significantly outweighs hiring announcements.';
      if (score >= 55) return 'Elevated layoff mentions and reduced recruitment news volume.';
      if (score >= 35) return 'Hiring news volume has slowed compared to previous active hiring.';
      return 'Active recruitment and positive hiring volume.';
    }
    if (sig.signal_type === 'news') {
      if (score >= 75) return 'Highly negative rolling media coverage regarding legal, financial, or operational hurdles.';
      if (score >= 55) return 'Elevated negative news sentiment across recent press mentions.';
      if (score >= 35) return 'Mixed media coverage with slight negative sentiment skew.';
      return 'Positive or neutral media sentiment profile.';
    }
    if (sig.signal_type === 'gstin') {
      if (score >= 75) return 'GSTIN registration status is suspended or cancelled by tax authorities.';
      if (score >= 35) return 'GSTIN registration status requires regulatory verification.';
      return 'Active GSTIN registration with normal compliance status.';
    }
    if (sig.signal_type === 'mca') {
      if (score >= 75) return 'Insolvency, liquidation, or severe MCA statutory filing delay reported.';
      if (score >= 45) return 'Annual returns or financial statements overdue beyond normal window.';
      return 'Current MCA statutory filings with clean compliance history.';
    }
    if (sig.signal_type === 'appstore') {
      if (ev.app_delisted) return 'VERIFIED HARD SIGNAL: Application delisted from public Play Store.';
      if (score >= 55) return 'Significant customer rating drop or surge in outage/refund complaints.';
      if (score >= 35) return 'Moderate rating volatility on public app stores.';
      return 'Stable user ratings and positive store velocity.';
    }

    return 'Signal parameters evaluated within normal monitoring thresholds.';
  };

  const formattedWeight = Math.round((signal.weight || 0) * 100);

  return (
    <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-[#8A6A43] transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#F1EBDD] border border-[#DED6C8]">
              {getSignalIcon(signal.signal_type)}
            </div>
            <div>
              <h4 className="font-bold text-[#292721] text-base leading-tight">
                {signal.display_name}
              </h4>
              <span className="text-xs text-[#746E63]">
                Weight: <span className="font-semibold text-[#4C3B2A]">{formattedWeight}%</span>
              </span>
            </div>
          </div>
          {getDataModeBadge(signal.data_mode)}
        </div>

        {/* Score & Status Bar */}
        <div className="my-4 py-3 px-4 bg-[#F7F3EA] rounded-md border border-[#DED6C8] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#746E63] font-semibold uppercase tracking-wider">
              Distress Score
            </div>
            <div className="text-2xl font-black text-[#292721] flex items-baseline gap-1">
              {signal.normalized_score !== null ? signal.normalized_score : 'N/A'}
              <span className="text-xs font-normal text-[#9A9387]">/ 100</span>
            </div>
          </div>
          <StatusBadge status={signal.risk_status} size="sm" />
        </div>

        {/* Short Interpretation */}
        <p className="text-xs text-[#746E63] leading-relaxed mb-4">
          {getInterpretation(signal)}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#DED6C8] flex flex-col gap-1 text-[11px] text-[#9A9387]">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#746E63]">Source Provenance:</span>
          <span className="font-semibold text-[#4C3B2A] truncate max-w-[180px]" title={signal.source}>
            {signal.source}
          </span>
        </div>
      </div>
    </div>
  );
};
