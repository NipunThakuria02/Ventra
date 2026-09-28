import React from 'react';
import type { AlertItem } from '../types';
import { StatusBadge } from './StatusBadge';
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  onReviewCompany: (id: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onReviewCompany }) => {
  return (
    <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-5 shadow-xs hover:border-[#8A6A43] transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DED6C8]">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-md bg-[#FAECEB] text-[#A95145] border border-[#EBB8B4]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#292721]">{alert.name}</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                {alert.category}
              </span>
            </div>
            <p className="text-xs text-[#746E63] mt-0.5">
              Requires active fund manager monitoring & covenant verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-[#746E63] uppercase tracking-wider font-semibold block">
              Distress Score
            </span>
            <span className="text-2xl font-black text-[#292721]">
              {alert.score !== null ? alert.score : 'N/A'}
              <span className="text-xs font-normal text-[#9A9387]">/ 100</span>
            </span>
          </div>
          <StatusBadge status={alert.status} size="lg" />
        </div>
      </div>

      {/* Primary Trigger Reasons */}
      <div className="py-3">
        <h4 className="text-xs font-bold text-[#4C3B2A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#B07A32]" />
          Key Contributing Distress Factors
        </h4>
        <p className="text-xs text-[#746E63] leading-relaxed bg-[#F7F3EA] p-3 rounded border border-[#DED6C8]">
          {alert.reason}
        </p>
      </div>

      {/* Top Signals */}
      <div className="pt-3 border-t border-[#DED6C8] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#746E63]">Top Risk Signals:</span>
          {alert.top_signals.map((sig) => (
            <span
              key={sig.signal_type}
              className="px-2.5 py-1 text-xs rounded bg-[#F1EBDD] border border-[#DED6C8] text-[#292721] font-medium flex items-center gap-1.5"
            >
              <span>{sig.display_name}</span>
              <span className="font-bold text-[#8A6A43]">
                {sig.normalized_score !== null ? sig.normalized_score : 'N/A'}
              </span>
            </span>
          ))}
        </div>

        <button
          onClick={() => onReviewCompany(alert.id)}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#8A6A43] hover:bg-[#4C3B2A] text-[#FFFDF8] font-bold text-xs rounded transition-colors"
        >
          Review Company Details <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
