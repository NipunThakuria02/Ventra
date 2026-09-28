import React from 'react';
import type { PortfolioCompany } from '../types';
import { StatusBadge } from './StatusBadge';
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from 'lucide-react';

interface PortfolioTableProps {
  companies: PortfolioCompany[];
  onSelectCompany: (id: number) => void;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({
  companies,
  onSelectCompany
}) => {
  return (
    <div className="bg-[#FFFDF8] border border-[#DED6C8] rounded-lg shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-[#DED6C8] flex items-center justify-between bg-[#F7F3EA]">
        <div>
          <h3 className="text-base font-bold text-[#292721]">
            Monitored Portfolio Companies
          </h3>
          <p className="text-xs text-[#746E63]">
            Ranked by alternative data distress score
          </p>
        </div>
        <span className="text-xs font-semibold text-[#8A6A43] bg-[#F1EBDD] px-2.5 py-1 rounded border border-[#DED6C8]">
          {companies.length} Active Positions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#292721]">
          <thead className="bg-[#F1EBDD] text-[#746E63] font-semibold border-b border-[#DED6C8] uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-6">Company</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Risk Status</th>
              <th className="py-3.5 px-4 text-right">Distress Score</th>
              <th className="py-3.5 px-4">Trend</th>
              <th className="py-3.5 px-4">Top Contributing Signal</th>
              <th className="py-3.5 px-4">Data Coverage</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DED6C8]">
            {companies.map((company) => {
              const isDistressedCat = company.category === 'distressed';
              return (
                <tr
                  key={company.id}
                  onClick={() => onSelectCompany(company.id)}
                  className="hover:bg-[#F1EBDD]/60 cursor-pointer transition-colors group"
                >
                  {/* Company Name */}
                  <td className="py-4 px-6 font-bold text-[#292721] text-sm group-hover:text-[#8A6A43]">
                    {company.name}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                      isDistressedCat
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {company.category}
                    </span>
                  </td>

                  {/* Risk Status */}
                  <td className="py-4 px-4">
                    <StatusBadge status={company.status} size="sm" />
                  </td>

                  {/* Distress Score */}
                  <td className="py-4 px-4 text-right">
                    <span className="text-base font-black text-[#292721]">
                      {company.score !== null ? company.score : 'N/A'}
                    </span>
                    <span className="text-[10px] text-[#9A9387] ml-0.5">/100</span>
                  </td>

                  {/* Trend */}
                  <td className="py-4 px-4 font-semibold">
                    {company.score_change !== null ? (
                      company.score_change > 0 ? (
                        <span className="text-[#A95145] flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{company.score_change}
                        </span>
                      ) : company.score_change < 0 ? (
                        <span className="text-[#557A61] flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {company.score_change}
                        </span>
                      ) : (
                        <span className="text-[#746E63] flex items-center gap-0.5">
                          <Minus className="w-3.5 h-3.5" />
                          0.0
                        </span>
                      )
                    ) : (
                      <span className="text-[#9A9387] italic">—</span>
                    )}
                  </td>

                  {/* Top Signal */}
                  <td className="py-4 px-4 font-medium text-[#4C3B2A]">
                    {company.top_signal || '—'}
                  </td>

                  {/* Data Coverage */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold" title="Live signals">
                        {company.data_coverage.live} Live
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold" title="Manual inputs">
                        {company.data_coverage.manual} Manual
                      </span>
                      {company.data_coverage.estimated > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-900 font-bold" title="Estimated signals">
                          {company.data_coverage.estimated} Est.
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button className="inline-flex items-center text-xs font-bold text-[#8A6A43] group-hover:text-[#4C3B2A]">
                      Review <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
