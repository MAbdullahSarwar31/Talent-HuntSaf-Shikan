import React from 'react';
import type { Mission } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { AlertTriangle, MapPin, RefreshCw, Clock } from 'lucide-react';

interface TopLeakageCardProps {
  missions: Mission[];
}

export const TopLeakageCard: React.FC<TopLeakageCardProps> = ({ missions }) => {
  let totalTravel = 0;
  let totalRetry = 0;
  let totalLaborDelay = 0;
  let totalRevenue = 0;

  missions.forEach(m => {
    totalRevenue += Number(m.revenue_pkr || 0);
    (m.costs || []).forEach(c => {
      if (c.category === 'travel') totalTravel += Number(c.amount_pkr || 0);
      if (c.category === 'retry_fuel') totalRetry += Number(c.amount_pkr || 0);
      if (c.category === 'operator_labor' && (m.delay_minutes > 0 || m.idle_time_minutes > 30)) {
        totalLaborDelay += Math.round(Number(c.amount_pkr || 0) * 0.4);
      }
    });
  });

  const totalLeakage = totalTravel + totalRetry + totalLaborDelay;
  const leakageRatio = totalRevenue > 0 ? (totalLeakage / totalRevenue) * 100 : 0;

  const items = [
    {
      label: 'Long-Haul Transit & Transport',
      amount: totalTravel,
      percentage: totalLeakage > 0 ? (totalTravel / totalLeakage) * 100 : 0,
      icon: MapPin,
      color: 'bg-rose-500',
      description: 'Heaviest impact in remote Sukkur & Hyderabad sectors'
    },
    {
      label: 'Field Spraying Retries & Stalls',
      amount: totalRetry,
      percentage: totalLeakage > 0 ? (totalRetry / totalLeakage) * 100 : 0,
      icon: RefreshCw,
      color: 'bg-amber-500',
      description: 'Driven by drift and nozzle clogs on Falcon-X fleet'
    },
    {
      label: 'Operational Field Delays & Idle Labor',
      amount: totalLaborDelay,
      percentage: totalLeakage > 0 ? (totalLaborDelay / totalLeakage) * 100 : 0,
      icon: Clock,
      color: 'bg-blue-500',
      description: 'Pre-flight battery setup and weather waiting friction'
    }
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Margin Leakage Sources
              </h3>
              <p className="text-xs text-slate-500">
                Where gross contract value is lost across operations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-rose-600">{formatPKR(totalLeakage, true)}</div>
            <div className="text-[11px] font-semibold text-slate-400">{leakageRatio.toFixed(1)}% of Revenue</div>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    {item.label}
                  </span>
                  <span className="font-bold text-slate-900">{formatPKR(item.amount)}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${Math.max(5, item.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{item.description}</span>
                  <span className="font-semibold">{item.percentage.toFixed(0)}% of leakage</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Primary recommendation:</span>
        <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          Regional Depot Stationing
        </span>
      </div>
    </div>
  );
};
