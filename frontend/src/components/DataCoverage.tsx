import React from 'react';
import type { CompanyCoverageItem } from '../types';

interface DataCoverageProps {
  coverageItems: CompanyCoverageItem[];
}

export const DataCoverage: React.FC<DataCoverageProps> = ({ coverageItems }) => {
  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'live':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase tracking-wider">
            Live API
          </span>
        );
      case 'manual':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
            Manual Input
          </span>
        );
      case 'estimated':
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-sky-100 text-sky-900 border border-sky-300 uppercase tracking-wider">
            Estimated
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-bold rounded bg-gray-100 text-gray-700 uppercase tracking-wider">
            Unavailable
          </span>
        );
    }
  };

  const getReasonNote = (type: string) => {
    switch (type) {
      case 'news':
        return 'NewsAPI + VADER sentiment analysis over rolling 30-day headline press coverage.';
      case 'jobs':
        return 'Google News RSS volume index classifying hiring vs layoff news mentions.';
      case 'gstin':
        return 'gst.gov.in captcha barrier; directionally-honest manual verification of tax registration.';
      case 'mca':
        return 'Zauba Corp / MCA21 statutory compliance & NCLT filing status.';
      case 'linkedin':
        return 'LinkedIn public headcount snapshot / Wayback Machine historical archive.';
      case 'appstore':
        return 'Google Play Store rating velocity & verified app delisting status.';
      default:
        return 'Alternative public data signal provenance.';
    }
  };

  return (
    <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg p-5 shadow-xs">
      <div className="mb-4 pb-3 border-b border-[#DED6C8]">
        <h3 className="text-base font-bold text-[#292721]">
          Signal Provenance & Data Coverage Governance
        </h3>
        <p className="text-xs text-[#746E63]">
          Full disclosure of signal sources, automation status, and data modes for institutional auditability.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#292721]">
          <thead className="bg-[#F1EBDD] text-[#746E63] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-2.5 px-4">Signal</th>
              <th className="py-2.5 px-4">Data Mode</th>
              <th className="py-2.5 px-4">Source Provenance</th>
              <th className="py-2.5 px-4">Governance Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DED6C8]">
            {coverageItems.map((item) => (
              <tr key={item.signal_type} className="hover:bg-[#F7F3EA]">
                <td className="py-3 px-4 font-bold text-[#292721]">
                  {item.display_name}
                </td>
                <td className="py-3 px-4">
                  {getModeBadge(item.data_mode)}
                </td>
                <td className="py-3 px-4 font-medium text-[#4C3B2A]">
                  {item.source}
                </td>
                <td className="py-3 px-4 text-[#746E63] italic text-[11px]">
                  {getReasonNote(item.signal_type)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
