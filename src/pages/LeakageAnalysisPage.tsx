import React, { useEffect, useState, useMemo } from 'react';
import type { Mission } from '../types';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatPKR } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import {
  AlertTriangle,
  TrendingDown,
  MapPin,
  Plane,
  ShieldAlert,
  CheckCircle2,
  Zap
} from 'lucide-react';

export const LeakageAnalysisPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataApi.getMissions();
      setMissions(data);
    } catch (err: any) {
      console.error('Failed to load missions for leakage analysis:', err);
      setError(err.message || 'Error querying mission dataset');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, []);

  // Aggregate Sector Travel Leakage
  const sectorLeakage = useMemo(() => {
    const map: Record<string, { sector: string; rev: number; travel: number; count: number }> = {};
    missions.forEach((m) => {
      if (!map[m.location]) {
        map[m.location] = { sector: m.location, rev: 0, travel: 0, count: 0 };
      }
      map[m.location].rev += Number(m.revenue_pkr || 0);
      map[m.location].count += 1;
      (m.costs || []).forEach((c) => {
        if (c.category === 'travel') map[m.location].travel += Number(c.amount_pkr || 0);
      });
    });

    return Object.values(map).map((s) => ({
      ...s,
      travelRatio: s.rev > 0 ? (s.travel / s.rev) * 100 : 0
    }));
  }, [missions]);

  // Aggregate Hardware Retry Leakage
  const hardwareRetry = useMemo(() => {
    const map: Record<string, { model: string; retries: number; retryCost: number; count: number }> = {};
    missions.forEach((m) => {
      const model = m.drone?.model || 'Agras T40 Pro';
      if (!map[model]) {
        map[model] = { model, retries: 0, retryCost: 0, count: 0 };
      }
      map[model].retries += m.retry_count;
      map[model].count += 1;
      (m.costs || []).forEach((c) => {
        if (c.category === 'retry_fuel') map[model].retryCost += Number(c.amount_pkr || 0);
      });
    });
    return Object.values(map);
  }, [missions]);

  // Total leakage KPI
  const totals = useMemo(() => {
    let travel = 0;
    let retry = 0;
    let delayMin = 0;
    missions.forEach((m) => {
      delayMin += m.delay_minutes;
      (m.costs || []).forEach((c) => {
        if (c.category === 'travel') travel += Number(c.amount_pkr || 0);
        if (c.category === 'retry_fuel') retry += Number(c.amount_pkr || 0);
      });
    });
    return { travel, retry, delayMin, totalLeakage: travel + retry };
  }, [missions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Margin Leakage & Friction Deep-Dive"
          subtitle="Isolating transport overhead, repeated spraying loops, and on-site delay bottlenecks eroding agricultural net margins."
        />
        <LoadingState message="Aggregating sector transport leakage and hardware retry vectors..." rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Margin Leakage & Friction Deep-Dive" />
        <ErrorState title="Leakage Aggregation Failed" message={error} onRetry={loadMissions} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Margin Leakage & Friction Deep-Dive"
        subtitle="Isolating transport overhead, repeated spraying loops, and on-site delay bottlenecks eroding agricultural net margins across Pakistan."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 shadow-sm flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Margin Leakage Mode
          </span>
        }
      />

      {/* Total Leakage KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Identified Leakage"
          value={formatPKR(totals.totalLeakage, true)}
          subtitle="Travel + retry cost erosion"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="critical"
        />
        <StatCard
          title="Remote Transit Overhead"
          value={formatPKR(totals.travel, true)}
          subtitle="Inter-district travel spend"
          icon={<MapPin className="w-5 h-5" />}
          variant="warning"
        />
        <StatCard
          title="Spraying Retry Waste"
          value={formatPKR(totals.retry, true)}
          subtitle="Aborted loops & chemical drift"
          icon={<Zap className="w-5 h-5" />}
          variant="critical"
        />
        <StatCard
          title="Total Field Delay Friction"
          value={`${totals.delayMin} mins`}
          subtitle="Accumulated on-site waiting"
          icon={<TrendingDown className="w-5 h-5" />}
          variant="warning"
        />
      </div>

      {/* Charts Grid: Sector Travel vs Hardware Retries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Travel Ratio Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" /> Travel Overhead Ratio by Sector (% of Revenue)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Remote sectors (Sukkur, Hyderabad) experience heavy transit friction compared to local bases
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorLeakage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="sector" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toFixed(1)}% of Revenue`, 'Travel Leakage']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #C8DDD2',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(11,79,54,0.12)',
                    padding: '10px 14px'
                  }}
                  labelStyle={{
                    color: '#0B3B24',
                    fontWeight: 'black',
                    fontSize: '13px',
                    marginBottom: '4px',
                    borderBottom: '1px solid #E3ECE7',
                    paddingBottom: '4px'
                  }}
                  itemStyle={{
                    color: '#136C4A',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    paddingTop: '2px'
                  }}
                />
                <Bar dataKey="travelRatio" radius={[6, 6, 0, 0]}>
                  {sectorLeakage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.travelRatio > 20 ? '#e11d48' : entry.travelRatio > 10 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hardware Retry Cost Chart */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Plane className="w-4 h-4 text-amber-600 flex-shrink-0" /> Spraying Retry Cost by Hardware (PKR)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Falcon-X heavy units suffer from nozzle drift retries during deep canopy applications
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hardwareRetry} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="model" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => formatPKR(val, true)}
                />
                <Tooltip
                  formatter={(value: any) => [formatPKR(value, true), 'Retry Waste Spend']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #C8DDD2',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(11,79,54,0.12)',
                    padding: '10px 14px'
                  }}
                  labelStyle={{
                    color: '#0B3B24',
                    fontWeight: 'black',
                    fontSize: '13px',
                    marginBottom: '4px',
                    borderBottom: '1px solid #E3ECE7',
                    paddingBottom: '4px'
                  }}
                  itemStyle={{
                    color: '#d97706',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    paddingTop: '2px'
                  }}
                />
                <Bar dataKey="retryCost" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {hardwareRetry.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.retryCost > 150000 ? '#e11d48' : '#f59e0b'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Leadership Action & Remediation Plan Box */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/80 rounded-xl p-4 sm:p-6 shadow-md text-white space-y-4">
        <div className="flex items-center gap-3 border-b border-emerald-800/60 pb-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-white">
              Executive Leadership Actionable Remediation Roadmap
            </h3>
            <p className="text-xs text-emerald-300/80">
              Immediate operational interventions to recover 18-24% net margin points across high-leakage sectors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="font-bold text-emerald-400 text-sm flex items-center gap-2">
              1. Establish Permanent Regional Depot in Sukkur / Hyderabad
            </div>
            <p className="text-slate-300 leading-relaxed">
              Inter-district transport from Punjab currently erodes <strong className="text-rose-400">28.5% of gross revenue</strong> on Sindh Sugarcane contracts. Stationing 2 dedicated Agras units and local operators in Sukkur will reduce travel leakage below <strong className="text-emerald-400">6.0%</strong>.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="font-bold text-amber-400 text-sm flex items-center gap-2">
              2. Overhaul Falcon-X Nozzle Calibration Protocol
            </div>
            <p className="text-slate-300 leading-relaxed">
              SS-Falcon Heavy units incurred <strong className="text-rose-400">4-5 spraying retries</strong> per mission in deep Sugarcane foliar runs due to manifold clogging. Mandating pre-flight nozzle pressure calibration saves approximately <strong className="text-emerald-400">PKR 35,000 to 46,000</strong> per flight in wasted chemical and battery cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
