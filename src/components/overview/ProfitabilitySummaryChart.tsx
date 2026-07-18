import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { Mission } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface ProfitabilitySummaryChartProps {
  missions: Mission[];
}

export const ProfitabilitySummaryChart: React.FC<ProfitabilitySummaryChartProps> = ({ missions }) => {
  // Aggregate revenue and cost by date or mission code for top 8 recent missions
  const chartData = missions.slice(0, 8).reverse().map(m => {
    const revenue = Number(m.revenue_pkr || 0);
    let totalCost = 0;
    (m.costs || []).forEach(c => totalCost += Number(c.amount_pkr || 0));
    const profit = revenue - totalCost;

    return {
      name: m.code.replace('MSN-2026-', '#'),
      location: m.location,
      crop: m.crop_type,
      Revenue: revenue,
      Cost: totalCost,
      Profit: profit,
    };
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue vs. Total Cost by Mission
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparing gross contract revenue against itemized labor, travel, chemicals, and retry costs
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
          Recent 8 Missions
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => formatPKR(val, true)}
            />
            <Tooltip
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
              formatter={(value: any) => [formatPKR(Number(value)), '']}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `Mission ${label} (${data.crop} - ${data.location})`;
                }
                return `Mission ${label}`;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar dataKey="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Gross Revenue" />
            <Bar dataKey="Cost" fill="#64748b" radius={[4, 4, 0, 0]} name="Total Cost" />
            <Bar dataKey="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Net Surplus" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
