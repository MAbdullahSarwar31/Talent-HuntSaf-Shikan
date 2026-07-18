import React, { useState, useEffect } from 'react';
import type { Mission } from '../types';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatPKR } from '../utils/formatters';
import {
  FileText,
  Download,
  Filter,
  Loader2,
  Calendar,
  Sparkles,
  FileCheck
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Report config states
  const [reportType, setReportType] = useState<'executive' | 'leakage' | 'operator'>('executive');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');

  // Simulation states
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [generatedDate, setGeneratedDate] = useState<string | null>(null);

  const loadMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataApi.getMissions();
      setMissions(data);
    } catch (err: any) {
      console.error('Failed to load missions for reports:', err);
      setError(err.message || 'Error querying mission data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  const handleGenerateReport = () => {
    setGenerating(true);
    setReportReady(false);
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
      setGeneratedDate(new Date().toLocaleString());
    }, 1600);
  };

  const filteredSubset = missions.filter((m) => {
    const pMatch = selectedProvince === 'All' || m.province === selectedProvince;
    const cMatch = selectedCrop === 'All' || m.crop_type === selectedCrop;
    return pMatch && cMatch;
  });

  const summary = () => {
    let rev = 0;
    let cost = 0;
    let travel = 0;
    let retry = 0;
    filteredSubset.forEach((m) => {
      rev += Number(m.revenue_pkr || 0);
      (m.costs || []).forEach((c) => {
        const amt = Number(c.amount_pkr || 0);
        cost += amt;
        if (c.category === 'travel') travel += amt;
        if (c.category === 'retry_fuel') retry += amt;
      });
    });
    const profit = rev - cost;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    return { rev, cost, profit, margin, travel, retry };
  };

  const stats = summary();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Executive BI Report Generation Hub"
          subtitle="Compile board-ready executive summaries, leakage audits, and operator efficiency reports for download."
        />
        <LoadingState message="Connecting to financial ledgers and report templates..." rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive BI Report Generation Hub" />
        <ErrorState title="Report Hub Error" message={error} onRetry={loadMissions} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Executive BI Report Generation Hub"
        subtitle="Generate board-ready executive summaries, leakage audits, and operator efficiency packages across Pakistan."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Board-Ready Export
          </span>
        }
      />

      {/* Report Generator Configuration Box */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" /> Configure Report Parameters & Scope
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select report template, province filter, and crop target before generating board package
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Template Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Report Template
            </label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as any);
                setReportReady(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="executive">Executive Profitability Summary (Board Package)</option>
              <option value="leakage">Transport & Retry Margin Leakage Audit</option>
              <option value="operator">Operator & Fleet Efficiency Ledger</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Province Scope
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setReportReady(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="All">All Provinces (National Coverage)</option>
              <option value="Punjab">Punjab Sector Only</option>
              <option value="Sindh">Sindh Sector Only</option>
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              3. Target Crop Scope
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setReportReady(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="All">All Crops (Cotton, Wheat, Rice, Sugarcane)</option>
              <option value="Cotton">Cotton Only</option>
              <option value="Wheat">Wheat Only</option>
              <option value="Rice">Rice Only</option>
              <option value="Sugarcane">Sugarcane Only</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Targeting {filteredSubset.length} historical mission records matching filter criteria.</span>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating || filteredSubset.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Compiling Executive Package...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate & Export Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Report Preview & Download Card */}
      {reportReady && (
        <div className="bg-white border-2 border-emerald-500/60 rounded-xl overflow-hidden shadow-md animate-fadeIn">
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  {reportType === 'executive'
                    ? 'SAF SHIKAN Executive Profitability Briefing'
                    : reportType === 'leakage'
                    ? 'SAF SHIKAN Transport & Retry Leakage Audit'
                    : 'SAF SHIKAN Operator & Fleet Efficiency Ledger'}
                </h3>
                <p className="text-xs text-slate-400">
                  Compiled on {generatedDate} | Scope: {selectedProvince} Province, {selectedCrop} Sector ({filteredSubset.length} records)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Simulated PDF Download initiated for board presentation.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF Package
              </button>
              <button
                onClick={() => alert('Simulated CSV Ledger export initiated.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                <FileText className="w-4 h-4" /> Export CSV Ledger
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Executive Highlights Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</div>
                <div className="text-xl font-black text-slate-900 mt-1">{formatPKR(stats.rev, true)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Expenditure</div>
                <div className="text-xl font-black text-slate-700 mt-1">{formatPKR(stats.cost, true)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 uppercase">Net Profit Margin</div>
                <div className={`text-xl font-black mt-1 ${stats.margin >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {stats.margin.toFixed(1)}% ({formatPKR(stats.profit, true)})
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs font-bold text-slate-500 uppercase">Leakage Vector</div>
                <div className="text-xl font-black text-rose-600 mt-1">
                  {formatPKR(stats.travel + stats.retry, true)}
                </div>
              </div>
            </div>

            {/* Tabular Executive Preview */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200/80 text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Executive Preview Table (Top 5 Contracts in Package)</span>
                <span className="text-[11px] text-slate-400">Page 1 of Executive Report</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="py-3 px-5">Mission Code</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Crop</th>
                      <th className="py-3 px-4 text-right">Gross Revenue</th>
                      <th className="py-3 px-4 text-right">Total Cost</th>
                      <th className="py-3 px-5 text-right">Net Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubset.slice(0, 5).map((m) => {
                      const r = Number(m.revenue_pkr || 0);
                      let c = 0;
                      (m.costs || []).forEach((item) => (c += Number(item.amount_pkr || 0)));
                      const p = r - c;
                      const mPct = r > 0 ? (p / r) * 100 : 0;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-5 font-bold text-slate-900">{m.code}</td>
                          <td className="py-3 px-4 text-slate-700">{m.location}, {m.province}</td>
                          <td className="py-3 px-4 font-medium text-emerald-800">{m.crop_type}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">{formatPKR(r, true)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{formatPKR(c, true)}</td>
                          <td className="py-3 px-5 text-right font-black text-emerald-600">{mPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
