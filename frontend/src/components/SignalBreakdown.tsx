import React from 'react';
import type { SignalDetail } from '../types';
import { SignalCard } from './SignalCard';

interface SignalBreakdownProps {
  signals: SignalDetail[];
}

export const SignalBreakdown: React.FC<SignalBreakdownProps> = ({ signals }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#292721]">
          Six Signal Risk Breakdown
        </h3>
        <span className="text-xs text-[#746E63]">
          Authoritative Python Model Normalized Scores (0–100)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {signals.map((sig) => (
          <SignalCard key={sig.signal_type} signal={sig} />
        ))}
      </div>
    </div>
  );
};
