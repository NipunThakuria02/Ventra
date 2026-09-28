import React from 'react';
import type { AlertItem } from '../types';
import { AlertCard } from '../components/AlertCard';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AlertsProps {
  alerts: AlertItem[];
  onReviewCompany: (id: number) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ alerts, onReviewCompany }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-[#A95145]" />
          <h2 className="text-2xl font-extrabold text-[#292721] tracking-tight">
            Portfolio Risk Alerts Queue
          </h2>
        </div>
        <p className="text-xs text-[#746E63] mt-1">
          Prioritized venture debt exposures requiring immediate risk review or covenant checks
        </p>
      </div>

      {/* Alerts Count Bar */}
      <div className="bg-[#FFFDF8] border border-[#DED6C8] p-4 rounded-lg flex items-center justify-between shadow-xs">
        <span className="text-xs font-bold text-[#4C3B2A] uppercase tracking-wider">
          Active Warning Queue ({alerts.length} Flagged Companies)
        </span>
        <span className="text-xs text-[#746E63]">
          Sorted strictly by risk severity (Critical → Red → Amber)
        </span>
      </div>

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onReviewCompany={onReviewCompany} />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-12 text-center shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-[#557A61] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#292721]">No Active Risk Alerts</h3>
          <p className="text-xs text-[#746E63] mt-1">
            All monitored portfolio companies are currently within normal operating risk thresholds.
          </p>
        </div>
      )}
    </div>
  );
};
