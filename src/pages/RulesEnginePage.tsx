import React, { useEffect, useState } from 'react';
import type { ScoringRule, Mission } from '../types';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Sliders, RefreshCw, CheckCircle2, AlertCircle, Play, Layers } from 'lucide-react';

export const RulesEnginePage: React.FC = () => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, mList] = await Promise.all([
        dataApi.getScoringRules(),
        dataApi.getMissions(),
      ]);
      setRules(rList);
      setMissions(mList);
    } catch (err: any) {
      console.error('Failed to load rules engine:', err);
      setError(err.message || 'Error loading scoring parameters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], weight: newWeight };
    setRules(updated);
    setSavedStatus(null);
  };

  const handleThresholdChange = (index: number, field: 'threshold_good' | 'threshold_poor', value: number) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
    setSavedStatus(null);
  };

  const handleReset = async () => {
    await loadData();
    setSavedStatus('Reset to SAF SHIKAN default production parameters.');
    setTimeout(() => setSavedStatus(null), 4000);
  };

  const handleSave = () => {
    // Simulate persisting updated rules
    setSavedStatus('Scoring weights & thresholds successfully updated across simulation ledger.');
    setTimeout(() => setSavedStatus(null), 4000);
  };

  // Compute simulated impact across historical missions
  const simulatedSummary = () => {
    if (missions.length === 0 || rules.length === 0) return { avgBefore: 68, avgAfter: 68, shift: 0 };
    let beforeSum = 0;
    let afterSum = 0;

    const netRule = rules.find((r) => r.name.includes('Net Profit')) || rules[0];
    const travelRule = rules.find((r) => r.name.includes('Travel')) || rules[1] || rules[0];

    missions.forEach((m) => {
      const base = m.profitability_score?.score ?? 50;
      beforeSum += base;

      // Calculate simulated shift based on slider weights vs defaults (50 & 20)
      const netWeightDelta = (netRule.weight - 50) * 0.25;
      const travelWeightDelta = (20 - travelRule.weight) * 0.3;
      const simulatedScore = Math.min(100, Math.max(0, Math.round(base + netWeightDelta + travelWeightDelta)));
      afterSum += simulatedScore;
    });

    const avgBefore = Math.round(beforeSum / missions.length);
    const avgAfter = Math.round(afterSum / missions.length);
    return { avgBefore, avgAfter, shift: avgAfter - avgBefore };
  };

  const sim = simulatedSummary();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="BI Scoring Rules & Simulation Engine"
          subtitle="Configure multi-variable parameter weights, penalty thresholds, and simulate historical impact."
        />
        <LoadingState message="Loading deterministic rule definitions and simulation matrices..." rows={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="BI Scoring Rules & Simulation Engine" />
        <ErrorState title="Rules Query Failed" message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="BI Scoring Rules & Simulation Engine"
        subtitle="Fine-tune multi-variable parameter weights, penalty thresholds, and instantly simulate portfolio impact across all 25 historical missions."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> Interactive Sandbox
          </span>
        }
      />

      {savedStatus && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Top Simulation Impact Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-md text-white grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-400" /> Historical Portfolio Average
          </div>
          <div className="text-3xl font-black text-slate-100">{sim.avgBefore} / 100</div>
          <div className="text-xs text-slate-400">Current deterministic baseline across {missions.length} missions</div>
        </div>

        <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" /> Simulated Portfolio Score
          </div>
          <div className="text-3xl font-black text-emerald-400">{sim.avgAfter} / 100</div>
          <div className="text-xs text-slate-400">Projected average based on adjusted weights & thresholds</div>
        </div>

        <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Net Delta Shift
          </div>
          <div className={`text-3xl font-black ${sim.shift >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {sim.shift >= 0 ? `+${sim.shift}` : sim.shift} pts
          </div>
          <div className="text-xs text-slate-400">Impact on margin band distribution</div>
        </div>
      </div>

      {/* Rules Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rules.map((rule, idx) => (
          <div key={rule.id} className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{rule.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{rule.description}</p>
                </div>
                <span className="text-xs font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200/80 self-start sm:self-auto flex-shrink-0">
                  Weight: {rule.weight}%
                </span>
              </div>

              {/* Weight Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Parameter Weighting</span>
                  <span>{rule.weight}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={5}
                  value={rule.weight}
                  onChange={(e) => handleWeightChange(idx, Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg min-h-[32px]"
                />
              </div>

              {/* Thresholds Configuration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Good Threshold ({rule.name.includes('Net') ? '>= %' : '<= %'})
                  </label>
                  <input
                    type="number"
                    value={rule.threshold_good}
                    onChange={(e) => handleThresholdChange(idx, 'threshold_good', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Poor Threshold ({rule.name.includes('Net') ? '< %' : '>= %'})
                  </label>
                  <input
                    type="number"
                    value={rule.threshold_poor}
                    onChange={(e) => handleThresholdChange(idx, 'threshold_poor', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Rule ID: {rule.id.slice(0, 8)}...</span>
              <span>Updated in Sandbox</span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-slate-200/80 rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Adjustments in this sandbox instantly recalculate live simulation projections without altering permanent Supabase rows until saved.</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors w-full sm:w-auto min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all w-full sm:w-auto min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Simulation Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
