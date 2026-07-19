import React, { useEffect, useState } from 'react';
import type { Drone, MaintenanceLog } from '../types';
import { dataApi } from '../lib/supabase';
import { computeFleetUtilizationScore } from '../utils/scoring';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { formatPKR, formatDate } from '../utils/formatters';
import { Plane, Clock, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const FleetUtilizationPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFleetData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dList, mLogs] = await Promise.all([
        dataApi.getDrones(),
        dataApi.getMaintenanceLogs(),
      ]);
      setDrones(dList);
      setLogs(mLogs);
    } catch (err: any) {
      console.error('Failed to load fleet utilization records:', err);
      setError(err.message || 'Could not query fleet database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFleetData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Fleet Utilization & Maintenance Analytics"
          subtitle="Tracking active flight hours, idle overhead, and maintenance depreciation across Agras and Falcon-X hardware."
        />
        <LoadingState message="Calculating fleet utilization rates and depreciation burdens..." rows={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fleet Utilization & Maintenance Analytics" />
        <ErrorState title="Fleet Database Error" message={error} onRetry={loadFleetData} />
      </div>
    );
  }

  // Compute fleet KPI summary
  const activeCount = drones.filter((d) => d.status === 'active').length;
  const maintenanceCount = drones.filter((d) => d.status === 'maintenance').length;
  let totalHours = 0;
  let totalScore = 0;
  drones.forEach((d) => {
    totalHours += d.total_flight_hours;
    const res = computeFleetUtilizationScore(d);
    totalScore += res.score;
  });
  const avgScore = drones.length > 0 ? Math.round(totalScore / drones.length) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Fleet Utilization & Maintenance Analytics"
        subtitle="Evaluating active airborne duty cycles against maintenance downtime burdens and hourly depreciation across Agras T40 and Falcon-X hardware."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm">
            {drones.length} Hardware Units
          </span>
        }
      />

      {/* Fleet KPI Header Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Hardware Fleet"
          value={`${drones.length} Units`}
          subtitle="Agras T40/T20P & Falcon-X"
          icon={<Plane className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Active Airborne Duty"
          value={`${activeCount} Drones`}
          subtitle="Flight-ready for deployment"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="positive"
        />
        <StatCard
          title="In Maintenance Cycle"
          value={`${maintenanceCount} Drones`}
          subtitle="Grounded for overhaul"
          icon={<Wrench className="w-5 h-5" />}
          variant={maintenanceCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Avg Utilization Score"
          value={`${avgScore} / 100`}
          subtitle="Airborne vs maintenance burden"
          icon={<Clock className="w-5 h-5" />}
          variant={avgScore >= 75 ? 'positive' : 'warning'}
        />
      </div>

      {/* Hardware Utilization Directory Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hardware Fleet Duty & Depreciation Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic scoring evaluates operational flight hours against downtime and maintenance burden
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600 self-start sm:self-auto">
            Real-Time Telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="py-4 px-6">Hardware Model / Serial</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Airborne Flight Hrs</th>
                <th className="py-4 px-4 text-right">Maintenance Burden</th>
                <th className="py-4 px-4 text-right">Hourly Depreciation</th>
                <th className="py-4 px-6 text-center">Utilization Score</th>
                <th className="py-4 px-6">Scoring Rationale / Guidance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {drones.map((d) => {
                const scoring = computeFleetUtilizationScore(d);
                return (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {d.serial_number}
                      </div>
                      <div className="text-[11px] text-slate-400 pl-6">{d.model}</div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          d.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {d.total_flight_hours.toFixed(1)} hrs
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">
                      {d.maintenance_burden_hours.toFixed(1)} hrs
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {formatPKR(d.hourly_depreciation_cost_pkr)} / hr
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <ScoreBadge score={scoring.score} band={scoring.band} size="sm" />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="text-[11px] font-medium text-slate-700 max-w-sm whitespace-normal">
                        {scoring.reasons[0] || 'Nominal operational status.'}
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

      {/* Maintenance & Repair Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-500" /> Recent Maintenance & Overhaul Ledger
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemizing repair costs and downtime hours across hardware maintenance cycles
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 px-2.5 py-1 rounded text-slate-600 self-start sm:self-auto">
            {logs.length} Maintenance Events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="py-3.5 px-6">Date & Hardware Unit</th>
                <th className="py-3.5 px-6">Component / Overhaul Description</th>
                <th className="py-3.5 px-4 text-right">Downtime (Hours)</th>
                <th className="py-3.5 px-6 text-right">Repair Cost (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{formatDate(log.date)}</div>
                    <div className="text-[11px] text-slate-400">
                      {log.drone?.serial_number || 'Agras Unit'} ({log.drone?.model || 'Drone'})
                    </div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-700 max-w-md whitespace-nowrap">
                    {log.description}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-700 whitespace-nowrap">
                    {log.hours_down.toFixed(1)} hrs down
                  </td>
                  <td className="py-3.5 px-6 text-right font-black text-slate-900 whitespace-nowrap">
                    {formatPKR(log.cost_pkr, true)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
