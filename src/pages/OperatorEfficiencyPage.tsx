import React, { useEffect, useState } from 'react';
import type { Operator } from '../types';
import { dataApi } from '../lib/supabase';
import { computeOperatorEfficiencyScore } from '../utils/scoring';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatPKR } from '../utils/formatters';
import { Users, Award, AlertTriangle, Activity, MapPin, UserCheck, CheckCircle2 } from 'lucide-react';

export const OperatorEfficiencyPage: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOperators = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await dataApi.getOperators();
      setOperators(list);
    } catch (err: any) {
      console.error('Failed to load operators:', err);
      setError(err.message || 'Error querying operator database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pakistani Operator Efficiency & Retry Metrics"
          subtitle="Evaluating field performance, spraying accuracy, retry penalties, and delay overhead across regional operators."
        />
        <LoadingState message="Ranking operator spraying accuracy and retry penalties..." rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pakistani Operator Efficiency & Retry Metrics" />
        <ErrorState title="Operator Query Failed" message={error} onRetry={loadOperators} />
      </div>
    );
  }

  // Compute KPI summary
  let totalMissions = 0;
  let totalRetry = 0;
  let highRetryCount = 0;
  let topOp = operators[0] || null;

  operators.forEach((op) => {
    totalMissions += op.total_missions;
    totalRetry += op.retry_rate_percentage;
    if (op.retry_rate_percentage > 20) highRetryCount++;
    if (topOp && op.total_missions > topOp.total_missions) topOp = op;
  });

  const avgRetry = operators.length > 0 ? totalRetry / operators.length : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Pakistani Operator Efficiency & Retry Metrics"
        subtitle="Ranking regional operators across Punjab and Sindh on mission volume, spraying drift retries, and experience tiers."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm">
            {operators.length} Active Crews
          </span>
        }
      />

      {/* Operator KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Field Operators"
          value={`${operators.length} Crews`}
          subtitle={`Deployed across ${totalMissions} missions`}
          icon={<Users className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Top Performing Crew"
          value={topOp ? topOp.full_name : 'Tariq Mehmood'}
          subtitle={topOp ? `${topOp.total_missions} missions (${topOp.retry_rate_percentage}% retries)` : '85 missions'}
          icon={<Award className="w-5 h-5" />}
          variant="positive"
        />
        <StatCard
          title="Fleet Average Retry Rate"
          value={`${avgRetry.toFixed(1)}%`}
          subtitle="Spraying loops repeated"
          icon={<Activity className="w-5 h-5" />}
          variant={avgRetry <= 5 ? 'positive' : avgRetry <= 15 ? 'warning' : 'critical'}
        />
        <StatCard
          title="High-Retry Risk Crews"
          value={`${highRetryCount} Operators`}
          subtitle="Exceeding 20% retry threshold"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant={highRetryCount === 0 ? 'positive' : 'critical'}
        />
      </div>

      {/* Operator Efficiency Ranking Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Operator Performance Ranking & Retry Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic scoring penalizes high retry rates and field delay overhead while rewarding mission tenure
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600 self-start sm:self-auto">
            Ranked by BI Score
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="py-4 px-6">Operator Name / CNIC</th>
                <th className="py-4 px-4">Home Station & Sector</th>
                <th className="py-4 px-4 text-center">Experience</th>
                <th className="py-4 px-4 text-right">Hourly Rate</th>
                <th className="py-4 px-4 text-right">Missions</th>
                <th className="py-4 px-4 text-center">Spraying Retry Rate</th>
                <th className="py-4 px-6 text-center">Efficiency Score</th>
                <th className="py-4 px-6">Actionable Assessment & Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {operators
                .slice()
                .sort((a, b) => {
                  const scoreA = computeOperatorEfficiencyScore(a).score;
                  const scoreB = computeOperatorEfficiencyScore(b).score;
                  return scoreB - scoreA;
                })
                .map((op) => {
                  const scoring = computeOperatorEfficiencyScore(op);
                  return (
                    <tr key={op.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          {op.full_name}
                        </div>
                        <div className="text-[10px] text-slate-400 pl-6">CNIC: {op.cnic}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {op.location}, {op.province}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-700 whitespace-nowrap">
                        {op.experience_years} Years
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                        {formatPKR(op.hourly_rate_pkr)} / hr
                      </td>
                      <td className="py-4 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                        {op.total_missions}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            op.retry_rate_percentage <= 5
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : op.retry_rate_percentage <= 15
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {op.retry_rate_percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <ScoreBadge score={scoring.score} band={scoring.band} size="sm" />
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="text-[11px] font-medium text-slate-700 max-w-sm whitespace-normal">
                          {scoring.reasons[0] || 'Nominal field execution.'}
                        </div>
                        {scoring.recommendations[0] && (
                          <div className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1 whitespace-normal">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            {scoring.recommendations[0]}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
