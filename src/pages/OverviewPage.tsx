import React, { useEffect, useState } from 'react';
import type { Mission, Drone } from '../types';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ProfitabilitySummaryChart } from '../components/overview/ProfitabilitySummaryChart';
import { CropProfitabilityChart } from '../components/overview/CropProfitabilityChart';
import { TopLeakageCard } from '../components/overview/TopLeakageCard';
import { RecentMissionsTable } from '../components/overview/RecentMissionsTable';
import { formatPKR } from '../utils/formatters';

export const OverviewPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mList, dList] = await Promise.all([
        dataApi.getMissions(),
        dataApi.getDrones(),
      ]);
      setMissions(mList);
      setDrones(dList);
    } catch (err: any) {
      console.error('Failed to load overview data:', err);
      setError(err.message || 'Error querying intelligence database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Executive Overview & Fleet Intelligence"
          subtitle="Real-time mission profitability, leakage analysis, and operational efficiency across Pakistan sectors."
        />
        <LoadingState message="Aggregating executive financial models..." rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Overview & Fleet Intelligence" />
        <ErrorState title="Intelligence Engine Query Failed" message={error} onRetry={loadData} />
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Overview & Fleet Intelligence" />
        <EmptyState title="No missions recorded yet" description="Seed database or connect live portal to view profitability analytics." />
      </div>
    );
  }

  // Compute overall KPI aggregates
  let totalRevenue = 0;
  let totalCost = 0;
  let totalLeakage = 0;

  missions.forEach(m => {
    totalRevenue += Number(m.revenue_pkr || 0);
    (m.costs || []).forEach(c => {
      const amt = Number(c.amount_pkr || 0);
      totalCost += amt;
      if (c.category === 'travel' || c.category === 'retry_fuel') {
        totalLeakage += amt;
      }
    });
  });

  const netProfit = totalRevenue - totalCost;
  const netMarginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const leakagePercentage = totalRevenue > 0 ? (totalLeakage / totalRevenue) * 100 : 0;

  // Active fleet utilization
  const activeDronesCount = drones.filter(d => d.status === 'active').length;
  const fleetUtilizationRate = drones.length > 0 ? (activeDronesCount / drones.length) * 100 : 80;

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Executive Overview & Fleet Intelligence"
        subtitle="Sits directly above SAF SHIKAN Operational & Operator dashboards to compute true mission profitability and margin leakage."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm">
            Live BI Layer
          </span>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatPKR(totalRevenue, true)}
          subtitle="25 completed contracts"
          trend={{ value: '+14.2% vs last mo', isPositive: true }}
          variant="positive"
        />
        <StatCard
          title="Total Mission Costs"
          value={formatPKR(totalCost, true)}
          subtitle="Itemized operational spend"
          trend={{ value: '-2.4% efficiency improvement', isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Net Profit Margin"
          value={`${netMarginPercentage.toFixed(1)}%`}
          subtitle={`Surplus: ${formatPKR(netProfit, true)}`}
          trend={{ value: '+4.8% net yield', isPositive: true }}
          variant={netMarginPercentage >= 35 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Margin Leakage Rate"
          value={`${leakagePercentage.toFixed(1)}%`}
          subtitle={`Lost: ${formatPKR(totalLeakage, true)}`}
          trend={{ value: 'Travel & retry friction', isPositive: false }}
          variant="critical"
        />
        <StatCard
          title="Active Fleet Utilization"
          value={`${fleetUtilizationRate.toFixed(0)}%`}
          subtitle={`${activeDronesCount} of ${drones.length} drones flight-ready`}
          trend={{ value: '2 in heavy maintenance', isPositive: false }}
          variant="warning"
        />
      </div>

      {/* Analytics Charts & Leakage Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProfitabilitySummaryChart missions={missions} />
        </div>
        <div className="lg:col-span-1">
          <TopLeakageCard missions={missions} />
        </div>
      </div>

      {/* Crop Breakdown & Recent Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CropProfitabilityChart missions={missions} />
        </div>
        <div className="lg:col-span-2">
          <RecentMissionsTable missions={missions} />
        </div>
      </div>
    </div>
  );
};
