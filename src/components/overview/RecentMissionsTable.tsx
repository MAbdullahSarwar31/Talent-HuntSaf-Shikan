import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mission } from '../../types';
import { ScoreBadge } from '../common/ScoreBadge';
import { formatPKR } from '../../utils/formatters';
import { ArrowUpRight, Plane, User, MapPin } from 'lucide-react';

interface RecentMissionsTableProps {
  missions: Mission[];
}

export const RecentMissionsTable: React.FC<RecentMissionsTableProps> = ({ missions }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Completed Missions & Profitability
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any row to drill deep into financial breakdown and AI executive insights
          </p>
        </div>
        <button
          onClick={() => navigate('/missions')}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 transition-colors self-start sm:self-auto min-h-[44px] sm:min-h-0 py-1"
        >
          View All {missions.length} Missions <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-6">Mission Code / Title</th>
              <th className="py-3.5 px-4">Location & Crop</th>
              <th className="py-3.5 px-4">Hardware & Operator</th>
              <th className="py-3.5 px-4 text-right">Revenue (PKR)</th>
              <th className="py-3.5 px-4 text-right">Total Cost</th>
              <th className="py-3.5 px-4 text-right">Net Margin</th>
              <th className="py-3.5 px-6 text-center">BI Score & Band</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {missions.slice(0, 7).map((m) => {
              const rev = Number(m.revenue_pkr || 0);
              let cost = 0;
              (m.costs || []).forEach(c => cost += Number(c.amount_pkr || 0));
              const profit = rev - cost;
              const margin = rev > 0 ? (profit / rev) * 100 : 0;
              const score = m.profitability_score?.score ?? 50;
              const band = m.profitability_score?.band ?? 'average';

              return (
                <tr
                  key={m.id}
                  onClick={() => navigate(`/missions/${m.id}`)}
                  className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {m.code}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{m.title}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {m.location}, {m.province}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 inline-block px-1.5 py-0.2 rounded mt-0.5 border border-emerald-200/60">
                      {m.crop_type}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-700 flex items-center gap-1">
                      <Plane className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {m.drone?.serial_number || 'Agras Pro'}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {m.operator?.full_name || 'Assigned Crew'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatPKR(rev, true)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">
                    {formatPKR(cost, true)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className={`font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {profit >= 0 ? '+' : ''}{formatPKR(profit, true)}
                    </span>
                    <div className="text-[10px] text-slate-400 font-medium">({margin.toFixed(1)}%)</div>
                  </td>
                  <td className="py-3.5 px-6 text-center whitespace-nowrap">
                    <ScoreBadge score={score} band={band} size="sm" />
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
