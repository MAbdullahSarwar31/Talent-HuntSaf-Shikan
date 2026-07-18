import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Mission } from '../types';
import { dataApi } from '../lib/supabase';
import { generateExecutiveInsight } from '../lib/ai';
import { PageHeader } from '../components/common/PageHeader';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { formatPKR, formatDate } from '../utils/formatters';
import {
  ArrowLeft,
  Sparkles,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  Plane,
  User,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const MissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insight states
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const loadMission = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dataApi.getMissionById(id);
      setMission(data);
      // Auto-generate AI insight on mount or user can click
      if (data) {
        setInsightLoading(true);
        generateExecutiveInsight(data)
          .then((text) => setInsight(text))
          .catch((err) => console.warn('AI insight error:', err))
          .finally(() => setInsightLoading(false));
      }
    } catch (err: any) {
      console.error('Failed to load mission details:', err);
      setError(err.message || 'Could not retrieve mission record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMission();
  }, [id]);

  const handleGenerateInsight = async () => {
    if (!mission) return;
    setInsightLoading(true);
    try {
      const text = await generateExecutiveInsight(mission);
      setInsight(text);
    } catch (err) {
      console.error('Manual insight generation error:', err);
    } finally {
      setInsightLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/missions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mission Directory
        </button>
        <LoadingState message="Auditing mission itemized ledger & AI model..." rows={10} />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/missions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mission Directory
        </button>
        {error ? (
          <ErrorState title="Mission Audit Failed" message={error} onRetry={loadMission} />
        ) : (
          <EmptyState
            title="Mission Not Found"
            description={`No mission ledger found corresponding to ID "${id}". It may have been archived or removed.`}
            actionLabel="Return to Directory"
            onAction={() => navigate('/missions')}
          />
        )}
      </div>
    );
  }

  const rev = Number(mission.revenue_pkr || 0);
  let totalCost = 0;
  (mission.costs || []).forEach((c) => (totalCost += Number(c.amount_pkr || 0)));
  const netProfit = rev - totalCost;
  const netMargin = rev > 0 ? (netProfit / rev) * 100 : 0;
  const score = mission.profitability_score?.score ?? 50;
  const band = mission.profitability_score?.band ?? 'average';
  const reasons = mission.profitability_score?.reasons || [];
  const recommendations = mission.profitability_score?.recommendations || [];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'travel':
        return { label: 'Transit & Transport', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'retry_fuel':
        return { label: 'Spraying Retry Waste', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'chemical_loading':
        return { label: 'Chemical Formulation', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'battery_wear':
        return { label: 'Battery Depreciation', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'operator_labor':
        return { label: 'Operator Labor Fee', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'maintenance_reserve':
        return { label: 'Maintenance Buffer', bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: category, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation & Header */}
      <div>
        <button
          onClick={() => navigate('/missions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Mission Directory
        </button>

        <PageHeader
          title={`${mission.code}: ${mission.title}`}
          subtitle={`Deployed on ${formatDate(mission.date)} in ${mission.location}, ${mission.province} sector (${mission.area_covered_acres} acres covered).`}
          badge={<ScoreBadge score={score} band={band} size="lg" />}
        />
      </div>

      {/* Top Financial KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Gross Contract Revenue
          </div>
          <div className="text-2xl font-black text-slate-900">{formatPKR(rev, true)}</div>
          <div className="text-xs text-slate-400 mt-1">
            {formatPKR(Math.round(rev / Math.max(1, mission.area_covered_acres)))} / acre yield
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-slate-600" /> Itemized Total Cost
          </div>
          <div className="text-2xl font-black text-slate-800">{formatPKR(totalCost, true)}</div>
          <div className="text-xs text-slate-400 mt-1">
            {((totalCost / Math.max(1, rev)) * 100).toFixed(1)}% of gross contract value
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Net Profit Surplus
          </div>
          <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netProfit >= 0 ? '+' : ''}
            {formatPKR(netProfit, true)}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Net Margin: {netMargin.toFixed(1)}%</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1">
            <Clock className="w-4 h-4 text-purple-600" /> Flight & Delay Friction
          </div>
          <div className="text-2xl font-black text-slate-900">{mission.flight_hours} hrs</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>{mission.duration_minutes} min duration</span>
            {mission.delay_minutes > 0 && (
              <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                +{mission.delay_minutes}m delay
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Executive Insight Panel (Prominent Box) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Executive AI Intelligence Briefing
              </h3>
              <p className="text-xs text-slate-400">
                Synthesis of gross margins, travel overhead, and field retries generated by SAF SHIKAN AI layer
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateInsight}
            disabled={insightLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex-shrink-0"
          >
            {insightLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Ledger...
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" /> Generate New Insight
              </>
            )}
          </button>
        </div>

        <div className="min-h-[64px] flex items-center">
          {insightLoading ? (
            <div className="w-full flex items-center gap-3 py-3 text-slate-300 text-sm italic">
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              Computing multi-variable leakage vectors and generating executive briefing...
            </div>
          ) : (
            <p className="text-sm md:text-base leading-relaxed text-slate-100 font-medium tracking-wide">
              {insight || 'Click "Generate New Insight" above to synthesize mission profitability model.'}
            </p>
          )}
        </div>
      </div>

      {/* Grid: Itemized Financial Ledger vs Scoring Deductions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itemized Cost Ledger Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" /> Itemized Financial Cost Ledger
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exact expenditure breakdown deducted from gross contract revenue
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                {(mission.costs || []).length} Cost Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3.5 px-6">Cost Category</th>
                    <th className="py-3.5 px-4">Notes / Operational Context</th>
                    <th className="py-3.5 px-4 text-right">Amount (PKR)</th>
                    <th className="py-3.5 px-6 text-right">% of Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(mission.costs || []).map((c) => {
                    const badge = getCategoryBadge(c.category);
                    const pct = totalCost > 0 ? (Number(c.amount_pkr || 0) / totalCost) * 100 : 0;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-6">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs">{c.notes || 'Routine allocation'}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                          {formatPKR(Number(c.amount_pkr || 0))}
                        </td>
                        <td className="py-3.5 px-6 text-right font-semibold text-slate-500">
                          {pct.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Total Itemized Expenditure</span>
            <span className="text-base font-black text-slate-900">{formatPKR(totalCost, true)}</span>
          </div>
        </div>

        {/* Scoring Rationale & Leakage Analysis Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Margin Leakage Deductions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Why this mission received a score of {score}/100 ({band.toUpperCase()})
              </p>
            </div>

            {/* Reasons List */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Triggered Factors</div>
              {reasons.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No negative leakage deductions triggered.</div>
              ) : (
                reasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))
              )}
            </div>

            {/* Recommendations List */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Leadership Actions</div>
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Hardware & Operator Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Assigned Hardware & Crew</h3>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {mission.drone?.model || 'Agras T40 Pro'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {mission.drone?.serial_number || 'SS-AGRAS-01'}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {mission.drone?.status || 'active'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {mission.operator?.full_name || 'Tariq Mehmood'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {mission.operator?.experience_years || 5} years exp ({mission.operator?.total_missions || 85} missions)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-800">
                  {mission.operator?.retry_rate_percentage || 2.4}%
                </div>
                <div className="text-[10px] text-slate-400">Retry Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
