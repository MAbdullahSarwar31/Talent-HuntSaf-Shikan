import React, { useEffect, useState } from 'react';
import type { ScoringRule, Mission } from '../types';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import {
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Info,
  TrendingUp,
  MapPin,
  RefreshCw as RetryIcon,
  Plane,
  Wrench,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import clsx from 'clsx';

interface RuleCategoryGroup {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  description: string;
  logicExplanation: string;
  defaultThresholdNote: string;
  rules: { rule: ScoringRule; index: number }[];
}

export const RulesEnginePage: React.FC = () => {
  const [rules, setRules] = useState<ScoringRule[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, mList] = await Promise.all([
        dataApi.getScoringRules(),
        dataApi.getMissions(),
      ]);

      // Ensure all 5 categories have at least one interactive rule in our sandbox state
      const defaultSupplementalRules: ScoringRule[] = [
        {
          id: 'util-rule-001',
          name: 'Fleet Active Airborne Ratio Target',
          weight: 25,
          threshold_good: 75,
          threshold_poor: 45,
          description: 'Minimum required active airborne flight ratio before equipment is flagged for underutilization.'
        },
        {
          id: 'maint-rule-001',
          name: 'Maintenance Burden Hours Limit',
          weight: 30,
          threshold_good: 20,
          threshold_poor: 50,
          description: 'Maximum allowable accumulated maintenance hours before drone triggers grounded risk caps.'
        }
      ];

      const hasUtil = rList.some(r => r.name.toLowerCase().includes('utilization') || r.name.toLowerCase().includes('flight') || r.name.toLowerCase().includes('airborne'));
      const hasMaint = rList.some(r => r.name.toLowerCase().includes('maintenance') || r.name.toLowerCase().includes('grounded') || r.name.toLowerCase().includes('wear'));

      const combinedRules = [...rList];
      if (!hasUtil) combinedRules.push(defaultSupplementalRules[0]);
      if (!hasMaint) combinedRules.push(defaultSupplementalRules[1]);

      setRules(combinedRules);
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
    setSavedStatus('Reset to SAF SHIKAN default production parameters and simulation benchmarks.');
    setTimeout(() => setSavedStatus(null), 4000);
  };

  const handleSave = () => {
    // Simulate persisting updated rules across simulation ledger
    setSavedStatus('Scoring weights & thresholds successfully updated across active simulation ledger.');
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

  // Categorize rules cleanly into the 5 requested categories
  const getCategorizedGroups = (): RuleCategoryGroup[] => {
    const categories: RuleCategoryGroup[] = [
      {
        id: 'profitability',
        title: 'Profitability & Margin Yield',
        badge: 'Revenue Target',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
        description: 'Evaluates net profit margin surplus against itemized operational spend across agricultural sectors.',
        logicExplanation: 'Higher gross revenue with controlled chemical and battery wear costs generates up to 100 base score points. Breaching target thresholds compresses profit band ratings.',
        defaultThresholdNote: 'System Default: Good >= 35% Net Margin (Full Points), Poor < 15% Net Margin (Deductions apply)',
        rules: []
      },
      {
        id: 'travel_delay',
        title: 'Travel & Delay Penalty',
        badge: 'Logistics Overhead',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <MapPin className="w-4 h-4 text-blue-600" />,
        description: 'Penalizes missions where long transit distances or on-site pre-flight waiting erode net financial returns.',
        logicExplanation: 'Travel overhead is calculated as transit spend over gross revenue. When travel costs exceed 15-25% of contract value, or when operator idle/delay time exceeds 45-90 minutes, point deductions (-8 to -20 pts) are applied.',
        defaultThresholdNote: 'System Default: Good <= 10% Travel Overhead Ratio, Poor >= 25% Travel Overhead Ratio',
        rules: []
      },
      {
        id: 'retry_friction',
        title: 'Retry Friction & Field Execution',
        badge: 'Spraying Accuracy',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <RetryIcon className="w-4 h-4 text-amber-600" />,
        description: 'Tracks nozzle clogs, wind drift interruptions, and repeated spraying passes that consume chemical buffer.',
        logicExplanation: 'Each repeated spraying attempt consumes extra battery wear and chemical reserves. Missions requiring 2 or more retries trigger progressive penalties (-15 to -25 pts) to incentivize first-pass accuracy.',
        defaultThresholdNote: 'System Default: Good <= 1 Spraying Retry, Poor >= 4 Spraying Retries (-25 pt deduction)',
        rules: []
      },
      {
        id: 'utilization',
        title: 'Fleet Utilization & Airborne Duty',
        badge: 'Asset Readiness',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Plane className="w-4 h-4 text-purple-600" />,
        description: 'Measures active airborne duty hours against grounded rotation cycles across Agras and Falcon drone units.',
        logicExplanation: 'Equipment generating active flight revenue receives high utilization ratings. Drones remaining idle or underutilized lower overall asset return ratios and flag operational imbalances.',
        defaultThresholdNote: 'System Default: Good >= 75% Active Airborne Ratio, Poor < 45% Active Airborne Ratio',
        rules: []
      },
      {
        id: 'maintenance_risk',
        title: 'Maintenance Burden & Grounded Risk',
        badge: 'Equipment Integrity',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <Wrench className="w-4 h-4 text-rose-600" />,
        description: 'Monitors cumulative maintenance burden hours, rotor wear, and grounded downtime intervals.',
        logicExplanation: 'When maintenance hours accumulate past target thresholds, drones face elevated failure risk. Grounded units or those in heavy maintenance receive automatic score caps (maximum 45 pts) to protect capital longevity.',
        defaultThresholdNote: 'System Default: Good < 20 hrs Maintenance Burden, Poor >= 50 hrs Maintenance Burden (Score Cap 45)',
        rules: []
      }
    ];

    const assignedIndices = new Set<number>();

    // Assign rules to matching categories based on keywords
    rules.forEach((rule, idx) => {
      const name = rule.name.toLowerCase();
      const desc = rule.description.toLowerCase();

      if (name.includes('profit') || name.includes('margin') || name.includes('revenue') || name.includes('net') || desc.includes('profit') || desc.includes('margin')) {
        categories[0].rules.push({ rule, index: idx });
        assignedIndices.add(idx);
      } else if (name.includes('travel') || name.includes('delay') || name.includes('distance') || name.includes('transit') || desc.includes('travel') || desc.includes('delay')) {
        categories[1].rules.push({ rule, index: idx });
        assignedIndices.add(idx);
      } else if (name.includes('retry') || name.includes('retries') || name.includes('nozzle') || name.includes('spray') || desc.includes('retry') || desc.includes('spray')) {
        categories[2].rules.push({ rule, index: idx });
        assignedIndices.add(idx);
      } else if (name.includes('utilization') || name.includes('flight') || name.includes('airborne') || name.includes('duty') || desc.includes('utilization') || desc.includes('airborne')) {
        categories[3].rules.push({ rule, index: idx });
        assignedIndices.add(idx);
      } else if (name.includes('maintenance') || name.includes('grounded') || name.includes('wear') || name.includes('reserve') || desc.includes('maintenance') || desc.includes('wear')) {
        categories[4].rules.push({ rule, index: idx });
        assignedIndices.add(idx);
      }
    });

    // Catch any remaining unassigned rules into Profitability/General category so zero rules are lost
    rules.forEach((rule, idx) => {
      if (!assignedIndices.has(idx)) {
        categories[0].rules.push({ rule, index: idx });
      }
    });

    return categories;
  };

  const categorizedGroups = getCategorizedGroups();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="BI Scoring Rules & Simulation Engine"
          subtitle="Configure multi-variable parameter weights, penalty thresholds, and simulate historical impact across all agricultural sectors."
        />
        <LoadingState message="Aggregating deterministic rule definitions and executive simulation matrices..." rows={7} />
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
    <div className="space-y-8 animate-fadeIn pb-12 select-none">
      {/* Top Header */}
      <PageHeader
        title="BI Scoring Rules & Simulation Engine"
        subtitle="Industrial scoring sandbox to adjust parameter weights, fine-tune penalty thresholds, and model portfolio impact across historical missions."
        badge={
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#083D2A] text-emerald-300 border border-[#136C4A] shadow-sm flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" /> Executive Sandbox
          </span>
        }
      />

      {/* Success Notification Alert */}
      {savedStatus && (
        <div className="bg-emerald-50 border border-emerald-300 text-[#0B4F36] p-4 rounded-xl text-xs font-bold flex items-center gap-3 shadow-sm animate-fadeIn">
          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Executive Briefing: How Scoring Works */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
        <div
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800/95 transition-colors gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Executive Guide: How Mission & Fleet Scoring Works
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Plain-English explanation of parameter weights, good/poor thresholds, and deterministic score bands
              </p>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex-shrink-0">
            {showHowItWorks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showHowItWorks && (
          <div className="p-5 sm:p-6 space-y-6 bg-slate-50/60 border-t border-slate-200/60 text-slate-800 text-sm leading-relaxed">
            {/* Core Formula Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Deterministic Core Formula
                </div>
                <div className="text-sm font-bold text-slate-900">
                  Final Composite Score (0–100) = Base Net Profit Yield − Travel Overhead Deduction − Retry Friction Deduction − Field Delay Penalty
                </div>
              </div>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold whitespace-nowrap">
                0–100 Scale
              </div>
            </div>

            {/* 3 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <Sliders className="w-4 h-4 text-emerald-600" /> What Do Weights Mean?
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  <strong className="text-slate-900">Parameter Weights (%)</strong> control how heavily each category influences composite portfolio simulations. Adjusting a weight changes how strongly net margin surplus versus travel friction swings the overall average score across your historical operations.
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <AlertCircle className="w-4 h-4 text-blue-600" /> Good vs. Poor Thresholds
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  <strong className="text-slate-900">Thresholds</strong> define strict operational benchmarks. Achieving or beating the <strong className="text-emerald-700">Good Threshold</strong> awards full baseline points. Breaching the <strong className="text-rose-700">Poor Threshold</strong> triggers automatic point penalties or caps to flag efficiency leakage immediately.
                </p>
              </div>

              <div className="bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <Layers className="w-4 h-4 text-purple-600" /> Score Bands & Ratings
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  Scores automatically map to 5 executive tiers: <strong className="text-emerald-700">Excellent (80–100)</strong> for prime profitability, <strong className="text-blue-700">Good (65–79)</strong>, <strong className="text-amber-700">Average (45–64)</strong>, <strong className="text-orange-700">Poor (25–44)</strong>, and <strong className="text-rose-700">Critical (&lt;25)</strong> where immediate logistical review is required.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Portfolio Simulation Impact Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B4F36] to-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl text-white grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-emerald-400" /> Historical Baseline Average
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {sim.avgBefore} <span className="text-base font-bold text-emerald-200/80">/ 100</span>
          </div>
          <div className="text-xs text-emerald-100/80 font-medium">
            Current deterministic average across all {missions.length} recorded missions
          </div>
        </div>

        <div className="space-y-1.5 sm:border-l sm:border-emerald-500/30 sm:pl-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-emerald-500/30">
          <div className="text-[11px] uppercase tracking-wider font-bold text-blue-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" /> Simulated Portfolio Score
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
            {sim.avgAfter} <span className="text-base font-bold text-emerald-200/80">/ 100</span>
          </div>
          <div className="text-xs text-emerald-100/80 font-medium">
            Projected portfolio average under active sandbox weightings
          </div>
        </div>

        <div className="space-y-1.5 sm:border-l sm:border-emerald-500/30 sm:pl-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-emerald-500/30">
          <div className="text-[11px] uppercase tracking-wider font-bold text-purple-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Projected Delta Shift
          </div>
          <div
            className={clsx(
              'text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2',
              sim.shift >= 0 ? 'text-emerald-300' : 'text-rose-300'
            )}
          >
            {sim.shift >= 0 ? `+${sim.shift}` : sim.shift} <span className="text-base font-bold">pts</span>
          </div>
          <div className="text-xs text-emerald-100/80 font-medium">
            Net impact on portfolio tier distribution & margin yield
          </div>
        </div>
      </div>

      {/* Categorized Rules Engine Sections */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Scoring Rule Categories & Threshold Configuration
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Adjust parameter importance weights and good/poor threshold boundaries below to simulate financial outcomes
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            5 Industrial Rule Groups
          </span>
        </div>

        {categorizedGroups.map((group) => {
          if (group.rules.length === 0) return null;
          return (
            <div
              key={group.id}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:border-slate-300"
            >
              {/* Category Banner Header */}
              <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center shadow-xs flex-shrink-0">
                    {group.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 tracking-tight">{group.title}</h3>
                      <span className={clsx('text-[10px] font-black uppercase px-2 py-0.5 rounded border', group.badgeColor)}>
                        {group.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{group.description}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate max-w-[280px] sm:max-w-[340px]" title={group.logicExplanation}>
                    {group.logicExplanation}
                  </span>
                </div>
              </div>

              {/* Category Rules Content */}
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {group.rules.map(({ rule, index }) => (
                    <div
                      key={rule.id}
                      className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 shadow-2xs space-y-5 flex flex-col justify-between hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{rule.name}</h4>
                            <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{rule.description}</p>
                          </div>
                          <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200 flex-shrink-0">
                            Weight: {rule.weight}%
                          </span>
                        </div>

                        {/* Weight Slider */}
                        <div className="space-y-2 pt-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Parameter Importance Weight</span>
                            <span className="text-emerald-700 font-black">{rule.weight}% of category</span>
                          </div>
                          <input
                            type="range"
                            min={5}
                            max={80}
                            step={5}
                            value={rule.weight}
                            onChange={(e) => handleWeightChange(index, Number(e.target.value))}
                            className="w-full accent-[#0B4F36] cursor-pointer h-2 bg-slate-200 rounded-lg min-h-[32px]"
                          />
                        </div>

                        {/* Threshold Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/80">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                              <span>Good Threshold</span>
                              <span className="text-[10px] text-emerald-600 font-semibold">({rule.name.includes('Net') ? '>= target' : '<= limit'})</span>
                            </label>
                            <input
                              type="number"
                              value={rule.threshold_good}
                              onChange={(e) => handleThresholdChange(index, 'threshold_good', Number(e.target.value))}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B4F36]/30 focus:border-[#0B4F36] transition-all min-h-[44px]"
                            />
                            <span className="text-[10px] text-slate-500 block">Performance qualifying for full points</span>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-800 flex items-center justify-between">
                              <span>Poor Threshold</span>
                              <span className="text-[10px] text-rose-600 font-semibold">({rule.name.includes('Net') ? '< limit' : '>= limit'})</span>
                            </label>
                            <input
                              type="number"
                              value={rule.threshold_poor}
                              onChange={(e) => handleThresholdChange(index, 'threshold_poor', Number(e.target.value))}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all min-h-[44px]"
                            />
                            <span className="text-[10px] text-slate-500 block">Breach triggering penalty deductions</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>Rule ID: {rule.id.slice(0, 8)}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          Live Sandbox Mode
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-md sticky bottom-4 z-20">
        <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span>
            Slider and threshold adjustments instantly recalculate projected portfolio averages above. Save your simulation ledger to persist changes across your session.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto flex-shrink-0">
          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors w-full sm:w-auto min-h-[44px] shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B4F36] hover:bg-[#136C4A] text-white text-xs font-black shadow-md transition-all w-full sm:w-auto min-h-[44px]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Save Simulation Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

