import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import type { ScoreHistoryPoint } from '../types';

interface ScoreTrendChartProps {
  history: ScoreHistoryPoint[];
  height?: number;
  showRetrospectiveNote?: boolean;
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  history,
  height = 260,
  showRetrospectiveNote = true
}) => {
  // Format data for Recharts
  const chartData = history.map((point) => {
    const d = new Date(point.calculated_at);
    let dateStr = point.calculated_at;
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return {
      date: dateStr,
      rawDate: point.calculated_at,
      score: point.score,
      status: point.status,
      isRetrospective: point.is_retrospective,
      label: point.is_retrospective ? `${dateStr} (Retrospective)` : dateStr
    };
  });

  const hasRetrospective = history.some(h => h.is_retrospective);

  return (
    <div className="w-full">
      {hasRetrospective && showRetrospectiveNote && (
        <div className="mb-3 px-3 py-1.5 bg-[#F1EBDD] border border-[#DED6C8] rounded text-xs text-[#746E63] flex items-center justify-between">
          <span className="font-semibold text-[#4C3B2A]">
            Includes Retrospective / Historical Estimated Inputs
          </span>
          <span className="italic">
            Flagged for timeline validation (Jan 2022 – Oct 2023)
          </span>
        </div>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8A6A43" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#8A6A43" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#DED6C8" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#746E63"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#DED6C8' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#746E63"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#DED6C8' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-[#FFFDF8] border border-[#DED6C8] p-2.5 rounded shadow-md text-xs">
                      <p className="font-bold text-[#292721]">{data.label}</p>
                      <p className="text-[#8A6A43] font-semibold text-sm my-1">
                        Distress Score: {data.score} / 100
                      </p>
                      <p className="text-[#746E63] capitalize">
                        Status: <span className="font-semibold">{data.status}</span>
                      </p>
                      {data.isRetrospective && (
                        <p className="text-amber-800 italic mt-1 text-[10px]">
                          Historical estimated input
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Risk Threshold Reference Lines */}
            <ReferenceLine y={35} stroke="#B07A32" strokeDasharray="3 3" label={{ value: 'Amber (35)', fill: '#B07A32', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={55} stroke="#A95145" strokeDasharray="3 3" label={{ value: 'Red (55)', fill: '#A95145', fontSize: 10, position: 'right' }} />
            <ReferenceLine y={75} stroke="#7F302B" strokeDasharray="3 3" label={{ value: 'Critical (75)', fill: '#7F302B', fontSize: 10, position: 'right' }} />
            
            <Area
              type="monotone"
              dataKey="score"
              stroke="#8A6A43"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGradient)"
              dot={{ r: 4, fill: '#4C3B2A', stroke: '#FFFDF8', strokeWidth: 1.5 }}
              activeDot={{ r: 6, fill: '#7F302B' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
