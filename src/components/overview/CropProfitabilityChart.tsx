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
import type { Mission, CropType } from '../../types';
import { formatPKR } from '../../utils/formatters';

interface CropProfitabilityChartProps {
  missions: Mission[];
}

export const CropProfitabilityChart: React.FC<CropProfitabilityChartProps> = ({ missions }) => {
  // Aggregate averages across crop types
  const crops: CropType[] = ['Cotton', 'Wheat', 'Rice', 'Sugarcane'];

  const chartData = crops.map(crop => {
    const cropMissions = missions.filter(m => m.crop_type === crop);
    let totalRev = 0;
    let totalCost = 0;
    let totalTravel = 0;

    cropMissions.forEach(m => {
      totalRev += Number(m.revenue_pkr || 0);
      (m.costs || []).forEach(c => {
        totalCost += Number(c.amount_pkr || 0);
        if (c.category === 'travel') totalTravel += Number(c.amount_pkr || 0);
      });
    });

    const avgRev = cropMissions.length > 0 ? totalRev / cropMissions.length : 0;
    const avgCost = cropMissions.length > 0 ? totalCost / cropMissions.length : 0;
    const avgMargin = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : 0;

    return {
      name: crop,
      AvgRevenue: Math.round(avgRev),
      AvgCost: Math.round(avgCost),
      MarginPct: Number(avgMargin.toFixed(1)),
      missionsCount: cropMissions.length
    };
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Average Profitability by Crop Sector
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cotton in Multan leads profit margins; Sugarcane & Rice exhibit high travel leakage
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-600">
          Aggregated by Crop
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
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
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: any, name: any) => [
                name === 'MarginPct' ? `${value}%` : formatPKR(Number(value)),
                name === 'AvgRevenue' ? 'Avg Revenue' : name === 'AvgCost' ? 'Avg Cost' : 'Net Margin %'
              ]}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  const count = payload[0].payload.missionsCount;
                  return `${label} (${count} missions)`;
                }
                return label;
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
            <Bar dataKey="AvgRevenue" fill="#059669" radius={[4, 4, 0, 0]} name="Avg Revenue" />
            <Bar dataKey="AvgCost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Avg Total Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
