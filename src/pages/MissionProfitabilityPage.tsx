import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Mission } from '../types';
import { ROUTES } from '../constants/routes';
import { dataApi } from '../lib/supabase';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ScoreBadge } from '../components/common/ScoreBadge';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { formatPKR, formatDate } from '../utils/formatters';
import {
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  MapPin,
  Plane,
  User,
  ArrowUpRight
} from 'lucide-react';

export const MissionProfitabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedBand, setSelectedBand] = useState<string>('All');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataApi.getMissions();
      setMissions(data);
    } catch (err: any) {
      console.error('Failed to load missions directory:', err);
      setError(err.message || 'Error fetching mission directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search logic
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.operator?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProvince = selectedProvince === 'All' || m.province === selectedProvince;
      const matchesCrop = selectedCrop === 'All' || m.crop_type === selectedCrop;
      const matchesBand = selectedBand === 'All' || m.profitability_score?.band === selectedBand;

      return matchesSearch && matchesProvince && matchesCrop && matchesBand;
    });
  }, [missions, searchQuery, selectedProvince, selectedCrop, selectedBand]);

  // Compute summary stats for current filtered subset
  const summaryStats = useMemo(() => {
    let rev = 0;
    let cost = 0;
    filteredMissions.forEach((m) => {
      rev += Number(m.revenue_pkr || 0);
      (m.costs || []).forEach((c) => {
        cost += Number(c.amount_pkr || 0);
      });
    });
    const profit = rev - cost;
    const margin = rev > 0 ? (profit / rev) * 100 : 0;
    return { rev, cost, profit, margin };
  }, [filteredMissions]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProvince('All');
    setSelectedCrop('All');
    setSelectedBand('All');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mission Profitability Directory"
          subtitle="Filter, search, and audit margin scores across all historical agricultural drone deployments."
        />
        <LoadingState message="Querying mission financial ledgers..." rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Mission Profitability Directory" />
        <ErrorState title="Directory Query Failed" message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <PageHeader
        title="Mission Profitability Directory"
        subtitle="Filter, search, and audit margin scores across all historical agricultural drone deployments across Pakistan."
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-emerald-400 border border-slate-700 shadow-sm">
            {filteredMissions.length} Missions Found
          </span>
        }
      />

      {/* Filtered Subset KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Filtered Gross Revenue"
          value={formatPKR(summaryStats.rev, true)}
          subtitle={`${filteredMissions.length} contracts selected`}
          icon={<DollarSign className="w-5 h-5" />}
          variant="positive"
        />
        <StatCard
          title="Filtered Total Cost"
          value={formatPKR(summaryStats.cost, true)}
          subtitle="Itemized operational spend"
          icon={<Activity className="w-5 h-5" />}
          variant="default"
        />
        <StatCard
          title="Filtered Net Surplus"
          value={formatPKR(summaryStats.profit, true)}
          subtitle={`Net Margin: ${summaryStats.margin.toFixed(1)}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant={summaryStats.margin >= 30 ? 'positive' : summaryStats.margin >= 15 ? 'warning' : 'critical'}
        />
        <StatCard
          title="Directory Coverage"
          value={`${filteredMissions.length} / ${missions.length}`}
          subtitle="Active filter subset"
          icon={<Layers className="w-5 h-5" />}
          variant="default"
        />
      </div>

      {/* Search & Multi-Dimensional Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, title, location, operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-center gap-3">
            {/* Province Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3 h-3" /> Province:
              </span>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-auto min-h-[44px]"
              >
                <option value="All">All Provinces</option>
                <option value="Punjab">Punjab</option>
                <option value="Sindh">Sindh</option>
              </select>
            </div>

            {/* Crop Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">Crop:</span>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-auto min-h-[44px]"
              >
                <option value="All">All Crops</option>
                <option value="Cotton">Cotton</option>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>

            {/* Profitability Band Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex-shrink-0">Band:</span>
              <select
                value={selectedBand}
                onChange={(e) => setSelectedBand(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-full sm:w-auto min-h-[44px]"
              >
                <option value="All">All Bands</option>
                <option value="excellent">Excellent (80-100)</option>
                <option value="good">Good (65-79)</option>
                <option value="average">Average (45-64)</option>
                <option value="poor">Poor (25-44)</option>
                <option value="critical">Critical (0-24)</option>
              </select>
            </div>

            {(searchQuery || selectedProvince !== 'All' || selectedCrop !== 'All' || selectedBand !== 'All') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors w-full sm:w-auto min-h-[44px]"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <EmptyState
          title="No missions match filter criteria"
          description="Try clearing or adjusting your search, province, crop, or profitability band filters to view records."
          actionLabel="Reset All Filters"
          onAction={resetFilters}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                  <th className="py-3.5 px-6">Mission Code / Title</th>
                  <th className="py-3.5 px-4">Sector & Crop</th>
                  <th className="py-3.5 px-4">Hardware & Operator</th>
                  <th className="py-3.5 px-4 text-right">Gross Revenue</th>
                  <th className="py-3.5 px-4 text-right">Total Cost</th>
                  <th className="py-3.5 px-4 text-right">Net Margin</th>
                  <th className="py-3.5 px-6 text-center">BI Score & Band</th>
                  <th className="py-3.5 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMissions.map((m) => {
                  const rev = Number(m.revenue_pkr || 0);
                  let cost = 0;
                  (m.costs || []).forEach((c) => (cost += Number(c.amount_pkr || 0)));
                  const profit = rev - cost;
                  const margin = rev > 0 ? (profit / rev) * 100 : 0;
                  const score = m.profitability_score?.score ?? 50;
                  const band = m.profitability_score?.band ?? 'average';

                  return (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`${ROUTES.ADMIN.BI_MISSIONS}/${m.id}`)}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                          {m.code}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{m.title}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {m.location}, {m.province}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400">{formatDate(m.date)}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                            {m.crop_type}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-700 flex items-center gap-1">
                          <Plane className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {m.drone?.serial_number || 'Agras Pro'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          {m.operator?.full_name || 'Assigned Crew'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatPKR(rev, true)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-slate-600 whitespace-nowrap">
                        {formatPKR(cost, true)}
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className={profit >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>
                          {profit >= 0 ? '+' : ''}
                          {formatPKR(profit, true)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">({margin.toFixed(1)}%)</div>
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <ScoreBadge score={score} band={band} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-500 transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
